"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/user";
import { notifyUser } from "@/lib/db/notifications";
import { createReport } from "@/lib/db/reports";
import { isReportEntityType, isReportReason } from "@/lib/reporting-utils";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";

export type ReportActionResult = {
  success: boolean;
  error?: string;
  reportId?: string;
};

export async function submitReportAction({
  entityType,
  entityId,
  reason,
  description,
}: {
  entityType: string;
  entityId: string;
  reason: string;
  description?: string;
}): Promise<ReportActionResult> {
  if (!isReportEntityType(entityType) || !isReportReason(reason)) {
    return { success: false, error: "Datele raportării nu sunt valide." };
  }

  const supabase = await createClient();
  const result = await createReport(
    {
      entityType,
      entityId,
      reason: reason as Enums<"report_reason">,
      description,
    },
    supabase,
  );

  if (result.error) {
    return {
      success: false,
      error: getReportErrorMessage(result.error),
    };
  }

  const user = await getCurrentUser();

  if (user) {
    await notifyUser(
      {
        userId: user.id,
        type: "report_submitted",
        title: "Raportarea a fost trimisă",
        body: "Îți mulțumim. Echipa TROKO o va analiza.",
        actionUrl: "/notificari",
        data: {
          report_id: result.reportId,
          entity_type: entityType,
        },
      },
      supabase,
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/rapoarte");
  revalidatePath("/notificari");

  return {
    success: true,
    reportId: result.reportId ?? undefined,
  };
}

function getReportErrorMessage(error: string) {
  if (error === "NOT_AUTHENTICATED") {
    return "Intră în cont pentru a trimite raportarea.";
  }

  if (error === "SUPABASE_NOT_CONFIGURED") {
    return "Raportarea va fi disponibilă după configurarea Supabase.";
  }

  if (error === "DESCRIPTION_TOO_LONG") {
    return "Descrierea poate avea maximum 2000 de caractere.";
  }

  if (error === "CANNOT_REPORT_OWN_LISTING") {
    return "Nu poți raporta propriul anunț.";
  }

  if (error === "CANNOT_REPORT_OWN_MESSAGE") {
    return "Nu poți raporta propriul mesaj.";
  }

  if (error === "CANNOT_REPORT_SELF") {
    return "Nu poți raporta propriul profil.";
  }

  if (error === "TARGET_NOT_FOUND") {
    return "Nu am găsit elementul raportat sau nu ai acces la el.";
  }

  return "Nu am putut trimite raportarea. Încearcă din nou.";
}
