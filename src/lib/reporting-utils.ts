import type { Enums } from "@/types/database";

export const reportEntityLabels: Record<Enums<"report_entity_type">, string> = {
  listing: "Anunț",
  conversation: "Conversație",
  message: "Mesaj",
  user: "Utilizator",
};

export const reportReasonLabels: Record<Enums<"report_reason">, string> = {
  fraud: "Fraudă / înșelătorie",
  spam: "Spam",
  duplicate: "Anunț duplicat",
  wrong_category: "Categorie greșită",
  inappropriate: "Conținut nepotrivit",
  prohibited: "Produs/serviciu interzis",
  harassment: "Hărțuire",
  other: "Alt motiv",
};

export const reportStatusLabels: Record<Enums<"report_status">, string> = {
  open: "Deschis",
  in_review: "În analiză",
  resolved: "Rezolvat",
  dismissed: "Respins",
};

export const moderationActionLabels: Record<
  Enums<"moderation_action_type">,
  string
> = {
  report_created: "Raport creat",
  report_in_review: "Raport marcat în analiză",
  report_resolved: "Raport rezolvat",
  report_dismissed: "Raport respins",
  note_added: "Notă adăugată",
  listing_archived: "Anunț arhivat",
  listing_reactivated: "Anunț reactivat",
  listing_expired: "Anunț expirat",
  listing_deleted: "Anunț șters",
  user_reviewed: "Utilizator analizat",
  conversation_reviewed: "Conversație analizată",
  message_reviewed: "Mesaj analizat",
};

export const reportReasonOptions = Object.entries(reportReasonLabels).map(
  ([value, label]) => ({
    value: value as Enums<"report_reason">,
    label,
  }),
);

export function isReportReason(value: string): value is Enums<"report_reason"> {
  return value in reportReasonLabels;
}

export function isReportStatus(value: string): value is Enums<"report_status"> {
  return value in reportStatusLabels;
}

export function isReportEntityType(
  value: string,
): value is Enums<"report_entity_type"> {
  return value in reportEntityLabels;
}

export function formatAdminDate(value: string | null) {
  if (!value) {
    return "Nedisponibil";
  }

  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function shortId(id: string) {
  return id.slice(0, 8);
}
