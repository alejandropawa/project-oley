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
        "rounded-full border border-[#F3D88D] bg-[#FFF2CF] px-3 py-1 text-xs font-black text-[#7A5718] shadow-soft-sm",
        type === "featured" && "border-[#CFE3DD] bg-[#E8F1EE] text-[#2F6F65]",
        className,
      )}
    >
      {promotionTypeLabels[type]}
    </Badge>
  );
}
