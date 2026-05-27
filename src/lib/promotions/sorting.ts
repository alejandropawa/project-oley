import type { Listing } from "@/lib/mock-data";

export function sortPromotedFirst<T extends Listing>(listings: T[]) {
  return [...listings].sort((a, b) => {
    const scoreA = getPromotionScore(a);
    const scoreB = getPromotionScore(b);

    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function shouldPromoteForSort(sort: string) {
  return sort === "relevant";
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
