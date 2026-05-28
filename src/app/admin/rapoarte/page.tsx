import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminSetupState } from "@/components/admin/admin-setup-state";
import { ReportCard } from "@/components/admin/report-card";
import { ReportFilters } from "@/components/admin/report-filters";
import { isCurrentUserAdmin } from "@/lib/db/admin";
import { isSupabaseConfigured } from "@/lib/db/env";
import { getReports } from "@/lib/db/reports";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    absolute: "Rapoarte — Admin TROKO",
  },
  description: "Lista de raportări trimise către echipa TROKO.",
};

type AdminReportsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminReportsPage({
  searchParams,
}: AdminReportsPageProps) {
  const params = await searchParams;
  const filters = {
    status: first(params.status),
    entityType: first(params.entityType),
    reason: first(params.reason),
  };

  if (!isSupabaseConfigured()) {
    return (
      <AdminLayout title="Rapoarte" description="Analizează raportările TROKO.">
        <AdminSetupState />
      </AdminLayout>
    );
  }

  const supabase = await createClient();
  const admin = await isCurrentUserAdmin(supabase);

  if (!admin.user) {
    redirect("/?auth=login&redirectTo=/admin/rapoarte");
  }

  if (admin.source === "unavailable") {
    return (
      <AdminLayout title="Rapoarte" description="Analizează raportările TROKO.">
        <AdminSetupState />
      </AdminLayout>
    );
  }

  if (!admin.isAdmin) {
    notFound();
  }

  const reports = await getReports(filters, supabase);

  return (
    <AdminLayout title="Rapoarte" description="Analizează raportările TROKO.">
      <div className="grid gap-5">
        <ReportFilters filters={filters} />
        {reports.source === "unavailable" ? (
          <AdminSetupState title="Rapoartele nu sunt disponibile încă." />
        ) : reports.reports.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-border bg-card p-8 text-center shadow-soft-sm">
            <h2 className="text-2xl font-black text-foreground">
              Nu există rapoarte pentru filtrele selectate.
            </h2>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.reports.map((report) => (
              <ReportCard key={report.report.id} report={report} />
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
