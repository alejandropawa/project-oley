import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AdminExpirePromotionButton } from "@/components/admin/admin-promotion-actions";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminPromotionOrderRow } from "@/components/admin/admin-promotion-order-row";
import { AdminSetupState } from "@/components/admin/admin-setup-state";
import { ListingPromotionStatusBadge } from "@/components/promotions/promotion-status-badge";
import { Button } from "@/components/ui/button";
import {
  getActivePromotionsForAdmin,
  getPromotionOrdersForAdmin,
} from "@/lib/db/admin-promotions";
import { isCurrentUserAdmin } from "@/lib/db/admin";
import { isSupabaseConfigured } from "@/lib/db/env";
import { getActivePromotionPackages } from "@/lib/db/promotions";
import { formatPromotionDate } from "@/lib/promotions/labels";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    absolute: "Promovări — Admin TROKO",
  },
  description: "Administrare solicitări și promovări active TROKO.",
};

type AdminPromotionsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPromotionsPage({
  searchParams,
}: AdminPromotionsPageProps) {
  const params = await searchParams;
  const filters = {
    status: first(params.status),
    packageId: first(params.package),
    date: first(params.date),
  };

  if (!isSupabaseConfigured()) {
    return (
      <AdminLayout
        title="Promovări"
        description="Revizuiește solicitări și activează promovări manual."
      >
        <AdminSetupState
          title="Promovările admin vor fi disponibile după configurarea Supabase."
          description="Aplică migrarea 0004_troko_promotions.sql și păstrează accesul prin tabela admin_users."
        />
      </AdminLayout>
    );
  }

  const supabase = await createClient();
  const admin = await isCurrentUserAdmin(supabase);

  if (!admin.user) {
    redirect("/?auth=login&redirectTo=/admin/promovari");
  }

  if (admin.source === "unavailable") {
    return (
      <AdminLayout
        title="Promovări"
        description="Revizuiește solicitări și activează promovări manual."
      >
        <AdminSetupState />
      </AdminLayout>
    );
  }

  if (!admin.isAdmin) {
    notFound();
  }

  const [packagesResult, ordersResult, activePromotionsResult] = await Promise.all([
    getActivePromotionPackages(supabase),
    getPromotionOrdersForAdmin(filters, supabase),
    getActivePromotionsForAdmin(supabase),
  ]);

  return (
    <AdminLayout
      title="Promovări"
      description="Solicitări manuale de promovare, pachete și campanii active."
    >
      <div className="grid gap-8">
        <form className="grid gap-3 rounded-[1.5rem] border border-border bg-card p-4 shadow-soft-sm sm:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-foreground">
              Status
            </span>
            <select
              name="status"
              defaultValue={filters.status ?? ""}
              className="h-12 w-full rounded-[1rem] border border-input bg-background px-3"
            >
              <option value="">Toate</option>
              <option value="pending_review">În analiză</option>
              <option value="approved">Aprobate</option>
              <option value="rejected">Respinse</option>
              <option value="cancelled">Anulate</option>
              <option value="draft">Ciorne</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-foreground">
              Pachet
            </span>
            <select
              name="package"
              defaultValue={filters.packageId ?? ""}
              className="h-12 w-full rounded-[1rem] border border-input bg-background px-3"
            >
              <option value="">Toate</option>
              {packagesResult.packages.map((promotionPackage) => (
                <option key={promotionPackage.id} value={promotionPackage.id}>
                  {promotionPackage.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-foreground">
              Dată
            </span>
            <select
              name="date"
              defaultValue={filters.date ?? ""}
              className="h-12 w-full rounded-[1rem] border border-input bg-background px-3"
            >
              <option value="">Oricând</option>
              <option value="today">Astăzi</option>
              <option value="7d">Ultimele 7 zile</option>
              <option value="30d">Ultimele 30 de zile</option>
            </select>
          </label>
          <div className="self-end">
            <button className="h-12 rounded-full bg-action px-5 text-sm font-bold text-action-foreground hover:bg-action-hover">
              Filtrează
            </button>
          </div>
        </form>

        <section className="grid gap-4">
          <div>
            <p className="text-sm font-black uppercase text-primary">
              Solicitări
            </p>
            <h2 className="mt-1 text-2xl font-black text-foreground">
              Solicitări de promovare
            </h2>
          </div>
          {ordersResult.source === "unavailable" ? (
            <AdminSetupState title="Solicitările nu sunt disponibile încă." />
          ) : ordersResult.orders.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-border bg-card p-8 text-center shadow-soft-sm">
              <h2 className="text-2xl font-black text-foreground">
                Nu există solicitări pentru filtrele selectate.
              </h2>
            </div>
          ) : (
            <div className="grid gap-4">
              {ordersResult.orders.map((order) => (
                <AdminPromotionOrderRow key={order.id} order={order} />
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-4">
          <div>
            <p className="text-sm font-black uppercase text-primary">
              Campanii
            </p>
            <h2 className="mt-1 text-2xl font-black text-foreground">
              Promovări active sau programate
            </h2>
          </div>
          {activePromotionsResult.promotions.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-border bg-card p-6 text-sm leading-6 text-muted-foreground shadow-soft-sm">
              Nu există promovări active sau programate.
            </div>
          ) : (
            <div className="grid gap-4">
              {activePromotionsResult.promotions.map((promotion) => (
                <article
                  key={promotion.id}
                  className="grid gap-4 rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm lg:grid-cols-[1fr_auto]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <ListingPromotionStatusBadge status={promotion.status} />
                      <span className="rounded-full bg-background px-3 py-1 text-xs font-black text-muted-foreground">
                        {promotion.package?.name ?? "Pachet promovare"}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-black text-foreground">
                      {promotion.listing?.title ?? "Anunț indisponibil"}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-muted-foreground">
                      Final: {formatPromotionDate(promotion.ends_at)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                    {promotion.listing ? (
                      <Button
                        asChild
                        variant="outline"
                        className="h-10 rounded-full border-border bg-background px-4 text-sm font-bold"
                      >
                        <Link href={`/anunturi/${promotion.listing.slug}`}>
                          Vezi anunț
                        </Link>
                      </Button>
                    ) : null}
                    <AdminExpirePromotionButton promotionId={promotion.id} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
