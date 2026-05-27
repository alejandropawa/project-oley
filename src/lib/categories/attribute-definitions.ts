import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/types/database";

export type CategoryAttributeType =
  | "text"
  | "number"
  | "select"
  | "multi_select"
  | "boolean"
  | "range";

export type CategoryAttributeDefinition = {
  categorySlug: string;
  key: string;
  label: string;
  type: CategoryAttributeType;
  unit?: string;
  options: string[];
  isRequired: boolean;
  isFilterable: boolean;
  sortOrder: number;
};

export type ListingAttributes = Record<
  string,
  string | number | boolean | string[] | null
>;

export const fallbackCategoryAttributeDefinitions: CategoryAttributeDefinition[] =
  [
    definition("electronice", "brand", "Brand", "text", 10),
    definition("electronice", "model", "Model", "text", 20),
    definition("electronice", "storage_gb", "Stocare", "select", 30, {
      unit: "GB",
      options: ["64", "128", "256", "512", "1024"],
    }),
    definition("electronice", "warranty", "Garanție", "boolean", 40),
    definition("electronice", "condition_detail", "Detalii stare", "select", 50, {
      options: ["Sigilat", "Ca nou", "Urme fine", "Urme vizibile"],
    }),

    definition("auto", "brand", "Marcă", "text", 10),
    definition("auto", "model", "Model", "text", 20),
    definition("auto", "year", "An", "number", 30),
    definition("auto", "mileage_km", "Kilometraj", "number", 40, {
      unit: "km",
    }),
    definition("auto", "fuel", "Combustibil", "select", 50, {
      options: ["Benzină", "Diesel", "Hibrid", "Electric", "GPL"],
    }),
    definition("auto", "transmission", "Cutie viteze", "select", 60, {
      options: ["Manuală", "Automată"],
    }),

    definition("imobiliare", "rooms", "Camere", "select", 10, {
      options: ["1", "2", "3", "4", "5+"],
    }),
    definition("imobiliare", "surface_sqm", "Suprafață", "number", 20, {
      unit: "m²",
    }),
    definition("imobiliare", "floor", "Etaj", "text", 30),
    definition("imobiliare", "property_type", "Tip proprietate", "select", 40, {
      options: ["Apartament", "Garsonieră", "Casă", "Teren", "Spațiu comercial"],
    }),
    definition("imobiliare", "furnished", "Mobilat", "select", 50, {
      options: ["Nemobilat", "Parțial mobilat", "Mobilat"],
    }),

    definition("casa-gradina", "material", "Material", "text", 10),
    definition("casa-gradina", "color", "Culoare", "text", 20),
    definition("casa-gradina", "dimensions", "Dimensiuni", "text", 30),
    definition("casa-gradina", "delivery_available", "Livrare disponibilă", "boolean", 40),

    definition("fashion", "brand", "Brand", "text", 10),
    definition("fashion", "size", "Mărime", "text", 20),
    definition("fashion", "gender", "Pentru", "select", 30, {
      options: ["Femei", "Bărbați", "Copii", "Unisex"],
    }),
    definition("fashion", "color", "Culoare", "text", 40),

    definition("sport", "brand", "Brand", "text", 10),
    definition("sport", "sport_type", "Sport", "text", 20),
    definition("sport", "size", "Mărime", "text", 30),
    definition("sport", "warranty", "Garanție", "boolean", 40),

    definition("copii-bebe", "age_group", "Vârstă", "select", 10, {
      options: ["0-6 luni", "6-12 luni", "1-3 ani", "3-6 ani", "6+ ani"],
    }),
    definition("copii-bebe", "brand", "Brand", "text", 20),
    definition("copii-bebe", "safety_certified", "Certificat siguranță", "boolean", 30),

    definition("servicii", "service_type", "Tip serviciu", "text", 10),
    definition("servicii", "availability", "Disponibilitate", "text", 20),
    definition("servicii", "experience_years", "Ani experiență", "number", 30),

    definition("inchirieri", "rental_period", "Perioadă", "select", 10, {
      options: ["Oră", "Zi", "Săptămână", "Lună"],
    }),
    definition("inchirieri", "deposit_required", "Garanție necesară", "boolean", 20),
    definition("inchirieri", "delivery_available", "Livrare disponibilă", "boolean", 30),

    definition("schimburi", "wanted_item", "Ce cauți la schimb", "text", 10),
    definition("schimburi", "accepts_difference", "Accept diferență de bani", "boolean", 20),
    definition("schimburi", "preferred_category", "Categorie preferată", "text", 30),
  ];

