import { Badge } from "@/components/ui/badge";
import {
  listingPromotionStatusLabels,
  promotionOrderStatusLabels,
} from "@/lib/promotions/labels";
import { cn } from "@/lib/utils";
import type { Enums } from "@/types/database";

export function PromotionOrderStatusBadge({
  status,
}: {
  status: Enums<"promotion_order_status">;
}) {
  return (
    <Badge
      className={cn(
        "rounded-full px-3 py-1 text-xs font-black",
        status === "pending_review" && "bg-secondary text-warm-foreground",
        status === "approved" && "bg-brand-soft text-brand",
        status === "rejected" && "bg-destructive/10 text-destructive",
        status === "cancelled" && "bg-background text-muted-foreground",
        status === "draft" && "bg-muted text-primary",
      )}
    >
      {promotionOrderStatusLabels[status]}
    </Badge>
  );
}

export function ListingPromotionStatusBadge({
  status,
}: {
  status: Enums<"listing_promotion_status">;
}) {
  return (
    <Badge
      className={cn(
        "rounded-full px-3 py-1 text-xs font-black",
        status === "active" && "bg-brand-soft text-brand",
        status === "scheduled" && "bg-secondary text-warm-foreground",
        status === "expired" && "bg-background text-muted-foreground",
        status === "cancelled" && "bg-destructive/10 text-destructive",
      )}
    >
      {listingPromotionStatusLabels[status]}
    </Badge>
  );
}
