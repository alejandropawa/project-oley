import type { SupabaseClient } from "@supabase/supabase-js";

import { getPublicListingImageUrl } from "@/lib/db/storage";
import { mapDbListingToListing, type DbListingWithImages } from "@/lib/listings/mappers";
import { promotionPackageSeeds } from "@/lib/promotions/pricing";
import type { Listing } from "@/lib/mock-data";
import type { Database, Tables, TablesInsert } from "@/types/database";

export type PromotionSource = "supabase" | "unavailable";

export type ActiveListingPromotion = Pick<
  Tables<"listing_promotions">,
  "id" | "listing_id" | "type" | "status" | "starts_at" | "ends_at" | "package_id"
> & {
  packageName?: string;
};

export type PromotionOrderWithDetails = Tables<"promotion_orders"> & {
  package: Tables<"promotion_packages"> | null;
  listing: Listing | null;
};

export type UserListingPromotionWithDetails = Tables<"listing_promotions"> & {
  package: Tables<"promotion_packages"> | null;
  listing: Listing | null;
};

type DbOrderWithDetails = Tables<"promotion_orders"> & {
  promotion_packages?: Tables<"promotion_packages"> | null;
  listings?: DbListingWithImages | null;
};

type DbListingPromotionWithDetails = Tables<"listing_promotions"> & {
  promotion_packages?: Tables<"promotion_packages"> | null;
  listings?: DbListingWithImages | null;
};

type DbPromotionWithPackage = Tables<"listing_promotions"> & {
  promotion_packages?: Pick<Tables<"promotion_packages">, "name"> | null;
};

export async function getActivePromotionPackages(
  supabase?: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return {
      packages: promotionPackageSeeds,
      source: "unavailable" as const,
    };
  }

  try {
    const { data, error } = await supabase
      .from("promotion_packages")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Supabase promotion packages query failed", error);
      return {
        packages: promotionPackageSeeds,
        source: "unavailable" as const,
      };
    }

    return {
      packages: data ?? [],
      source: "supabase" as const,
    };
  } catch (error) {
    console.error("Supabase promotion packages query failed", error);
    return {
      packages: promotionPackageSeeds,
      source: "unavailable" as const,
    };
  }
}

export async function getUserPromotionOrders(
  userId: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { orders: [], source: "unavailable" as const };
  }

  try {
    const { data, error } = await supabase
      .from("promotion_orders")
      .select(
        "*, promotion_packages(*), listings(*, listing_images(storage_path, sort_order, alt_text))",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Supabase user promotion orders failed", error);
      return { orders: [], source: "unavailable" as const };
    }

    return {
      orders: (data ?? []).map((row) =>
        mapOrderWithDetails(row as unknown as DbOrderWithDetails, supabase),
      ),
      source: "supabase" as const,
    };
  } catch (error) {
    console.error("Supabase user promotion orders failed", error);
    return { orders: [], source: "unavailable" as const };
  }
}

export async function getUserListingPromotions(
  userId: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { promotions: [], source: "unavailable" as const };
  }

  try {
    const { data, error } = await supabase
      .from("listing_promotions")
      .select(
        "*, promotion_packages(*), listings(*, listing_images(storage_path, sort_order, alt_text))",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Supabase user listing promotions failed", error);
      return { promotions: [], source: "unavailable" as const };
    }

    return {
      promotions: (data ?? []).map((row) =>
        mapListingPromotionWithDetails(
          row as unknown as DbListingPromotionWithDetails,
          supabase,
        ),
      ),
      source: "supabase" as const,
    };
  } catch (error) {
    console.error("Supabase user listing promotions failed", error);
    return { promotions: [], source: "unavailable" as const };
  }
}

export async function getActivePromotionForListing(
  listingId: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { promotion: null, source: "unavailable" as const };
  }

  try {
    const { data, error } = await supabase
      .from("listing_promotions")
      .select("*, promotion_packages(name)")
      .eq("listing_id", listingId)
      .eq("status", "active")
      .lte("starts_at", new Date().toISOString())
      .gt("ends_at", new Date().toISOString())
      .order("ends_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Supabase active promotion query failed", error);
      return { promotion: null, source: "unavailable" as const };
    }

    return {
      promotion: data ? mapPromotionWithPackage(data as unknown as DbPromotionWithPackage) : null,
      source: "supabase" as const,
    };
  } catch (error) {
    console.error("Supabase active promotion query failed", error);
    return { promotion: null, source: "unavailable" as const };
  }
}

