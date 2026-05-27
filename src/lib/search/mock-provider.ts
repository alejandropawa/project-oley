import {
  getListingCategory,
  isListingType,
} from "@/lib/listing-utils";
import { categories, listings } from "@/lib/mock-data";
import { calculateDistanceKm } from "@/lib/locations/distance";
import {
  getCityCoordinates,
  normalizeRomanianSlug,
  romanianCities,
} from "@/lib/romanian-cities";
import { sortSearchListings } from "@/lib/search/sort";
import type { SearchListingsParams, SearchListingsResult } from "@/lib/search/types";

export async function searchMockListings(
  params: SearchListingsParams,
): Promise<SearchListingsResult> {
  const filtered = listings
    .map((listing) => annotateDistance(listing, params))
    .filter((listing) => matchesListing(listing, params));
  const sorted = sortSearchListings(filtered, params.sort);
  const start = (params.page - 1) * params.perPage;
  const paginated = sorted.slice(start, start + params.perPage);

  return {
    listings: paginated,
    totalCount: filtered.length,
    currentPage: params.page,
    totalPages: Math.max(1, Math.ceil(filtered.length / params.perPage)),
    facets: buildFacets(filtered),
    source: "mock",
  };
}

function annotateDistance(
  listing: (typeof listings)[number],
  params: SearchListingsParams,
) {
  const searchCoordinates = getSearchCoordinates(params);
  const listingCoordinates =
    listing.publicLatitude && listing.publicLongitude
      ? {
          latitude: listing.publicLatitude,
          longitude: listing.publicLongitude,
        }
      : getCityCoordinates(listing.city, listing.county);

  if (!searchCoordinates || !listingCoordinates) {
    return listing;
  }

  return {
    ...listing,
    distanceKm: calculateDistanceKm(searchCoordinates, listingCoordinates),
  };
}

function matchesListing(
  listing: (typeof listings)[number],
  params: SearchListingsParams,
) {
  if (params.category && listing.categorySlug !== params.category) {
    return false;
  }

  if (params.subcategory && listing.subcategory !== params.subcategory) {
    return false;
  }

  if (params.type !== "all" && isListingType(params.type) && listing.type !== params.type) {
    return false;
  }

  if (params.condition !== "all" && listing.condition !== params.condition) {
    return false;
  }

  if (params.citySlug && normalizeRomanianSlug(listing.city) !== params.citySlug) {
    return false;
  }

  if (params.countySlug && normalizeRomanianSlug(listing.county) !== params.countySlug) {
    return false;
  }

  const radius = Number(params.radiusKm);

  if (
    params.radiusKm &&
    Number.isFinite(radius) &&
    (listing.distanceKm === null ||
      listing.distanceKm === undefined ||
      listing.distanceKm > radius)
  ) {
    return false;
  }

  if (params.currency && listing.currency !== params.currency && !(params.currency === "RON" && listing.currency === "lei")) {
    return false;
  }

  const min = Number(params.priceMin);
  const max = Number(params.priceMax);

  if (params.priceMin && Number.isFinite(min) && (listing.price === null || listing.price < min)) {
    return false;
  }

  if (params.priceMax && Number.isFinite(max) && (listing.price === null || listing.price > max)) {
    return false;
  }

  if (params.brand && !includesNormalized(listing.brand ?? "", params.brand)) {
    return false;
  }

  if (params.model && !includesNormalized(listing.model ?? "", params.model)) {
    return false;
  }

  const yearMin = Number(params.yearMin);
  const yearMax = Number(params.yearMax);

  if (params.yearMin && Number.isFinite(yearMin) && (listing.year ?? 0) < yearMin) {
    return false;
  }

  if (params.yearMax && Number.isFinite(yearMax) && (listing.year ?? 9999) > yearMax) {
    return false;
  }

  for (const [key, expected] of Object.entries(params.attributes)) {
    const actual = listing.attributes?.[key];

    if (actual === undefined || actual === null) {
      return false;
    }

    if (Array.isArray(expected)) {
      if (!expected.some((item) => includesNormalized(String(actual), item))) {
        return false;
      }
    } else if (expected === true) {
      if (actual !== true) {
        return false;
      }
    } else if (!includesNormalized(String(actual), String(expected))) {
      return false;
    }
  }

  if (params.q) {
    const category = getListingCategory(listing);
    const haystack = [
      listing.title,
      listing.description,
      listing.city,
      listing.county,
      category.name,
      listing.seller.name,
      listing.brand,
      listing.model,
      JSON.stringify(listing.attributes ?? {}),
    ].join(" ");

    return includesNormalized(haystack, params.q);
  }

  return true;
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

function buildFacets(sourceListings: typeof listings) {
  const prices = sourceListings
    .map((listing) => listing.price)
    .filter((price): price is number => typeof price === "number");

  return {
    categories: categories.map((category) => ({
      value: category.slug,
      label: category.name,
      count: sourceListings.filter((listing) => listing.categorySlug === category.slug).length,
    })),
    cities: romanianCities.map((city) => ({
      value: city.slug,
      label: city.name,
      count: sourceListings.filter(
        (listing) => normalizeRomanianSlug(listing.city) === city.slug,
      ).length,
    })),
    counties: Array.from(
      new Map(romanianCities.map((city) => [city.countySlug, city.county])),
    ).map(([value, label]) => ({
      value,
      label,
      count: sourceListings.filter(
        (listing) => normalizeRomanianSlug(listing.county) === value,
      ).length,
    })),
    types: ["sell", "buy", "rent", "swap"].map((type) => ({
      value: type,
      label: type,
      count: sourceListings.filter((listing) => listing.type === type).length,
    })),
    conditions: ["Nou", "Foarte bun", "Bun", "Folosit", "Nu se aplică"].map(
      (condition) => ({
        value: condition,
        label: condition,
        count: sourceListings.filter((listing) => listing.condition === condition).length,
      }),
    ),
    priceMin: prices.length > 0 ? Math.min(...prices) : undefined,
    priceMax: prices.length > 0 ? Math.max(...prices) : undefined,
  };
}

function includesNormalized(source: string, needle: string) {
  return normalize(source).includes(normalize(needle));
}

function normalize(value: string) {
  return value
    .toLocaleLowerCase("ro")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
