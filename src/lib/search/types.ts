import type { Listing, ListingCondition, ListingType } from "@/lib/mock-data";

export type SearchSort =
  | "relevance"
  | "newest"
  | "price_asc"
  | "price_desc"
  | "promoted"
  | "distance";

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

export type SearchAttributeFilters = Record<string, string | string[] | boolean>;

export type SearchListingsParams = {
  q: string;
  category: string;
  subcategory: string;
  type: ListingType | "all";
  condition: ListingCondition | "all";
  citySlug: string;
  countySlug: string;
  priceMin: string;
  priceMax: string;
  currency: "RON" | "EUR" | "";
  sort: SearchSort;
  page: number;
  perPage: number;
  brand: string;
  model: string;
  yearMin: string;
  yearMax: string;
  latitude: string;
  longitude: string;
  radiusKm: string;
  nearMe: boolean;
  view: "list" | "map";
  attributes: SearchAttributeFilters;
  promotedFirst: boolean;
};

export type SearchFacetItem = {
  value: string;
  label: string;
  count: number;
};

export type SearchFacets = {
  categories: SearchFacetItem[];
  cities: SearchFacetItem[];
  counties: SearchFacetItem[];
  types: SearchFacetItem[];
  conditions: SearchFacetItem[];
  priceMin?: number;
  priceMax?: number;
};

export type SearchListingsResult = {
  listings: Listing[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  facets: SearchFacets;
  source: "supabase" | "mock" | "unavailable";
};

export type ActiveFilterChip = {
  key: string;
  label: string;
  href: string;
};