export async function getActivePromotionsForListings(
  listingIds: string[],
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase || listingIds.length === 0) {
    return {
      promotions: new Map<string, ActiveListingPromotion>(),
      source: "unavailable" as const,
    };
  }

  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("listing_promotions")
      .select("*, promotion_packages(name)")
      .in("listing_id", listingIds)
      .eq("status", "active")
      .lte("starts_at", now)
      .gt("ends_at", now);

    if (error) {
      console.error("Supabase active promotions query failed", error);
      return {
        promotions: new Map<string, ActiveListingPromotion>(),
        source: "unavailable" as const,
      };
    }

    const promotions = new Map<string, ActiveListingPromotion>();

    for (const row of data ?? []) {
      const promotion = mapPromotionWithPackage(row as unknown as DbPromotionWithPackage);
      const existing = promotions.get(promotion.listing_id);

      if (!existing || getPromotionScore(promotion) > getPromotionScore(existing)) {
        promotions.set(promotion.listing_id, promotion);
      }
    }

    return { promotions, source: "supabase" as const };
  } catch (error) {
    console.error("Supabase active promotions query failed", error);
    return {
      promotions: new Map<string, ActiveListingPromotion>(),
      source: "unavailable" as const,
    };
  }
}

export function annotateListingsWithPromotions(
  listings: Listing[],
  promotions: Map<string, ActiveListingPromotion>,
) {
  if (promotions.size === 0) {
    return listings;
  }

  return listings.map((listing) => {
    const promotion = promotions.get(listing.id);

    if (!promotion) {
      return listing;
    }

    return {
      ...listing,
      promotion: {
        type: promotion.type,
        packageName: promotion.packageName,
        endsAt: promotion.ends_at,
      },
    };
  });
}

export async function createPromotionOrder(
  {
    listingId,
    packageId,
    note,
  }: {
    listingId: string;
    packageId: string;
    note?: string;
  },
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { orderId: null, error: "SUPABASE_NOT_CONFIGURED" as const };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { orderId: null, error: "NOT_AUTHENTICATED" as const };
  }

  const cleanNote = note?.trim() ?? "";

  if (cleanNote.length > 1200) {
    return { orderId: null, error: "NOTE_TOO_LONG" as const };
  }

  const [{ data: listing, error: listingError }, { data: promotionPackage, error: packageError }] =
    await Promise.all([
      supabase
        .from("listings")
        .select("id, user_id, status, slug, title")
        .eq("id", listingId)
        .maybeSingle(),
      supabase
        .from("promotion_packages")
        .select("*")
        .eq("id", packageId)
        .eq("is_active", true)
        .maybeSingle(),
    ]);

  if (listingError || packageError) {
    console.error("Supabase promotion order validation failed", {
      listingError,
      packageError,
    });
    return { orderId: null, error: "VALIDATION_FAILED" as const };
  }

  if (!listing || listing.user_id !== user.id) {
    return { orderId: null, error: "LISTING_NOT_FOUND" as const };
  }

  if (listing.status !== "active") {
    return { orderId: null, error: "LISTING_NOT_ACTIVE" as const };
  }

  if (!promotionPackage) {
    return { orderId: null, error: "PACKAGE_NOT_FOUND" as const };
  }

  const insert: TablesInsert<"promotion_orders"> = {
    user_id: user.id,
    listing_id: listing.id,
    package_id: promotionPackage.id,
    status: "pending_review",
    amount_cents: promotionPackage.price_cents,
    currency: promotionPackage.currency,
    note: cleanNote || null,
  };

  const { data: order, error } = await supabase
    .from("promotion_orders")
    .insert(insert)
    .select("id")
    .single();

  if (error || !order) {
    console.error("Supabase promotion order insert failed", error);
    return { orderId: null, error: "CREATE_ORDER_FAILED" as const };
  }

  return {
    orderId: order.id,
    listingSlug: listing.slug,
    listingTitle: listing.title,
    userId: user.id,
    error: null,
  };
}

export async function cancelPromotionOrder(
  orderId: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" as const };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "NOT_AUTHENTICATED" as const };
  }

  const { error } = await supabase
    .from("promotion_orders")
    .update({ status: "cancelled" })
    .eq("id", orderId)
    .eq("user_id", user.id)
    .eq("status", "pending_review");

  return { error: error ? ("CANCEL_ORDER_FAILED" as const) : null };
}

function mapOrderWithDetails(
  row: DbOrderWithDetails,
  supabase: SupabaseClient<Database>,
): PromotionOrderWithDetails {
  return {
    ...row,
    package: row.promotion_packages ?? null,
    listing: row.listings
      ? mapDbListingToListing(row.listings, (path) =>
          getPublicListingImageUrl(supabase, path),
        )
      : null,
  };
}

function mapListingPromotionWithDetails(
  row: DbListingPromotionWithDetails,
  supabase: SupabaseClient<Database>,
): UserListingPromotionWithDetails {
  return {
    ...row,
    package: row.promotion_packages ?? null,
    listing: row.listings
      ? mapDbListingToListing(row.listings, (path) =>
          getPublicListingImageUrl(supabase, path),
        )
      : null,
  };
}

function mapPromotionWithPackage(row: DbPromotionWithPackage): ActiveListingPromotion {
  return {
    id: row.id,
    listing_id: row.listing_id,
    package_id: row.package_id,
    type: row.type,
    status: row.status,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    packageName: row.promotion_packages?.name,
  };
}

function getPromotionScore(promotion: Pick<ActiveListingPromotion, "type">) {
  return promotion.type === "featured" ? 2 : 1;
}
