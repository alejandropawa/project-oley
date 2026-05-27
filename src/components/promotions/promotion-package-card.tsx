import { CheckCircle2, Sparkles, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPromotionPrice, type PromotionPackageConfig } from "@/lib/promotions/pricing";
import { promotionTypeLabels } from "@/lib/promotions/labels";
import { cn } from "@/lib/utils";

export function PromotionPackageCard({
  promotionPackage,
  selected,
  recommended,
  actionLabel,
  onSelect,
}: {
  promotionPackage: PromotionPackageConfig;
  selected?: boolean;
  recommended?: boolean;
  actionLabel?: string;
  onSelect?: (packageId: string) => void;
}) {
  const Icon = promotionPackage.type === "featured" ? Sparkles : Zap;

  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm",
        selected && "border-primary shadow-soft",
        recommended && "bg-[#FFFDF8]",
      )}
    >
      {recommended ? (
        <Badge className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-black text-primary-foreground">
          Recomandat
        </Badge>
      ) : null}
      <span className="grid size-12 place-items-center rounded-[1rem] bg-muted text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="mt-5">
        <p className="text-sm font-black uppercase text-primary">
          {promotionTypeLabels[promotionPackage.type]}
        </p>
        <h3 className="mt-1 text-xl font-black text-foreground">
          {promotionPackage.name}
        </h3>
        <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
          {promotionPackage.description}
        </p>
      </div>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-black text-primary">
            {formatPromotionPrice(
              promotionPackage.price_cents,
              promotionPackage.currency,
            )}
          </p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            {promotionPackage.duration_days}{" "}
            {promotionPackage.duration_days === 1 ? "zi" : "zile"}
          </p>
        </div>
        {selected ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Ales
          </span>
        ) : null}
      </div>
      {onSelect ? (
        <Button
          type="button"
          onClick={() => onSelect(promotionPackage.id)}
          variant={selected ? "outline" : undefined}
          className={
            selected
              ? "mt-5 h-11 rounded-full border-border bg-background px-5 font-bold"
              : "mt-5 h-11 rounded-full bg-primary px-5 font-bold text-primary-foreground"
          }
        >
          {actionLabel ?? "Alege pachetul"}
        </Button>
      ) : null}
    </article>
  );
}
