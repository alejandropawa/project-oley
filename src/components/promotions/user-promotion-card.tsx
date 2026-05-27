import Link from "next/link";

import {
  ListingPromotionStatusBadge,
  PromotionOrderStatusBadge,
} from "@/components/promotions/promotion-status-badge";
import { Button } from "@/components/ui/button";
import {
  formatPromotionDate,
  getRemainingPromotionText,
} from "@/lib/promotions/labels";
import { formatPromotionPrice } from "@/lib/promotions/pricing";
import type {
  PromotionOrderWithDetails,
  UserListingPromotionWithDetails,
} from "@/lib/db/promotions";

export function ActivePromotionCard({
  promotion,
}: {
  promotion: UserListingPromotionWithDetails;
}) {
  return (
    <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <ListingPromotionStatusBadge status={promotion.status} />
          <h3 className="mt-3 text-lg font-black text-foreground">
            {promotion.listing?.title ?? "Anunț indisponibil"}
          </h3>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            {promotion.package?.name ?? "Pachet promovare"} ·{" "}
            {getRemainingPromotionText(promotion.ends_at)}
          </p>
        </div>
        {promotion.listing ? (
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-full border-border bg-background px-4 text-sm font-bold"
          >
            <Link href={`/anunturi/${promotion.listing.slug}`}>Vezi anunț</Link>
          </Button>
        ) : null}
      </div>
      <div className="mt-4 grid gap-2 text-sm font-semibold text-muted-foreground sm:grid-cols-2">
        <span>Start: {formatPromotionDate(promotion.starts_at)}</span>
        <span>Final: {formatPromotionDate(promotion.ends_at)}</span>
      </div>
    </article>
  );
}

export function PromotionOrderCard({
  order,
}: {
  order: PromotionOrderWithDetails;
}) {
  return (
    <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <PromotionOrderStatusBadge status={order.status} />
          <h3 className="mt-3 text-lg font-black text-foreground">
            {order.listing?.title ?? "Anunț indisponibil"}
          </h3>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            {order.package?.name ?? "Pachet promovare"} ·{" "}
            {formatPromotionPrice(order.amount_cents, order.currency)}
          </p>
        </div>
        {order.listing ? (
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-full border-border bg-background px-4 text-sm font-bold"
          >
            <Link href={`/anunturi/${order.listing.slug}`}>Vezi anunț</Link>
          </Button>
        ) : null}
      </div>
      <p className="mt-4 text-sm font-semibold text-muted-foreground">
        Creată pe {formatPromotionDate(order.created_at)}
      </p>
      {order.admin_note ? (
        <p className="mt-3 rounded-[1rem] border border-border bg-background p-3 text-sm leading-6 text-muted-foreground">
          Notă TROKO: {order.admin_note}
        </p>
      ) : null}
    </article>
  );
}
