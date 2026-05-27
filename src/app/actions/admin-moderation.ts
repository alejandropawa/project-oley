"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/db/admin";
import {
  addModerationEvent,
  archiveListingForModeration,
  expireListingForModeration,
  reactivateListingForModeration,
} from "@/lib/db/moderation";
import { notifyUser } from "@/lib/db/notifications";
import { getReportById, updateReportStatus } from "@/lib/db/reports";
import { isReportStatus, reportStatusLabels } from "@/lib/reporting-utils";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";

export type AdminModerationActionResult = {
  success: boolean;
  error?: string;
};

export async function updateReportStatusAction({
  reportId,
  status,
}: {
  reportId: string;
  status: string;
}): Promise<AdminModerationActionResult> {
  const supabase = await createClient();
  const admin = await requireAdmin(supabase);

  if (admin.error || !admin.user) {
    return { success: false, error: getAdminError(admin.error) };
  }

  if (!isReportStatus(status)) {
    return { success: false, error: "Statusul nu este valid." };
  }

  const reportBefore = await getReportById(reportId, supabase);
  const result = await updateReportStatus(reportId, status, admin.user.id, supabase);

  if (result.error) {
    return { success: false, error: "Nu am putut actualiza raportul." };
  }

  await addModerationEvent(
    {
      reportId,
      adminId: admin.user.id,
      action: getActionForStatus(status),
    },
    supabase,
  );

  const reporterId = reportBefore.report?.report.reporter_id;

  if (reporterId) {
    await notifyUser(
      {
        userId: reporterId,
        type: "report_status_changed",
        title: "Raportarea ta a fost actualizată",
        body: `Status: ${reportStatusLabels[status]}`,
        actionUrl: "/notificari",
        data: { report_id: reportId, status },
        emailData: {
          statusLabel: reportStatusLabels[status],
        },
      },
      supabase,
    );
  }

  revalidateAdmin(reportId);
  revalidatePath("/notificari");
  return { success: true };
}

export async function addModerationNoteAction({
  reportId,
  note,
}: {
  reportId: string;
  note: string;
}): Promise<AdminModerationActionResult> {
  const supabase = await createClient();
  const admin = await requireAdmin(supabase);

  if (admin.error || !admin.user) {
    return { success: false, error: getAdminError(admin.error) };
  }

  const cleanNote = note.trim();

  if (!cleanNote) {
    return { success: false, error: "Scrie o notă internă." };
  }

  if (cleanNote.length > 2000) {
    return { success: false, error: "Nota poate avea maximum 2000 de caractere." };
  }

  const result = await addModerationEvent(
    {
      reportId,
      adminId: admin.user.id,
      action: "note_added",
      note: cleanNote,
    },
    supabase,
  );

  if (result.error) {
    return { success: false, error: "Nu am putut adăuga nota." };
  }

  revalidateAdmin(reportId);
  return { success: true };
}

export async function moderateListingAction({
  listingId,
  reportId,
  action,
}: {
  listingId: string;
  reportId?: string | null;
  action: "archive" | "reactivate" | "expire";
}): Promise<AdminModerationActionResult> {
  const supabase = await createClient();
  const admin = await requireAdmin(supabase);

  if (admin.error || !admin.user) {
    return { success: false, error: getAdminError(admin.error) };
  }

  const result =
    action === "archive"
      ? await archiveListingForModeration(
          listingId,
          admin.user.id,
          reportId ?? null,
          supabase,
        )
      : action === "reactivate"
        ? await reactivateListingForModeration(
            listingId,
            admin.user.id,
            reportId ?? null,
            supabase,
          )
        : await expireListingForModeration(
            listingId,
            admin.user.id,
            reportId ?? null,
            supabase,
          );

  if (result.error) {
    return { success: false, error: "Nu am putut actualiza anunțul." };
  }

  const { data: listing } = supabase
    ? await supabase
        .from("listings")
        .select("user_id, title")
        .eq("id", listingId)
        .maybeSingle()
    : { data: null };

  if (listing?.user_id) {
    await notifyUser(
      {
        userId: listing.user_id,
        type: "listing_status_changed",
        title: "Statusul anunțului tău s-a schimbat",
        body: `${listing.title}: ${getListingStatusCopy(action)}`,
        actionUrl: "/cont/anunturi",
        data: { listing_id: listingId, action },
        emailData: {
          listingTitle: listing.title,
          statusLabel: getListingStatusCopy(action),
        },
      },
      supabase,
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/anunturi");
  revalidatePath("/notificari");
  if (reportId) {
    revalidatePath(`/admin/rapoarte/${reportId}`);
  }

  return { success: true };
}

function getActionForStatus(
  status: Enums<"report_status">,
): Enums<"moderation_action_type"> {
  if (status === "in_review") {
    return "report_in_review";
  }

  if (status === "resolved") {
    return "report_resolved";
  }

  if (status === "dismissed") {
    return "report_dismissed";
  }

  return "report_in_review";
}

function getAdminError(error: string | null) {
  if (error === "NOT_AUTHENTICATED") {
    return "Intră în cont pentru a continua.";
  }

  if (error === "ADMIN_UNAVAILABLE") {
    return "Admin dashboard-ul va fi disponibil după configurarea Supabase.";
  }

  return "Nu ai acces la zona de administrare.";
}

function revalidateAdmin(reportId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/rapoarte");
  revalidatePath(`/admin/rapoarte/${reportId}`);
}

function getListingStatusCopy(action: "archive" | "reactivate" | "expire") {
  if (action === "archive") {
    return "anunț arhivat";
  }

  if (action === "reactivate") {
    return "anunț reactivat";
  }

  return "anunț expirat";
}