export function getFallbackAttributeDefinitions(categorySlug?: string) {
  return fallbackCategoryAttributeDefinitions
    .filter((definition) => !categorySlug || definition.categorySlug === categorySlug)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getCategoryAttributeDefinitions(
  categorySlug: string,
  supabase?: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return getFallbackAttributeDefinitions(categorySlug);
  }

  try {
    const { data, error } = await supabase
      .from("category_attribute_definitions")
      .select("*")
      .eq("category_slug", categorySlug)
      .eq("is_filterable", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return getFallbackAttributeDefinitions(categorySlug);
    }

    return data.map(mapDbAttributeDefinition);
  } catch (error) {
    console.error("Category attribute definitions query failed", error);
    return getFallbackAttributeDefinitions(categorySlug);
  }
}

export function getAttributeDefinition(
  categorySlug: string,
  key: string,
): CategoryAttributeDefinition | undefined {
  return getFallbackAttributeDefinitions(categorySlug).find(
    (definition) => definition.key === key,
  );
}

export function getCommonListingFields(attributes: ListingAttributes) {
  const brand = stringifyAttribute(attributes.brand);
  const model = stringifyAttribute(attributes.model);
  const year = Number(stringifyAttribute(attributes.year));

  return {
    brand: brand || null,
    model: model || null,
    year: Number.isFinite(year) ? year : null,
  };
}

export function stringifyAttribute(value: ListingAttributes[string]) {
  if (typeof value === "boolean") {
    return value ? "Da" : "";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

export function getListingAttributeSnippets(
  categorySlug: string,
  attributes?: ListingAttributes,
) {
  if (!attributes) {
    return [];
  }

  const keysByCategory: Record<string, string[]> = {
    electronice: ["brand", "model", "storage_gb"],
    auto: ["brand", "model", "year", "mileage_km"],
    imobiliare: ["rooms", "surface_sqm", "property_type"],
    fashion: ["brand", "size"],
    sport: ["brand", "sport_type", "size"],
    "copii-bebe": ["age_group", "brand"],
  };
  const keys = keysByCategory[categorySlug] ?? [];

  return keys
    .map((key) => {
      const definition = getAttributeDefinition(categorySlug, key);
      const value = stringifyAttribute(attributes[key]);

      if (!definition || !value) {
        return null;
      }

      return `${definition.label}: ${value}${definition.unit ? ` ${definition.unit}` : ""}`;
    })
    .filter((snippet): snippet is string => Boolean(snippet))
    .slice(0, 3);
}

function mapDbAttributeDefinition(
  row: Tables<"category_attribute_definitions">,
): CategoryAttributeDefinition {
  const options = Array.isArray(row.options)
    ? row.options.filter((option): option is string => typeof option === "string")
    : [];

  return {
    categorySlug: row.category_slug,
    key: row.key,
    label: row.label,
    type: row.type as CategoryAttributeType,
    unit: row.unit ?? undefined,
    options,
    isRequired: row.is_required,
    isFilterable: row.is_filterable,
    sortOrder: row.sort_order,
  };
}

function definition(
  categorySlug: string,
  key: string,
  label: string,
  type: CategoryAttributeType,
  sortOrder: number,
  options: Partial<Pick<CategoryAttributeDefinition, "unit" | "options" | "isRequired">> = {},
): CategoryAttributeDefinition {
  return {
    categorySlug,
    key,
    label,
    type,
    unit: options.unit,
    options: options.options ?? [],
    isRequired: options.isRequired ?? false,
    isFilterable: true,
    sortOrder,
  };
}
