import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminSetupState } from "@/components/admin/admin-setup-state";
import { ReportDetail } from "@/components/admin/report-detail";
import { getAuthDrawerPath } from "@/lib/auth/redirect";
import { isCurrentUserAdmin } from "@/lib/db/admin";
import { isSupabaseConfigured } from "@/lib/db/env";
import { getModerationEventsForReport } from "@/lib/db/moderation";
import { getReportById } from "@/lib/db/reports";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    absolute: "Raport — Admin TROKO",
  },
  description: "Detalii raport și acțiuni de moderare TROKO.",
};

type AdminReportDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminReportDetailPage({
  params,
}: AdminReportDetailPageProps) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <AdminLayout title="Raport" description="Detalii raportare TROKO.">
        <AdminSetupState />
      </AdminLayout>
    );
  }

  const supabase = await createClient();
  const admin = await isCurrentUserAdmin(supabase);

  if (!admin.user) {
    redirect(getAuthDrawerPath("login", `/admin/rapoarte/${id}`));
  }

  if (admin.source === "unavailable") {
    return (
      <AdminLayout title="Raport" description="Detalii raportare TROKO.">
        <AdminSetupState />
      </AdminLayout>
    );
  }

  if (!admin.isAdmin) {
    notFound();
  }

  const [reportResult, eventsResult] = await Promise.all([
    getReportById(id, supabase),
    getModerationEventsForReport(id, supabase),
  ]);

  if (reportResult.source === "unavailable") {
    return (
      <AdminLayout title="Raport" description="Detalii raportare TROKO.">
        <AdminSetupState title="Raportul nu este disponibil încă." />
      </AdminLayout>
    );
  }

  if (!reportResult.report) {
    notFound();
  }

  return (
    <AdminLayout title="Raport" description="Detalii raportare TROKO.">
      <ReportDetail
        report={reportResult.report}
        events={eventsResult.events}
      />
    </AdminLayout>
  );
}
