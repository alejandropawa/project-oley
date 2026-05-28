import { categories, listings } from "@/lib/mock-data";
import type { Category, Listing, ListingType } from "@/lib/mock-data";

export type ListingSort =
  | "relevant"
  | "newest"
  | "price-asc"
  | "price-desc";

export type ListingFilters = {
  q: string;
  category: string;
  type: string;
  city: string;
  min: string;
  max: string;
  sort: ListingSort;
};

export type SearchParams = Record<string, string | string[] | undefined>;

export const listingTypeLabels: Record<ListingType, string> = {
  sell: "Vânzare",
  buy: "Cumpărare",
  rent: "Închiriere",
  swap: "Schimb",
};

export const listingTypeOptions = [
  { value: "all", label: "Toate" },
  { value: "sell", label: "Vânzare" },
  { value: "buy", label: "Cumpărare" },
  { value: "rent", label: "Închiriere" },
  { value: "swap", label: "Schimb" },
] as const;

export const listingSortOptions = [
  { value: "relevant", label: "Cele mai relevante" },
  { value: "newest", label: "Cele mai noi" },
  { value: "price-asc", label: "Preț crescător" },
  { value: "price-desc", label: "Preț descrescător" },
] as const;

export function getFirstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export function getListingFilters(searchParams: SearchParams): ListingFilters {
  const sort = getFirstParam(searchParams.sort);

  return {
    q: getFirstParam(searchParams.q),
    category: getFirstParam(searchParams.category),
    type: getFirstParam(searchParams.type) || "all",
    city: getFirstParam(searchParams.city),
    min: getFirstParam(searchParams.min),
    max: getFirstParam(searchParams.max),
    sort: isListingSort(sort) ? sort : "relevant",
  };
}

export function isListingType(value: string): value is ListingType {
  return ["sell", "buy", "rent", "swap"].includes(value);
}

function isListingSort(value: string): value is ListingSort {
  return ["relevant", "newest", "price-asc", "price-desc"].includes(value);
}

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getListingBySlug(slug: string) {
  return listings.find((listing) => listing.slug === slug);
}

export function getListingsByCategory(slug: string) {
  return listings.filter((listing) => listing.categorySlug === slug);
}

export function getListingCategory(listing: Listing): Category {
  return (
    getCategoryBySlug(listing.categorySlug) ??
    categories.find((category) => category.slug === "schimburi")!
  );
}

export function getListingCount(categorySlug: string) {
  return getListingsByCategory(categorySlug).length;
}

export function getCityOptions() {
  return Array.from(new Set(listings.map((listing) => listing.city))).sort(
    (a, b) => a.localeCompare(b, "ro"),
  );
}

export function formatListingPrice(listing: Listing) {
  if (listing.type === "swap" || listing.price === null || !listing.currency) {
    return "Schimb";
  }

  const amount = new Intl.NumberFormat("ro-RO").format(listing.price);
  const price = `${amount} ${listing.currency}`;

  if (listing.pricePrefix) {
    return `${listing.pricePrefix} ${price}`;
  }

  return price;
}

export function filterListings(
  sourceListings: Listing[],
  filters: ListingFilters,
) {
  const query = normalize(filters.q);
  const min = Number(filters.min);
  const max = Number(filters.max);
  const hasMin = filters.min.trim() !== "" && Number.isFinite(min);
  const hasMax = filters.max.trim() !== "" && Number.isFinite(max);

  const filtered = sourceListings.filter((listing) => {
    const category = getListingCategory(listing);
    const haystack = normalize(
      [
        listing.title,
        listing.description,
        listing.city,
        listing.county,
        category.name,
        listing.seller.name,
      ].join(" "),
    );

    if (query && !haystack.includes(query)) {
      return false;
    }

    if (filters.category && listing.categorySlug !== filters.category) {
      return false;
    }

    if (
      filters.type &&
      filters.type !== "all" &&
      isListingType(filters.type) &&
      listing.type !== filters.type
    ) {
      return false;
    }

    if (filters.city && listing.city !== filters.city) {
      return false;
    }

    if ((hasMin || hasMax) && listing.price === null) {
      return false;
    }

    if (hasMin && listing.price !== null && listing.price < min) {
      return false;
    }

    if (hasMax && listing.price !== null && listing.price > max) {
      return false;
    }

    return true;
  });

  return sortListings(filtered, filters.sort);
}

function sortListings(sourceListings: Listing[], sort: ListingSort) {
  const sorted = [...sourceListings];

  if (sort === "newest") {
    return sorted.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  if (sort === "price-asc") {
    return sorted.sort((a, b) => comparePrices(a, b, "asc"));
  }

  if (sort === "price-desc") {
    return sorted.sort((a, b) => comparePrices(a, b, "desc"));
  }

  return sorted.sort((a, b) => {
    const promotionScore =
      getPromotionScore(b) - getPromotionScore(a);

    if (promotionScore !== 0) {
      return promotionScore;
    }

    return Number(b.featured) - Number(a.featured);
  });
}

function comparePrices(a: Listing, b: Listing, direction: "asc" | "desc") {
  if (a.price === null && b.price === null) {
    return 0;
  }

  if (a.price === null) {
    return 1;
  }

  if (b.price === null) {
    return -1;
  }

  return direction === "asc" ? a.price - b.price : b.price - a.price;
}

function normalize(value: string) {
  return value
    .toLocaleLowerCase("ro")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getPromotionScore(listing: Listing) {
  if (listing.promotion?.type === "featured") {
    return 2;
  }

  if (listing.promotion?.type === "boost") {
    return 1;
  }

  return 0;
}
