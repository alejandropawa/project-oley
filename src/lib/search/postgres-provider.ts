import type { SupabaseClient } from "@supabase/supabase-js";

import { getPublicListingImageUrl } from "@/lib/db/storage";
import {
  annotateListingsWithPromotions,
  getActivePromotionsForListings,
} from "@/lib/db/promotions";
import { calculateDistanceKm } from "@/lib/locations/distance";
import {
  mapDbListingToListing,
  type DbListingWithImages,
} from "@/lib/listings/mappers";
import { romanianCities } from "@/lib/romanian-cities";
import { sortSearchListings } from "@/lib/search/sort";
import type { SearchListingsParams, SearchListingsResult } from "@/lib/search/types";
import type { Database } from "@/types/database";

export async function searchPostgresListings(
  params: SearchListingsParams,
  supabase: SupabaseClient<Database> | null,
): Promise<SearchListingsResult> {
  if (!supabase) {
    return emptyResult(params, "unavailable");
  }

  try {
    let query = supabase
      .from("listings")
      .select("*, listing_images(storage_path, sort_order, alt_text)", {
        count: "exact",
      })
      .eq("status", "active");

    if (params.q.trim()) {
      const safeQuery = sanitizeLike(params.q);
      query = query.or(
        [
          `title.ilike.%${safeQuery}%`,
          `description.ilike.%${safeQuery}%`,
          `city.ilike.%${safeQuery}%`,
          `county.ilike.%${safeQuery}%`,
          `category_slug.ilike.%${safeQuery}%`,
          `subcategory.ilike.%${safeQuery}%`,
          `brand.ilike.%${safeQuery}%`,
          `model.ilike.%${safeQuery}%`,
          `search_text.ilike.%${safeQuery}%`,
        ].join(","),
      );
    }

    if (params.category) {
      query = query.eq("category_slug", params.category);
    }

    if (params.subcategory) {
      query = query.eq("subcategory", params.subcategory);
    }

    if (params.type !== "all") {
      query = query.eq("type", params.type);
    }

    if (params.condition !== "all") {
      query = query.eq("condition", mapConditionToDb(params.condition));
    }

    if (params.citySlug) {
      query = query.eq("city_slug", params.citySlug);
    }

    if (params.countySlug) {
      query = query.eq("county_slug", params.countySlug);
    }

    if (params.currency) {
      query = query.eq("currency", params.currency);
    }

    const min = Number(params.priceMin);
    const max = Number(params.priceMax);

    if (params.priceMin && Number.isFinite(min)) {
      query = query.gte("price_cents", Math.round(min * 100));
    }

    if (params.priceMax && Number.isFinite(max)) {
      query = query.lte("price_cents", Math.round(max * 100));
    }

    if (params.brand) {
      query = query.ilike("brand", `%${sanitizeLike(params.brand)}%`);
    }

    if (params.model) {
      query = query.ilike("model", `%${sanitizeLike(params.model)}%`);
    }

    const yearMin = Number(params.yearMin);
    const yearMax = Number(params.yearMax);

    if (params.yearMin && Number.isFinite(yearMin)) {
      query = query.gte("year", yearMin);
    }

    if (params.yearMax && Number.isFinite(yearMax)) {
      query = query.lte("year", yearMax);
    }

    for (const [key, value] of Object.entries(params.attributes)) {
      if (Array.isArray(value) || value === "" || value === false) {
        continue;
      }

      query = query.contains("attributes", { [key]: value });
    }

    if (params.sort === "price_asc") {
      query = query.order("price_cents", {
        ascending: true,
        nullsFirst: false,
      });
    } else if (params.sort === "price_desc") {
      query = query.order("price_cents", {
        ascending: false,
        nullsFirst: false,
      });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const needsDistancePass = Boolean(params.radiusKm || params.sort === "distance");
    const fetchMultiplier = params.promotedFirst ? 3 : 1;
    const start = Math.max(0, (params.page - 1) * params.perPage);
    const rangeStart = needsDistancePass ? 0 : start;
    const end = needsDistancePass
      ? 999
      : start + params.perPage * fetchMultiplier - 1;
    const { data, error, count } = await query.range(rangeStart, end);

    if (error) {
      console.error("Supabase advanced search failed", error);
      return emptyResult(params, "unavailable");
    }

    const mappedListings = (data ?? []).map((row) =>
      annotateDistance(
        mapDbListingToListing(row as unknown as DbListingWithImages, (path) =>
        getPublicListingImageUrl(supabase, path),
        ),
        params,
      ),
    );
    const promotions = await getActivePromotionsForListings(
      mappedListings.map((listing) => listing.id),
      supabase,
    );
    const annotated =
      promotions.source === "supabase"
        ? annotateListingsWithPromotions(mappedListings, promotions.promotions)
        : mappedListings;
    const radius = Number(params.radiusKm);
    const distanceFiltered =
      params.radiusKm && Number.isFinite(radius)
        ? annotated.filter(
            (listing) =>
              listing.distanceKm !== null &&
              listing.distanceKm !== undefined &&
              listing.distanceKm <= radius,
          )
        : annotated;
    const sortedListings =
      params.promotedFirst || params.sort === "distance"
        ? sortSearchListings(distanceFiltered, params.sort)
        : distanceFiltered;
    const listings = needsDistancePass
      ? sortedListings.slice(start, start + params.perPage)
      : sortedListings.slice(0, params.perPage);
    const totalCount = needsDistancePass ? distanceFiltered.length : count ?? listings.length;

    return {
      listings,
      totalCount,
      currentPage: params.page,
      totalPages: Math.max(1, Math.ceil(totalCount / params.perPage)),
      facets: await getSimpleFacets(params, supabase),
      source: "supabase",
    };
  } catch (error) {
    console.error("Supabase advanced search failed", error);
    return emptyResult(params, "unavailable");
  }
}

function annotateDistance<T extends { publicLatitude?: number | null; publicLongitude?: number | null }>(
  listing: T,
  params: SearchListingsParams,
) {
  const searchCoordinates = getSearchCoordinates(params);

  if (!searchCoordinates || !listing.publicLatitude || !listing.publicLongitude) {
    return listing;
  }

  return {
    ...listing,
    distanceKm: calculateDistanceKm(searchCoordinates, {
      latitude: listing.publicLatitude,
      longitude: listing.publicLongitude,
    }),
  };
}

function getSearchCoordinates(params: SearchListingsParams) {
  const latitude = Number(params.latitude);
  const longitude = Number(params.longitude);

  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return { latitude, longitude };
  }

  if (params.citySlug) {
    const city = romanianCities.find((item) => item.slug === params.citySlug);

    if (city) {
      return { latitude: city.latitude, longitude: city.longitude };
    }
  }

  return null;
}

