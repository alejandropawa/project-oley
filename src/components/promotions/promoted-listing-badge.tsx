import { Badge } from "@/components/ui/badge";
import { promotionTypeLabels } from "@/lib/promotions/labels";
import { cn } from "@/lib/utils";
import type { Enums } from "@/types/database";

export function PromotedListingBadge({
  type,
  className,
}: {
  type: Enums<"promotion_package_type">;
  className?: string;
}) {
  return (
    <Badge
      className={cn(
        "rounded-full border border-warm/45 bg-secondary px-3 py-1 text-xs font-semibold text-warm-foreground shadow-soft-sm",
        type === "featured" && "border-brand-border bg-brand-soft text-brand",
        className,
      )}
    >
      {promotionTypeLabels[type]}
    </Badge>
  );
}
