import { categories } from "@/lib/mock-data";
import {
  getAttributeDefinition,
  stringifyAttribute,
} from "@/lib/categories/attribute-definitions";
import {
  getCityBySlug,
  getCountyBySlug,
} from "@/lib/romanian-cities";
import { buildSearchHref } from "@/lib/search/url";
import type { ActiveFilterChip, SearchListingsParams } from "@/lib/search/types";

const typeLabels: Record<string, string> = {
  sell: "Vând",
  buy: "Cumpăr",
  rent: "Închiriez",
  swap: "Schimb",
};

const sortLabels: Record<string, string> = {
  relevance: "Relevanță",
  newest: "Cele mai noi",
  price_asc: "Preț crescător",
  price_desc: "Preț descrescător",
  promoted: "Promovate întâi",
  distance: "Aproape de mine",
};

export function getActiveFilterChips(
  params: SearchListingsParams,
  path = "/anunturi",
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];
  const category = categories.find((item) => item.slug === params.category);
  const city = params.citySlug ? getCityBySlug(params.citySlug) : null;
  const county = params.countySlug ? getCountyBySlug(params.countySlug) : null;

  addChip(chips, params, "q", params.q ? `Caută: ${params.q}` : "", { q: "" }, path);
  addChip(chips, params, "category", category?.name ?? "", { category: "", subcategory: "" }, path);
  addChip(chips, params, "subcategory", params.subcategory, { subcategory: "" }, path);
  addChip(chips, params, "type", typeLabels[params.type] ?? "", { type: "all" }, path);
  addChip(chips, params, "condition", params.condition === "all" ? "" : params.condition, { condition: "all" }, path);
  addChip(chips, params, "citySlug", city?.name ?? "", { citySlug: "" }, path);
  addChip(chips, params, "countySlug", county?.label ?? "", { countySlug: "" }, path);
  addChip(chips, params, "priceMin", params.priceMin ? `Min. ${params.priceMin}` : "", { priceMin: "" }, path);
  addChip(chips, params, "priceMax", params.priceMax ? `Max. ${params.priceMax}` : "", { priceMax: "" }, path);
  addChip(chips, params, "currency", params.currency, { currency: "" }, path);
  addChip(chips, params, "brand", params.brand ? `Brand: ${params.brand}` : "", { brand: "" }, path);
  addChip(chips, params, "model", params.model ? `Model: ${params.model}` : "", { model: "" }, path);
  addChip(chips, params, "yearMin", params.yearMin ? `An min. ${params.yearMin}` : "", { yearMin: "" }, path);
  addChip(chips, params, "yearMax", params.yearMax ? `An max. ${params.yearMax}` : "", { yearMax: "" }, path);
  addChip(
    chips,
    params,
    "nearMe",
    params.nearMe ? "Aproape de mine" : "",
    { nearMe: false, latitude: "", longitude: "", sort: "relevance" },
    path,
  );
  addChip(
    chips,
    params,
    "radiusKm",
    params.radiusKm ? `Rază: ${params.radiusKm} km` : "",
    { radiusKm: "" },
    path,
  );

  if (params.sort !== "relevance") {
    addChip(chips, params, "sort", sortLabels[params.sort], { sort: "relevance" }, path);
  }

  for (const [key, value] of Object.entries(params.attributes)) {
    const definition = params.category
      ? getAttributeDefinition(params.category, key)
      : undefined;
    const label = definition?.label ?? key.replaceAll("_", " ");
    const readable = stringifyAttribute(
      Array.isArray(value) ? value : value === true ? true : String(value),
    );

    if (readable) {
      chips.push({
        key: `attr_${key}`,
        label: `${label}: ${readable}`,
        href: buildSearchHref(
          {
            ...params,
            page: 1,
            attributes: omitAttribute(params.attributes, key),
          },
          {},
          path,
        ),
      });
    }
  }

  return chips;
}

export function formatSavedSearchSummary(filters: unknown) {
  if (!filters || typeof filters !== "object") {
    return "Fără filtre avansate";
  }

  const source = filters as Partial<SearchListingsParams>;
  const parts = [
    source.category ? categories.find((item) => item.slug === source.category)?.name : "",
    source.citySlug ? getCityBySlug(source.citySlug)?.name : "",
    source.type && source.type !== "all" ? typeLabels[source.type] : "",
    source.priceMin ? `de la ${source.priceMin}` : "",
    source.priceMax ? `până la ${source.priceMax}` : "",
    source.brand ? `brand ${source.brand}` : "",
    source.model ? `model ${source.model}` : "",
    source.radiusKm ? `raza ${source.radiusKm} km` : "",
    source.nearMe ? "aproape de mine" : "",
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : "Toate anunțurile";
}

function addChip(
  chips: ActiveFilterChip[],
  params: SearchListingsParams,
  key: string,
  label: string,
  overrides: Partial<SearchListingsParams>,
  path: string,
) {
  if (!label) {
    return;
  }

  chips.push({
    key,
    label,
    href: buildSearchHref(params, { ...overrides, page: 1 }, path),
  });
}

function omitAttribute(
  attributes: SearchListingsParams["attributes"],
  keyToOmit: string,
) {
  return Object.fromEntries(
    Object.entries(attributes).filter(([key]) => key !== keyToOmit),
  );
}
