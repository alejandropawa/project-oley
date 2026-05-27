import type { Enums } from "@/types/database";

export const promotionTypeLabels: Record<
  Enums<"promotion_package_type">,
  string
> = {
  boost: "Boost",
  featured: "Promovat",
};

export const promotionOrderStatusLabels: Record<
  Enums<"promotion_order_status">,
  string
> = {
  draft: "Ciornă",
  pending_review: "În analiză",
  approved: "Aprobată",
  rejected: "Respinsă",
  cancelled: "Anulată",
};

export const listingPromotionStatusLabels: Record<
  Enums<"listing_promotion_status">,
  string
> = {
  scheduled: "Programată",
  active: "Activă",
  expired: "Expirată",
  cancelled: "Anulată",
};

export function formatPromotionDate(value: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getRemainingPromotionText(endsAt: string) {
  const remainingMs = new Date(endsAt).getTime() - Date.now();

  if (remainingMs <= 0) {
    return "expirată";
  }

  const days = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

  if (days <= 1) {
    return "sub 24h rămase";
  }

  return `${days} zile rămase`;
}
