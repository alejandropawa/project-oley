import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getListingFilters,
  isListingType,
  type ListingFilters,
} from "@/lib/listing-utils";
import {
  mapDbListingToListing,
  mapUiConditionToDb,
  mapUiContactPreferenceToDb,
  getListingSearchFields,
  priceToCents,
  type DbListingWithImages,
} from "@/lib/listings/mappers";
import { createListingSlug } from "@/lib/listings/slug";
import {
  getPublicListingImageUrl,
  uploadListingImage,
} from "@/lib/db/storage";
import type { CreateListingValues } from "@/lib/create-listing-validation";
import type { Listing } from "@/lib/mock-data";
import type { Database, Enums, TablesInsert } from "@/types/database";

export type ListingQueryResult = {
  listings: Listing[];
  source: "supabase" | "unavailable";
};

export type ListingDetailResult = {
  listing: Listing | null;
  source: "supabase" | "unavailable";
};

export async function getListings(
  filters: ListingFilters,
  supabase: SupabaseClient<Database> | null,
): Promise<ListingQueryResult> {
  if (!supabase) {
    return { listings: [], source: "unavailable" };
  }

  try {
    let query = supabase
      .from("listings")
      .select("*, listing_images(storage_path, sort_order, alt_text)")
      .eq("status", "active");

    if (filters.q.trim()) {
      const safeQuery = filters.q.trim().replace(/[%_]/g, "");
      query = query.or(
        `title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%,city.ilike.%${safeQuery}%`,
      );
    }

    if (filters.category) {
      query = query.eq("category_slug", filters.category);
    }

    if (filters.type && filters.type !== "all" && isListingType(filters.type)) {
      query = query.eq("type", filters.type);
    }

    if (filters.city) {
      query = query.eq("city", filters.city);
    }

    const min = Number(filters.min);
    const max = Number(filters.max);

    if (filters.min.trim() && Number.isFinite(min)) {
      query = query.gte("price_cents", Math.round(min * 100));
    }

    if (filters.max.trim() && Number.isFinite(max)) {
      query = query.lte("price_cents", Math.round(max * 100));
    }

    if (filters.sort === "price-asc") {
      query = query.order("price_cents", {
        ascending: true,
        nullsFirst: false,
      });
    } else if (filters.sort === "price-desc") {
      query = query.order("price_cents", {
        ascending: false,
        nullsFirst: false,
      });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query.limit(80);

    if (error) {
      console.error("Supabase listings query failed", error);
      return { listings: [], source: "unavailable" };
    }

    return {
      listings: (data ?? []).map((row) =>
        mapDbListingToListing(row as unknown as DbListingWithImages, (path) =>
          getPublicListingImageUrl(supabase, path),
        ),
      ),
      source: "supabase",
    };
  } catch (error) {
    console.error("Supabase listings query failed", error);
    return { listings: [], source: "unavailable" };
  }
}

export async function getListingBySlug(
  slug: string,
  supabase: SupabaseClient<Database> | null,
): Promise<ListingDetailResult> {
  if (!supabase) {
    return { listing: null, source: "unavailable" };
  }

  try {
    const { data, error } = await supabase
      .from("listings")
      .select("*, listing_images(storage_path, sort_order, alt_text)")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("Supabase listing detail query failed", error);
      return { listing: null, source: "unavailable" };
    }

    return {
      listing: data
        ? mapDbListingToListing(data as unknown as DbListingWithImages, (path) =>
            getPublicListingImageUrl(supabase, path),
          )
        : null,
      source: "supabase",
    };
  } catch (error) {
    console.error("Supabase listing detail query failed", error);
    return { listing: null, source: "unavailable" };
  }
}

export async function getListingsByCategory(
  categorySlug: string,
  filters: ListingFilters,
  supabase: SupabaseClient<Database> | null,
) {
  return getListings({ ...filters, category: categorySlug }, supabase);
}

export async function getListingsByCity(
  city: string,
  filters: ListingFilters,
  supabase: SupabaseClient<Database> | null,
) {
  return getListings({ ...filters, city }, supabase);
}

export async function getListingsByCategoryAndCity(
  categorySlug: string,
  city: string,
  filters: ListingFilters,
  supabase: SupabaseClient<Database> | null,
) {
  return getListings({ ...filters, category: categorySlug, city }, supabase);
}

export async function getCityListingCounts(
  cityNames: string[],
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase || cityNames.length === 0) {
    return { counts: new Map<string, number>(), source: "unavailable" as const };
  }

  try {
    const { data, error } = await supabase
      .from("listings")
      .select("city")
      .eq("status", "active")
      .in("city", cityNames)
      .limit(2000);

    if (error) {
      console.error("Supabase city count query failed", error);
      return { counts: new Map<string, number>(), source: "unavailable" as const };
    }

    const counts = new Map<string, number>();

    for (const city of cityNames) {
      counts.set(city, 0);
    }

    for (const row of data ?? []) {
      counts.set(row.city, (counts.get(row.city) ?? 0) + 1);
    }

    return { counts, source: "supabase" as const };
  } catch (error) {
    console.error("Supabase city count query failed", error);
    return { counts: new Map<string, number>(), source: "unavailable" as const };
  }
}

export async function getActiveListingsForSitemap(
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { listings: [], source: "unavailable" as const };
  }

  try {
    const { data, error } = await supabase
      .from("listings")
      .select("slug, updated_at, created_at, status")
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("Supabase sitemap listings query failed", error);
      return { listings: [], source: "unavailable" as const };
    }

    return { listings: data ?? [], source: "supabase" as const };
  } catch (error) {
    console.error("Supabase sitemap listings query failed", error);
    return { listings: [], source: "unavailable" as const };
  }
}

