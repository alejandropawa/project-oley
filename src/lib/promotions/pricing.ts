import type { Enums, Tables } from "@/types/database";

export type PromotionPackageConfig = Pick<
  Tables<"promotion_packages">,
  | "id"
  | "code"
  | "name"
  | "description"
  | "type"
  | "duration_days"
  | "price_cents"
  | "currency"
  | "is_active"
  | "sort_order"
> & {
  created_at?: string;
  updated_at?: string;
};

export const promotionPackageSeeds: PromotionPackageConfig[] = [
  {
    id: "boost_24h",
    code: "boost_24h",
    name: "Boost 24h",
    description: "Anunțul tău apare mai sus în rezultate timp de 24 de ore.",
    type: "boost",
    duration_days: 1,
    price_cents: 900,
    currency: "RON",
    is_active: true,
    sort_order: 10,
  },
  {
    id: "boost_7d",
    code: "boost_7d",
    name: "Boost 7 zile",
    description: "Vizibilitate crescută pentru o săptămână.",
    type: "boost",
    duration_days: 7,
    price_cents: 2900,
    currency: "RON",
    is_active: true,
    sort_order: 20,
  },
  {
    id: "featured_7d",
    code: "featured_7d",
    name: "Promovat 7 zile",
    description: "Badge Promovat și poziționare prioritară în paginile relevante.",
    type: "featured",
    duration_days: 7,
    price_cents: 4900,
    currency: "RON",
    is_active: true,
    sort_order: 30,
  },
  {
    id: "featured_30d",
    code: "featured_30d",
    name: "Promovat 30 zile",
    description: "Vizibilitate extinsă pentru anunțuri importante.",
    type: "featured",
    duration_days: 30,
    price_cents: 14900,
    currency: "RON",
    is_active: true,
    sort_order: 40,
  },
];

export function formatPromotionPrice(priceCents: number, currency = "RON") {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency,
    maximumFractionDigits: priceCents % 100 === 0 ? 0 : 2,
  }).format(priceCents / 100);
}

export function isPromotionOrderStatus(
  value: string,
): value is Enums<"promotion_order_status"> {
  return [
    "draft",
    "pending_review",
    "approved",
    "rejected",
    "cancelled",
  ].includes(value);
}

export function isListingPromotionStatus(
  value: string,
): value is Enums<"listing_promotion_status"> {
  return ["scheduled", "active", "expired", "cancelled"].includes(value);
}
