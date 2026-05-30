import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminListingRow } from "@/components/admin/admin-listing-row";
import { AdminSetupState } from "@/components/admin/admin-setup-state";
import { isCurrentUserAdmin, getAdminListings } from "@/lib/db/admin";
import { isSupabaseConfigured } from "@/lib/db/env";
import { categories } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    absolute: "Moderare anunțuri — Admin TROKO",
  },
  description: "Moderare anunțuri TROKO.",
};

type AdminListingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminListingsPage({
  searchParams,
}: AdminListingsPageProps) {
  const params = await searchParams;
  const filters = {
    status: first(params.status),
    category: first(params.category),
    city: first(params.city),
    reportedOnly: first(params.reportedOnly) === "true",
  };

  if (!isSupabaseConfigured()) {
    return (
      <AdminLayout title="Moderare anunțuri" description="Revizuiește anunțuri.">
        <AdminSetupState />
      </AdminLayout>
    );
  }

  const supabase = await createClient();
  const admin = await isCurrentUserAdmin(supabase);

  if (!admin.user) {
    redirect("/?auth=login&redirectTo=/admin/anunturi");
  }

  if (admin.source === "unavailable") {
    return (
      <AdminLayout title="Moderare anunțuri" description="Revizuiește anunțuri.">
        <AdminSetupState />
      </AdminLayout>
    );
  }

  if (!admin.isAdmin) {
    notFound();
  }

  const listings = await getAdminListings(filters, supabase);

  return (
    <AdminLayout
      title="Moderare anunțuri"
      description="Revizuiește statusul, raportările și acțiunile de moderare pentru anunțuri."
    >
      <div className="grid gap-5">
        <form className="grid gap-3 rounded-[1.5rem] border border-border bg-card p-4 shadow-soft-sm sm:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-foreground">
              Status
            </span>
            <select
              name="status"
              defaultValue={filters.status ?? ""}
              className="h-12 w-full rounded-[1rem] border border-input bg-background px-3"
            >
              <option value="">Toate</option>
              <option value="active">Active</option>
              <option value="archived">Arhivate</option>
              <option value="expired">Expirate</option>
              <option value="sold">Vândute</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-foreground">
              Categorie
            </span>
            <select
              name="category"
              defaultValue={filters.category ?? ""}
              className="h-12 w-full rounded-[1rem] border border-input bg-background px-3"
            >
              <option value="">Toate</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-foreground">
              Oraș
            </span>
            <input
              name="city"
              defaultValue={filters.city ?? ""}
              placeholder="ex. București"
              className="h-12 w-full rounded-[1rem] border border-input bg-background px-3"
            />
          </label>
          <label className="flex items-center gap-2 self-end rounded-[1rem] border border-border bg-background px-3 py-3">
            <input
              type="checkbox"
              name="reportedOnly"
              value="true"
              defaultChecked={filters.reportedOnly}
              className="size-4 accent-brand"
            />
            <span className="text-sm font-semibold text-foreground">
              Doar raportate
            </span>
          </label>
          <button className="h-12 rounded-full bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover sm:col-span-4 sm:w-fit">
            Filtrează
          </button>
        </form>

        {listings.source === "unavailable" ? (
          <AdminSetupState title="Anunțurile nu sunt disponibile încă." />
        ) : listings.listings.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-border bg-card p-8 text-center shadow-soft-sm">
            <h2 className="text-2xl font-semibold text-foreground">
              Nu există anunțuri pentru filtrele selectate.
            </h2>
          </div>
        ) : (
          <div className="grid gap-4">
            {listings.listings.map((row) => (
              <AdminListingRow key={row.listing.id} row={row} />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
