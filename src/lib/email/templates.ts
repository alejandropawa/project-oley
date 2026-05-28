import { absoluteUrl } from "@/lib/seo/site";
import type { Enums } from "@/types/database";

export type NotificationTemplateData = {
  title?: string;
  body?: string;
  listingTitle?: string;
  messagePreview?: string;
  packageName?: string;
  endsAt?: string;
  adminNote?: string | null;
  statusLabel?: string;
  searchName?: string;
  actionUrl?: string | null;
};

export type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

export function getNotificationEmailTemplate(
  type: Enums<"notification_type">,
  data: NotificationTemplateData,
): EmailTemplate {
  const actionLabel = getActionLabel(type);
  const actionUrl = absoluteUrl(data.actionUrl ?? "/notificari");
  const subject = getSubject(type, data);
  const intro = getIntro(type, data);
  const detail = getDetail(type, data);

  return {
    subject,
    html: wrapEmailHtml({
      subject,
      intro,
      detail,
      actionLabel,
      actionUrl,
    }),
    text: [
      subject,
      "",
      intro,
      detail ? `\n${detail}` : "",
      "",
      `${actionLabel}: ${actionUrl}`,
      "",
      "Primești acest email deoarece ai un cont TROKO.",
      `Îți poți modifica preferințele din contul tău: ${absoluteUrl("/cont/notificari")}`,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

function getSubject(
  type: Enums<"notification_type">,
  data: NotificationTemplateData,
) {
  if (type === "message_received") {
    return "Ai primit un mesaj nou pe TROKO";
  }

  if (type === "listing_favorited") {
    return "Anunțul tău a fost salvat la favorite";
  }

  if (type === "promotion_order_approved") {
    return "Promovarea anunțului tău a fost aprobată";
  }

  if (type === "promotion_order_rejected") {
    return "Solicitarea de promovare a fost respinsă";
  }

  if (type === "report_status_changed") {
    return "Raportarea ta a fost actualizată";
  }

  if (type === "saved_search_match") {
    return "Am găsit anunțuri noi pentru căutarea ta";
  }

  if (type === "system_announcement") {
    return data.title ?? "Anunț TROKO";
  }

  return data.title ?? "Noutate TROKO";
}

function getIntro(
  type: Enums<"notification_type">,
  data: NotificationTemplateData,
) {
  if (type === "message_received") {
    return `Ai primit un mesaj nou despre ${data.listingTitle ?? "un anunț TROKO"}.`;
  }

  if (type === "listing_favorited") {
    return `Anunțul ${data.listingTitle ?? "tău"} a fost salvat la favorite.`;
  }

  if (type === "promotion_order_approved") {
    return `Promovarea pentru ${data.listingTitle ?? "anunțul tău"} a fost aprobată.`;
  }

  if (type === "promotion_order_rejected") {
    return `Solicitarea de promovare pentru ${data.listingTitle ?? "anunțul tău"} a fost respinsă.`;
  }

  if (type === "report_status_changed") {
    return `Statusul raportării tale este acum: ${data.statusLabel ?? "actualizat"}.`;
  }

  if (type === "saved_search_match") {
    return `Am găsit anunțuri noi pentru căutarea ${data.searchName ?? "salvată"}.`;
  }

  return data.body ?? "Ai o notificare nouă pe TROKO.";
}

function getDetail(
  type: Enums<"notification_type">,
  data: NotificationTemplateData,
) {
  if (type === "message_received" && data.messagePreview) {
    return `Previzualizare mesaj: ${data.messagePreview}`;
  }

  if (type === "promotion_order_approved") {
    return [
      data.packageName ? `Pachet: ${data.packageName}` : "",
      data.endsAt ? `Activă până la: ${data.endsAt}` : "",
    ]
      .filter(Boolean)
      .join(" · ");
  }

  if (type === "promotion_order_rejected" && data.adminNote) {
    return `Notă TROKO: ${data.adminNote}`;
  }

  return data.body ?? "";
}

function getActionLabel(type: Enums<"notification_type">) {
  if (type === "message_received") {
    return "Vezi conversația";
  }

  if (type === "listing_favorited") {
    return "Vezi anunțul";
  }

  if (
    type === "promotion_order_approved" ||
    type === "promotion_order_rejected" ||
    type === "promotion_order_created" ||
    type === "promotion_expiring"
  ) {
    return "Vezi promovările mele";
  }

  if (type === "saved_search_match") {
    return "Vezi anunțurile";
  }

  return "Vezi notificarea";
}

function wrapEmailHtml({
  subject,
  intro,
  detail,
  actionLabel,
  actionUrl,
}: {
  subject: string;
  intro: string;
  detail: string;
  actionLabel: string;
  actionUrl: string;
}) {
  return `<!doctype html>
<html lang="ro">
  <body style="margin:0;background:#F7FBF8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#123F37;">
    <div style="max-width:620px;margin:0 auto;padding:32px 20px;">
      <div style="font-weight:900;letter-spacing:0.12em;color:#005F3F;margin-bottom:20px;">TROKO</div>
      <div style="background:#FFFEFC;border:1px solid #D9DFDA;border-radius:24px;padding:28px;">
        <h1 style="font-size:24px;line-height:1.25;margin:0 0 12px;font-weight:900;">${escapeHtml(subject)}</h1>
        <p style="font-size:16px;line-height:1.7;margin:0;color:#52645F;">${escapeHtml(intro)}</p>
        ${
          detail
            ? `<p style="font-size:14px;line-height:1.7;margin:16px 0 0;color:#52645F;">${escapeHtml(detail)}</p>`
            : ""
        }
        <a href="${actionUrl}" style="display:inline-block;margin-top:24px;background:#005F3F;color:#FFFFFF;text-decoration:none;font-weight:800;border-radius:999px;padding:12px 18px;">${escapeHtml(actionLabel)}</a>
      </div>
      <p style="font-size:12px;line-height:1.7;color:#52645F;margin:20px 0 0;">
        Primești acest email deoarece ai un cont TROKO. Îți poți modifica preferințele din
        <a href="${absoluteUrl("/cont/notificari")}" style="color:#005F3F;">contul tău</a>.
      </p>
    </div>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
