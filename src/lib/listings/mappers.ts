import type { CreateListingValues } from "@/lib/create-listing-validation";
import { getCommonListingFields } from "@/lib/categories/attribute-definitions";
import {
  getCityCoordinates,
  normalizeRomanianSlug,
} from "@/lib/romanian-cities";
import { getPublicLocationForListing } from "@/lib/locations/privacy";
import type { Listing, ListingCondition } from "@/lib/mock-data";
import type { Enums, Json, Tables } from "@/types/database";

export type DbListingWithImages = Tables<"listings"> & {
  listing_images?: Array<Pick<Tables<"listing_images">, "storage_path" | "sort_order" | "alt_text">>;
};

const conditionToDb: Record<ListingCondition, Enums<"listing_condition">> = {
  Nou: "new",
  "Foarte bun": "very_good",
  Bun: "good",
  Folosit: "used",
  "Nu se aplică": "not_applicable",
};

const conditionFromDb: Record<Enums<"listing_condition">, ListingCondition> = {
  new: "Nou",
  very_good: "Foarte bun",
  good: "Bun",
  used: "Folosit",
  not_applicable: "Nu se aplică",
};

export function mapUiConditionToDb(condition: ListingCondition) {
  return conditionToDb[condition];
}

export function mapUiContactPreferenceToDb(
  preference: CreateListingValues["contactPreference"],
): Enums<"contact_preference"> {
  if (preference === "chat-phone") {
    return "both";
  }

  return preference;
}

export function mapDbContactPreferenceToUi(
  preference: Enums<"contact_preference"> | null | undefined,
): CreateListingValues["contactPreference"] {
  if (preference === "both") {
    return "chat-phone";
  }

  return preference ?? "chat";
}

export function mapDbListingToListing(
  row: DbListingWithImages,
  getImageUrl?: (storagePath: string) => string,
): Listing {
  const sortedImages = [...(row.listing_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const fallbackPublicLocation = getCityCoordinates(row.city, row.county);

  return {
    id: row.id,
    userId: row.user_id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    price: row.price_cents === null ? null : row.price_cents / 100,
    currency: row.currency === "EUR" ? "EUR" : "lei",
    city: row.city,
    county: row.county,
    citySlug: row.city_slug ?? undefined,
    countySlug: row.county_slug ?? undefined,
    publicLatitude:
      typeof row.public_latitude === "number"
        ? row.public_latitude
        : fallbackPublicLocation?.latitude ?? null,
    publicLongitude:
      typeof row.public_longitude === "number"
        ? row.public_longitude
        : fallbackPublicLocation?.longitude ?? null,
    locationPrecision: row.location_precision,
    locationLabel: row.location_label,
    categorySlug: row.category_slug,
    type: row.type,
    condition: conditionFromDb[row.condition],
    attributes: mapJsonAttributes(row.attributes),
    brand: row.brand,
    model: row.model,
    year: row.year,
    createdAt: row.created_at,
    seller: {
      name: "Utilizator TROKO",
      city: row.city,
      joinedAt: new Date(row.created_at).getFullYear().toString(),
      verified: false,
      rating: "nou",
    },
    featured: false,
    visualStyle:
      "linear-gradient(135deg, #E8F1EE 0%, #FFF2CF 52%, #E9B44C 100%)",
    imageUrls: getImageUrl
      ? sortedImages.map((image) => getImageUrl(image.storage_path))
      : [],
    status: row.status,
    isNegotiable: row.is_negotiable,
    subcategory: row.subcategory ?? undefined,
  };
}

export function priceToCents(price: string) {
  const trimmed = price.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed.replace(",", "."));

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.round(parsed * 100);
}

export function getListingSearchFields(input: CreateListingValues) {
  const commonFields = getCommonListingFields(input.attributes);
  const publicLocation = getPublicLocationForListing({
    city: input.city,
    county: input.county,
    latitude: input.latitude,
    longitude: input.longitude,
    precision: input.locationPrecision,
    slug: input.title,
  });

  return {
    ...commonFields,
    city_slug: normalizeRomanianSlug(input.city),
    county_slug: normalizeRomanianSlug(input.county),
    public_latitude: publicLocation?.latitude ?? null,
    public_longitude: publicLocation?.longitude ?? null,
    search_text: [
      input.title,
      input.description,
      input.categorySlug,
      input.subcategory,
      input.city,
      input.county,
      commonFields.brand,
      commonFields.model,
      JSON.stringify(input.attributes),
    ]
      .filter(Boolean)
      .join(" "),
  };
}

export function mapJsonAttributes(value: Json | null | undefined) {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return {};
  }

  const attributes: Listing["attributes"] = {};

  for (const [key, item] of Object.entries(value)) {
    if (
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean" ||
      item === null
    ) {
      attributes[key] = item;
    } else if (Array.isArray(item)) {
      attributes[key] = item.filter(
        (entry): entry is string => typeof entry === "string",
      );
    }
  }

  return attributes;
}