export async function getSimpleFacets(
  params: SearchListingsParams,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return emptyResult(params, "unavailable").facets;
  }

  try {
    const { data } = await supabase
      .from("listings")
      .select("category_slug, city, city_slug, county, county_slug, type, condition, price_cents")
      .eq("status", "active")
      .limit(2000);

    const rows = data ?? [];
    const categories = countFacet(
      rows.map((row) => [row.category_slug, row.category_slug]),
    );
    const cities = countFacet(
      rows.map((row) => [row.city_slug ?? row.city, row.city]),
    );
    const counties = countFacet(
      rows.map((row) => [row.county_slug ?? row.county, row.county]),
    );
    const types = countFacet(rows.map((row) => [row.type, row.type]));
    const conditions = countFacet(rows.map((row) => [row.condition, row.condition]));
    const prices = rows
      .map((row) => row.price_cents)
      .filter((price): price is number => typeof price === "number")
      .map((price) => price / 100);

    return {
      categories,
      cities,
      counties,
      types,
      conditions,
      priceMin: prices.length > 0 ? Math.min(...prices) : undefined,
      priceMax: prices.length > 0 ? Math.max(...prices) : undefined,
    };
  } catch (error) {
    console.error("Supabase facets query failed", error);
    return emptyResult(params, "unavailable").facets;
  }
}

function countFacet(pairs: Array<[string | null | undefined, string | null | undefined]>) {
  const map = new Map<string, { label: string; count: number }>();

  for (const [value, label] of pairs) {
    if (!value || !label) {
      continue;
    }

    const current = map.get(value) ?? { label, count: 0 };
    current.count += 1;
    map.set(value, current);
  }

  return Array.from(map.entries())
    .map(([value, item]) => ({ value, label: item.label, count: item.count }))
    .sort((a, b) => b.count - a.count);
}

function sanitizeLike(value: string) {
  return value.trim().replace(/[%_,]/g, " ").slice(0, 80);
}

function mapConditionToDb(condition: SearchListingsParams["condition"]) {
  const mapping = {
    Nou: "new",
    "Foarte bun": "very_good",
    Bun: "good",
    Folosit: "used",
    "Nu se aplică": "not_applicable",
  } as const;

  return condition === "all" ? "not_applicable" : mapping[condition];
}

function emptyResult(
  params: SearchListingsParams,
  source: SearchListingsResult["source"],
): SearchListingsResult {
  return {
    listings: [],
    totalCount: 0,
    currentPage: params.page,
    totalPages: 1,
    facets: {
      categories: [],
      cities: [],
      counties: [],
      types: [],
      conditions: [],
    },
    source,
  };
}