export async function getPublicListingForMetadata(
  slug: string,
  supabase: SupabaseClient<Database> | null,
) {
  return getListingBySlug(slug, supabase);
}

export async function getUserListings(
  userId: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("listings")
      .select("*, listing_images(storage_path, sort_order, alt_text)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase user listings query failed", error);
      return [];
    }

    return (data ?? []).map((row) =>
      mapDbListingToListing(row as unknown as DbListingWithImages, (path) =>
        getPublicListingImageUrl(supabase, path),
      ),
    );
  } catch (error) {
    console.error("Supabase user listings query failed", error);
    return [];
  }
}

export async function getUserListingById(
  listingId: string,
  userId: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("listings")
      .select("*, listing_images(storage_path, sort_order, alt_text)")
      .eq("id", listingId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapDbListingToListing(data as unknown as DbListingWithImages, (path) =>
      getPublicListingImageUrl(supabase, path),
    );
  } catch (error) {
    console.error("Supabase user listing detail query failed", error);
    return null;
  }
}

export async function updateListingAttributeDetails(
  listingId: string,
  userId: string,
  input: Pick<
    Listing,
    | "attributes"
    | "brand"
    | "model"
    | "year"
    | "publicLatitude"
    | "publicLongitude"
    | "locationPrecision"
    | "locationLabel"
  > & {
    latitude?: number | null;
    longitude?: number | null;
    city?: string;
    county?: string;
    citySlug?: string | null;
    countySlug?: string | null;
  },
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" };
  }

  const { error } = await supabase
    .from("listings")
    .update({
      attributes: input.attributes ?? {},
      brand: input.brand ?? null,
      model: input.model ?? null,
      year: input.year ?? null,
      city: input.city,
      county: input.county,
      city_slug: input.citySlug,
      county_slug: input.countySlug,
      latitude: input.locationPrecision === "city" ? null : input.latitude,
      longitude: input.locationPrecision === "city" ? null : input.longitude,
      public_latitude: input.publicLatitude ?? null,
      public_longitude: input.publicLongitude ?? null,
      location_precision: input.locationPrecision ?? "city",
      location_label: input.locationLabel?.trim() || null,
    })
    .eq("id", listingId)
    .eq("user_id", userId);

  return { error: error ? "UPDATE_LISTING_FAILED" : null };
}

export async function createListing(
  input: CreateListingValues,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { listing: null, error: "SUPABASE_NOT_CONFIGURED" };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { listing: null, error: "NOT_AUTHENTICATED" };
  }

  const slug = createListingSlug(input.title);
  const searchFields = getListingSearchFields(input);
  const insert: TablesInsert<"listings"> = {
    user_id: user.id,
    title: input.title.trim(),
    slug,
    description: input.description.trim(),
    category_slug: input.categorySlug,
    subcategory: input.subcategory || null,
    type: input.type || "sell",
    condition: mapUiConditionToDb(input.condition),
    status: "active",
    price_cents: priceToCents(input.price),
    currency: input.currency,
    is_negotiable: input.negotiable,
    city: input.city,
    county: input.county,
    city_slug: searchFields.city_slug,
    county_slug: searchFields.county_slug,
    latitude: input.locationPrecision === "city" ? null : input.latitude,
    longitude: input.locationPrecision === "city" ? null : input.longitude,
    public_latitude: searchFields.public_latitude,
    public_longitude: searchFields.public_longitude,
    location_precision: input.locationPrecision,
    location_label: input.locationLabel.trim() || null,
    attributes: input.attributes,
    brand: searchFields.brand,
    model: searchFields.model,
    year: searchFields.year,
    search_text: searchFields.search_text,
    contact_preference: mapUiContactPreferenceToDb(input.contactPreference),
    published_at: new Date().toISOString(),
  };

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .insert(insert)
    .select("*")
    .single();

  if (listingError || !listing) {
    console.error("Supabase listing insert failed", listingError);
    return { listing: null, error: "CREATE_LISTING_FAILED" };
  }

  try {
    const imageRows = [];

    for (const [index, photo] of input.photos.slice(0, 8).entries()) {
      const storagePath = await uploadListingImage({
        supabase,
        userId: user.id,
        listingId: listing.id,
        file: photo.file,
        index,
      });

      imageRows.push({
        listing_id: listing.id,
        storage_path: storagePath,
        alt_text: input.title,
        sort_order: index,
      });
    }

    if (imageRows.length > 0) {
      const { error: imageError } = await supabase
        .from("listing_images")
        .insert(imageRows);

      if (imageError) {
        console.error("Supabase listing image insert failed", imageError);
        return { listing, error: "CREATE_LISTING_IMAGES_FAILED" };
      }
    }

    return { listing, error: null };
  } catch (error) {
    console.error("Supabase image upload failed", error);
    return { listing, error: "UPLOAD_IMAGES_FAILED" };
  }
}

export async function updateListingStatus(
  listingId: string,
  status: Enums<"listing_status">,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" };
  }

  const { error } = await supabase
    .from("listings")
    .update({ status })
    .eq("id", listingId);

  return { error: error ? "UPDATE_LISTING_FAILED" : null };
}

export async function deleteListing(
  listingId: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" };
  }

  const { error } = await supabase.from("listings").delete().eq("id", listingId);

  return { error: error ? "DELETE_LISTING_FAILED" : null };
}

export function emptyFilters(): ListingFilters {
  return getListingFilters({});
}
