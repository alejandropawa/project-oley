import Link from "next/link";

import { AdminPromotionOrderActions } from "@/components/admin/admin-promotion-actions";
import { PromotionOrderStatusBadge } from "@/components/promotions/promotion-status-badge";
import { Button } from "@/components/ui/button";
import type { AdminPromotionOrder } from "@/lib/db/admin-promotions";
import { formatPromotionDate } from "@/lib/promotions/labels";
import { formatPromotionPrice } from "@/lib/promotions/pricing";

export function AdminPromotionOrderRow({
  order,
}: {
  order: AdminPromotionOrder;
}) {
  const isPending = order.status === "pending_review";

  return (
    <article className="grid gap-4 rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm lg:grid-cols-[1.2fr_0.8fr]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <PromotionOrderStatusBadge status={order.status} />
          <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
            #{order.id.slice(0, 8)}
          </span>
        </div>

        <h2 className="mt-3 text-lg font-semibold text-foreground">
          {order.listing?.title ?? "Anunț indisponibil"}
        </h2>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          {order.userDisplayName} · {order.package?.name ?? "Pachet necunoscut"} ·{" "}
          {formatPromotionPrice(order.amount_cents, order.currency)}
        </p>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          Creată pe {formatPromotionDate(order.created_at)}
        </p>

        {order.note ? (
          <p className="mt-3 rounded-[1rem] border border-border bg-background p-3 text-sm leading-6 text-muted-foreground">
            Notă utilizator: {order.note}
          </p>
        ) : null}
        {order.admin_note ? (
          <p className="mt-3 rounded-[1rem] border border-border bg-background p-3 text-sm leading-6 text-muted-foreground">
            Notă admin: {order.admin_note}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 lg:justify-items-end">
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          {order.listing ? (
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-full border-border bg-background px-4 text-sm font-semibold"
            >
              <Link href={`/anunturi/${order.listing.slug}`}>Vezi anunț</Link>
            </Button>
          ) : null}
        </div>
        {isPending ? (
          <AdminPromotionOrderActions orderId={order.id} />
        ) : (
          <p className="text-sm font-semibold text-muted-foreground">
            Solicitare procesată.
          </p>
        )}
      </div>
    </article>
  );
}
