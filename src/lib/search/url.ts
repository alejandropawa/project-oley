import { categories } from "@/lib/mock-data";
import {
  getCityBySlug,
  getCountyBySlug,
  normalizeRomanianSlug,
} from "@/lib/romanian-cities";
import type { ListingCondition, ListingType } from "@/lib/mock-data";
import type {
  SearchListingsParams,
  SearchParamsRecord,
  SearchSort,
} from "@/lib/search/types";

const listingTypes: Array<ListingType | "all"> = [
  "all",
  "sell",
  "buy",
  "rent",
  "swap",
];
const conditions: Array<ListingCondition | "all"> = [
  "all",
  "Nou",
  "Foarte bun",
  "Bun",
  "Folosit",
  "Nu se aplică",
];
const sorts: SearchSort[] = [
  "relevance",
  "newest",
  "price_asc",
  "price_desc",
  "promoted",
  "distance",
];

export function parseSearchParams(
  searchParams: SearchParamsRecord,
  overrides: Partial<SearchListingsParams> = {},
): SearchListingsParams {
  const category = first(searchParams.categorie) || first(searchParams.category);
  const rawCity = first(searchParams.oras) || first(searchParams.city);
  const rawCounty = first(searchParams.judet) || first(searchParams.county);
  const sort = normalizeSort(first(searchParams.sort));
  const page = Number(first(searchParams.pagina) || first(searchParams.page));
  const perPage = Number(first(searchParams.per_page));
  const view = first(searchParams.view);
  const type = first(searchParams.tip) || first(searchParams.type) || "all";
  const condition = first(searchParams.stare) || first(searchParams.condition) || "all";

  return {
    q: first(searchParams.q),
    category: isKnownCategory(category) ? category : "",
    subcategory: first(searchParams.subcategorie) || first(searchParams.subcategory),
    type: isListingTypeFilter(type) ? type : "all",
    condition: isConditionFilter(condition) ? normalizeCondition(condition) : "all",
    citySlug: rawCity ? normalizeRomanianSlug(rawCity) : "",
    countySlug: rawCounty ? normalizeRomanianSlug(rawCounty) : "",
    priceMin: first(searchParams.pret_min) || first(searchParams.min),
    priceMax: first(searchParams.pret_max) || first(searchParams.max),
    currency: normalizeCurrency(first(searchParams.moneda)),
    sort,
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
    perPage: Number.isFinite(perPage) && perPage > 0 ? Math.min(Math.floor(perPage), 48) : 24,
    brand: first(searchParams.brand),
    model: first(searchParams.model),
    yearMin: first(searchParams.an_min),
    yearMax: first(searchParams.an_max),
    latitude: normalizeCoordinate(first(searchParams.lat), 90),
    longitude: normalizeCoordinate(first(searchParams.lng), 180),
    radiusKm: normalizeRadius(first(searchParams.raza)),
    nearMe: first(searchParams.aproape) === "1",
    view: view === "map" ? "map" : "list",
    attributes: parseAttributeFilters(searchParams),
    promotedFirst: sort === "relevance" || sort === "promoted",
    ...overrides,
  };
}

