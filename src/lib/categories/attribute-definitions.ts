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
    definition("imobiliare", "rooms", "Camere", "select", 10, {
      options: ["1", "2", "3", "4", "5+"],
    }),
    definition("imobiliare", "surface_sqm", "Suprafață utilă", "number", 20, {
      unit: "m²",
      isRequired: true,
    }),
    definition("imobiliare", "built_surface_sqm", "Suprafață construită", "number", 30, {
      unit: "m²",
    }),
    definition("imobiliare", "land_surface_sqm", "Suprafață teren", "number", 40, {
      unit: "m²",
    }),
    definition("imobiliare", "floor", "Etaj", "text", 50),
    definition("imobiliare", "total_floors", "Total etaje", "number", 60),
    definition("imobiliare", "construction_year", "An construcție", "number", 70),
    definition("imobiliare", "partitioning", "Compartimentare", "select", 80, {
      options: ["Decomandat", "Semidecomandat", "Nedecomandat", "Open-space"],
    }),
    definition("imobiliare", "comfort", "Confort", "select", 90, {
      options: ["Lux", "Confort 1", "Confort 2", "Confort 3"],
    }),
    definition("imobiliare", "furnished", "Mobilat", "select", 100, {
      options: ["Nemobilat", "Parțial mobilat", "Mobilat"],
    }),
    definition("imobiliare", "energy_class", "Clasă energetică", "select", 110, {
      options: ["A", "B", "C", "D", "E", "F", "G"],
    }),
    definition("imobiliare", "parking_available", "Parcare disponibilă", "boolean", 120),

    definition("auto", "brand", "Marcă", "text", 10, { isRequired: true }),
    definition("auto", "model", "Model", "text", 20, { isRequired: true }),
    definition("auto", "year", "An fabricație", "number", 30, {
      isRequired: true,
    }),
    definition("auto", "mileage_km", "Kilometraj", "number", 40, {
      unit: "km",
      isRequired: true,
    }),
    definition("auto", "fuel", "Combustibil", "select", 50, {
      options: ["Benzină", "Diesel", "Hibrid", "Electric", "GPL"],
      isRequired: true,
    }),
    definition("auto", "transmission", "Cutie viteze", "select", 60, {
      options: ["Manuală", "Automată"],
      isRequired: true,
    }),
    definition("auto", "steering_wheel", "Volan", "select", 70, {
      options: ["Stânga", "Dreapta"],
      isRequired: true,
    }),
    definition("auto", "body_type", "Caroserie", "select", 80, {
      options: [
        "Hatchback",
        "Sedan",
        "Break",
        "SUV",
        "Coupe",
        "Cabrio",
        "Monovolum",
        "Pick-up",
        "Van",
      ],
      isRequired: true,
    }),
    definition("auto", "engine_capacity_cc", "Capacitate cilindrică", "number", 90, {
      unit: "cm³",
    }),
    definition("auto", "power_hp", "Putere", "number", 100, { unit: "CP" }),
    definition("auto", "pollution_standard", "Normă poluare", "select", 110, {
      options: ["Euro 2", "Euro 3", "Euro 4", "Euro 5", "Euro 6", "Electric"],
    }),
    definition("auto", "drivetrain", "Tracțiune", "select", 120, {
      options: ["Față", "Spate", "4x4", "AWD"],
    }),
    definition("auto", "service_history", "Istoric service", "boolean", 130),
    definition("auto", "first_owner", "Prim proprietar", "boolean", 140),

    definition("electronice", "brand", "Brand", "text", 10, {
      isRequired: true,
    }),
    definition("electronice", "model", "Model", "text", 20),
    definition("electronice", "device_type", "Tip dispozitiv", "select", 25, {
      options: ["Telefon", "Laptop", "Desktop", "Tabletă", "TV", "Audio", "Gaming", "Electrocasnic"],
    }),
    definition("electronice", "storage_gb", "Stocare", "select", 30, {
      unit: "GB",
      options: ["64", "128", "256", "512", "1024"],
    }),
    definition("electronice", "ram_gb", "Memorie RAM", "select", 35, {
      unit: "GB",
      options: ["4", "8", "16", "32", "64", "128"],
    }),
    definition("electronice", "screen_size", "Diagonală ecran", "number", 40, {
      unit: "inch",
    }),
    definition("electronice", "warranty", "Garanție", "boolean", 50),
    definition("electronice", "condition_detail", "Detalii stare", "select", 60, {
      options: ["Sigilat", "Ca nou", "Urme fine", "Urme vizibile"],
      isRequired: true,
    }),

    definition("casa-gradina", "room", "Cameră / zonă", "select", 10, {
      options: ["Living", "Dormitor", "Bucătărie", "Baie", "Exterior", "Grădină"],
    }),
    definition("casa-gradina", "material", "Material", "text", 20),
    definition("casa-gradina", "color", "Culoare", "text", 30),
    definition("casa-gradina", "dimensions", "Dimensiuni", "text", 40),
    definition("casa-gradina", "style", "Stil", "select", 50, {
      options: ["Modern", "Clasic", "Industrial", "Scandinav", "Rustic"],
    }),
    definition("casa-gradina", "condition_detail", "Detalii stare", "select", 60, {
      options: ["Nou", "Ca nou", "Folosit", "Necesită recondiționare"],
    }),
    definition("casa-gradina", "delivery_available", "Livrare disponibilă", "boolean", 70),
    definition("casa-gradina", "assembly_required", "Necesită montaj", "boolean", 80),

    definition("fashion", "brand", "Brand", "text", 10),
    definition("fashion", "size", "Mărime", "text", 20),
    definition("fashion", "gender", "Pentru", "select", 30, {
      options: ["Femei", "Bărbați", "Copii", "Unisex"],
    }),
    definition("fashion", "color", "Culoare", "text", 40),
    definition("fashion", "material", "Material", "text", 50),
    definition("fashion", "authenticity", "Autenticitate", "select", 60, {
      options: ["Original", "Fără documente", "Replica / nebranduit"],
    }),
    definition("fashion", "condition_detail", "Detalii stare", "select", 70, {
      options: ["Nou cu etichetă", "Nou fără etichetă", "Purtat puțin", "Folosit"],
    }),

    definition("sport", "brand", "Brand", "text", 10),
    definition("sport", "sport_type", "Sport", "text", 20, { isRequired: true }),
    definition("sport", "size", "Mărime", "text", 30),
    definition("sport", "condition_detail", "Detalii stare", "select", 40, {
      options: ["Nou", "Foarte bun", "Bun", "Necesită service"],
    }),
    definition("sport", "warranty", "Garanție", "boolean", 50),

    definition("copii-bebe", "age_group", "Vârstă", "select", 10, {
      options: ["0-6 luni", "6-12 luni", "1-3 ani", "3-6 ani", "6+ ani"],
      isRequired: true,
    }),
    definition("copii-bebe", "brand", "Brand", "text", 20),
    definition("copii-bebe", "condition_detail", "Detalii stare", "select", 30, {
      options: ["Nou", "Foarte bun", "Bun", "Folosit"],
    }),
    definition("copii-bebe", "safety_certified", "Certificat siguranță", "boolean", 40),
    definition("copii-bebe", "isofix", "Isofix", "boolean", 50),

    definition("servicii", "service_type", "Tip serviciu", "text", 10, {
      isRequired: true,
    }),
    definition("servicii", "availability", "Disponibilitate", "text", 20),
    definition("servicii", "experience_years", "Ani experiență", "number", 30),
    definition("servicii", "coverage_area", "Arie acoperire", "text", 40),
    definition("servicii", "response_time", "Timp răspuns", "select", 50, {
      options: ["În aceeași zi", "24h", "2-3 zile", "Programabil"],
    }),
    definition("servicii", "invoice_available", "Emite factură", "boolean", 60),
    definition("servicii", "emergency_available", "Disponibil urgențe", "boolean", 70),

    definition("joburi", "industry", "Domeniu", "text", 10, {
      isRequired: true,
    }),
    definition("joburi", "role_level", "Nivel rol", "select", 20, {
      options: ["Entry-level", "Mid-level", "Senior", "Management", "Executive"],
    }),
    definition("joburi", "work_mode", "Mod lucru", "select", 30, {
      options: ["On-site", "Hibrid", "Remote", "Pe teren"],
    }),
    definition("joburi", "contract_type", "Tip contract", "select", 40, {
      options: ["Full-time", "Part-time", "Freelance", "Internship", "Sezonier"],
    }),
    definition("joburi", "salary_range", "Interval salarial", "text", 50),
    definition("joburi", "experience_required", "Experiență cerută", "text", 60),

    definition("afaceri-echipamente", "business_area", "Domeniu business", "text", 10, {
      isRequired: true,
    }),
    definition("afaceri-echipamente", "brand", "Brand", "text", 20),
    definition("afaceri-echipamente", "model", "Model", "text", 30),
    definition("afaceri-echipamente", "year", "An fabricație", "number", 40),
    definition("afaceri-echipamente", "usage_hours", "Ore funcționare", "number", 50),
    definition("afaceri-echipamente", "invoice_available", "Factură disponibilă", "boolean", 60),
    definition("afaceri-echipamente", "warranty", "Garanție", "boolean", 70),

    definition("animale", "pet_type", "Tip animal", "select", 10, {
      options: ["Câine", "Pisică", "Pasăre", "Pește", "Animal mic", "Altul"],
      isRequired: true,
    }),
    definition("animale", "breed", "Rasă", "text", 20),
    definition("animale", "age_months", "Vârstă", "number", 30, {
      unit: "luni",
    }),
    definition("animale", "gender", "Sex", "select", 40, {
      options: ["Mascul", "Femelă", "Necunoscut"],
    }),
    definition("animale", "vaccinated", "Vaccinat", "boolean", 50),
    definition("animale", "microchipped", "Microcipat", "boolean", 60),
    definition("animale", "pedigree", "Pedigree", "boolean", 70),

    definition("agricultura", "equipment_type", "Tip echipament/produs", "text", 10, {
      isRequired: true,
    }),
    definition("agricultura", "brand", "Brand", "text", 20),
    definition("agricultura", "model", "Model", "text", 30),
    definition("agricultura", "year", "An fabricație", "number", 40),
    definition("agricultura", "power_hp", "Putere", "number", 50, { unit: "CP" }),
    definition("agricultura", "working_width", "Lățime lucru", "number", 60, {
      unit: "m",
    }),
    definition("agricultura", "organic_certified", "Certificare organică", "boolean", 70),

    definition("hobby-arta", "item_type", "Tip articol", "text", 10, {
      isRequired: true,
    }),
    definition("hobby-arta", "author_artist", "Autor / artist", "text", 20),
    definition("hobby-arta", "year", "An", "number", 30),
    definition("hobby-arta", "edition", "Ediție", "text", 40),
    definition("hobby-arta", "material", "Material", "text", 50),
    definition("hobby-arta", "authenticity", "Autenticitate", "select", 60, {
      options: ["Certificat", "Fără certificat", "Necunoscut"],
    }),
    definition("hobby-arta", "condition_detail", "Detalii stare", "select", 70, {
      options: ["Nou", "Foarte bun", "Bun", "Necesită recondiționare"],
    }),

    definition("turism-evenimente", "service_type", "Tip ofertă", "select", 10, {
      options: ["Cazare", "Bilet", "Pachet", "Echipament", "Serviciu eveniment"],
      isRequired: true,
    }),
    definition("turism-evenimente", "date_availability", "Perioadă / dată", "text", 20),
    definition("turism-evenimente", "capacity", "Capacitate", "number", 30),
    definition("turism-evenimente", "location_type", "Tip locație", "select", 40, {
      options: ["Indoor", "Outdoor", "Mixt", "Online"],
    }),
    definition("turism-evenimente", "invoice_available", "Emite factură", "boolean", 50),

    definition("inchirieri", "rental_period", "Perioadă", "select", 10, {
      options: ["Oră", "Zi", "Săptămână", "Lună"],
      isRequired: true,
    }),
    definition("inchirieri", "deposit_required", "Garanție necesară", "boolean", 20),
    definition("inchirieri", "delivery_available", "Livrare disponibilă", "boolean", 30),
    definition("inchirieri", "min_rental_days", "Perioadă minimă", "number", 40, {
      unit: "zile",
    }),
    definition("inchirieri", "operator_included", "Operator inclus", "boolean", 50),

    definition("schimburi", "wanted_item", "Ce cauți la schimb", "text", 10, {
      isRequired: true,
    }),
    definition("schimburi", "accepts_difference", "Accept diferență de bani", "boolean", 20),
    definition("schimburi", "preferred_category", "Categorie preferată", "text", 30),
    definition("schimburi", "trade_radius", "Rază schimb", "number", 40, {
      unit: "km",
    }),
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
    imobiliare: ["rooms", "surface_sqm", "partitioning"],
    "casa-gradina": ["room", "material", "dimensions"],
    fashion: ["brand", "size"],
    sport: ["brand", "sport_type", "size"],
    "copii-bebe": ["age_group", "brand"],
    servicii: ["service_type", "availability", "coverage_area"],
    joburi: ["industry", "role_level", "work_mode"],
    "afaceri-echipamente": ["business_area", "brand", "model"],
    animale: ["pet_type", "breed", "age_months"],
    agricultura: ["equipment_type", "brand", "model"],
    "hobby-arta": ["item_type", "author_artist", "condition_detail"],
    "turism-evenimente": ["service_type", "date_availability", "capacity"],
    inchirieri: ["rental_period", "min_rental_days"],
    schimburi: ["wanted_item", "preferred_category"],
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
