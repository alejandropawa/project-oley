import { PromotionPackageCard } from "@/components/promotions/promotion-package-card";
import type { PromotionPackageConfig } from "@/lib/promotions/pricing";

export function PromotionPackagesGrid({
  packages,
}: {
  packages: PromotionPackageConfig[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {packages.map((promotionPackage) => (
        <PromotionPackageCard
          key={promotionPackage.code}
          promotionPackage={promotionPackage}
          recommended={promotionPackage.code === "featured_7d"}
        />
      ))}
    </div>
  );
}