export function buildSearchHref(
  params: SearchListingsParams,
  overrides: Partial<SearchListingsParams> = {},
  path = "/anunturi",
) {
  const nextParams = { ...params, ...overrides };
  const query = new URLSearchParams();

  add(query, "q", nextParams.q);
  add(query, "categorie", nextParams.category);
  add(query, "subcategorie", nextParams.subcategory);
  add(query, "tip", nextParams.type === "all" ? "" : nextParams.type);
  add(query, "stare", nextParams.condition === "all" ? "" : nextParams.condition);
  add(query, "oras", nextParams.citySlug);
  add(query, "judet", nextParams.countySlug);
  add(query, "pret_min", nextParams.priceMin);
  add(query, "pret_max", nextParams.priceMax);
  add(query, "moneda", nextParams.currency);
  add(query, "sort", nextParams.sort === "relevance" ? "" : nextParams.sort);
  add(query, "pagina", nextParams.page > 1 ? String(nextParams.page) : "");
  add(query, "brand", nextParams.brand);
  add(query, "model", nextParams.model);
  add(query, "an_min", nextParams.yearMin);
  add(query, "an_max", nextParams.yearMax);
  add(query, "lat", nextParams.latitude);
  add(query, "lng", nextParams.longitude);
  add(query, "raza", nextParams.radiusKm);
  add(query, "aproape", nextParams.nearMe ? "1" : "");
  add(query, "view", nextParams.view === "map" ? "map" : "");

  for (const [key, value] of Object.entries(nextParams.attributes)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        add(query, `attr_${key}`, item);
      }
    } else {
      add(query, `attr_${key}`, typeof value === "boolean" ? String(value) : value);
    }
  }

  const queryString = query.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export function hasMeaningfulSearchParams(params: SearchListingsParams) {
  return Boolean(
    params.q ||
      params.category ||
      params.subcategory ||
      params.type !== "all" ||
      params.condition !== "all" ||
      params.citySlug ||
      params.countySlug ||
      params.priceMin ||
      params.priceMax ||
      params.currency ||
      params.brand ||
      params.model ||
      params.yearMin ||
      params.yearMax ||
      params.latitude ||
      params.longitude ||
      params.radiusKm ||
      params.nearMe ||
      Object.keys(params.attributes).length > 0,
  );
}

export function describeSearchParamLocation(params: SearchListingsParams) {
  const city = params.citySlug ? getCityBySlug(params.citySlug) : null;
  const county = params.countySlug ? getCountyBySlug(params.countySlug) : null;

  if (city) {
    return city.name;
  }

  if (county) {
    return county.label;
  }

  return "";
}

function parseAttributeFilters(searchParams: SearchParamsRecord) {
  const attributes: SearchListingsParams["attributes"] = {};

  for (const [key, rawValue] of Object.entries(searchParams)) {
    if (!key.startsWith("attr_")) {
      continue;
    }

    const attrKey = key.slice(5);
    const value = Array.isArray(rawValue)
      ? rawValue.filter(Boolean)
      : rawValue;

    if (Array.isArray(value) && value.length > 0) {
      attributes[attrKey] = value;
    } else if (typeof value === "string" && value) {
      attributes[attrKey] = value === "true" ? true : value;
    }
  }

  return attributes;
}

function normalizeSort(value: string): SearchSort {
  const aliases: Record<string, SearchSort> = {
    relevant: "relevance",
    "price-asc": "price_asc",
    "price-desc": "price_desc",
    pret_crescator: "price_asc",
    pret_descrescator: "price_desc",
    aproape: "distance",
  };
  const normalized = aliases[value] ?? value;

  return sorts.includes(normalized as SearchSort)
    ? (normalized as SearchSort)
    : "relevance";
}

function normalizeCoordinate(value: string, limit: number) {
  const numeric = Number(value);

  if (!value || !Number.isFinite(numeric) || Math.abs(numeric) > limit) {
    return "";
  }

  return String(Math.round(numeric * 1_000_000) / 1_000_000);
}

function normalizeRadius(value: string) {
  const numeric = Number(value);

  if (!value || !Number.isFinite(numeric) || numeric <= 0) {
    return "";
  }

  return String(Math.min(Math.round(numeric), 300));
}

function normalizeCurrency(value: string) {
  return value === "RON" || value === "EUR" ? value : "";
}

function isKnownCategory(value: string) {
  return categories.some((category) => category.slug === value);
}

function isListingTypeFilter(value: string): value is ListingType | "all" {
  return listingTypes.includes(value as ListingType | "all");
}

function isConditionFilter(value: string): value is ListingCondition | "all" {
  return (
    conditions.includes(value as ListingCondition | "all") ||
    value === "Nu se aplicÄƒ"
  );
}

function normalizeCondition(value: string): ListingCondition | "all" {
  return value === "Nu se aplicÄƒ" ? "Nu se aplică" : (value as ListingCondition | "all");
}

function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function add(query: URLSearchParams, key: string, value: string | boolean | undefined) {
  if (value === undefined || value === "" || value === false) {
    return;
  }

  query.append(key, String(value));
}
