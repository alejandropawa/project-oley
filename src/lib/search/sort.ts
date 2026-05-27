import type { Listing } from "@/lib/mock-data";
import type { SearchSort } from "@/lib/search/types";

export const searchSortOptions: Array<{ value: SearchSort; label: string }> = [
  { value: "relevance", label: "Relevanță" },
  { value: "newest", label: "Cele mai noi" },
  { value: "price_asc", label: "Preț crescător" },
  { value: "price_desc", label: "Preț descrescător" },
  { value: "promoted", label: "Promovate întâi" },
  { value: "distance", label: "Aproape de mine" },
];

export function sortSearchListings(listings: Listing[], sort: SearchSort) {
  const sorted = [...listings];

  if (sort === "distance") {
    return sorted.sort((a, b) => {
      if (a.distanceKm === null || a.distanceKm === undefined) {
        return 1;
      }

      if (b.distanceKm === null || b.distanceKm === undefined) {
        return -1;
      }

      return a.distanceKm - b.distanceKm;
    });
  }

  if (sort === "newest") {
    return sorted.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  if (sort === "price_asc") {
    return sorted.sort((a, b) => comparePrices(a, b, "asc"));
  }

  if (sort === "price_desc") {
    return sorted.sort((a, b) => comparePrices(a, b, "desc"));
  }

  return sorted.sort((a, b) => {
    const promotionScore = getPromotionScore(b) - getPromotionScore(a);

    if (promotionScore !== 0) {
      return promotionScore;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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

function getPromotionScore(listing: Listing) {
  if (listing.promotion?.type === "featured") {
    return 2;
  }

  if (listing.promotion?.type === "boost") {
    return 1;
  }

  return Number(listing.featured);
}
