import type { SupabaseClient } from "@supabase/supabase-js";

import { logEmailEvent } from "@/lib/db/email-events";
import { shouldSendEmailNotification } from "@/lib/db/notification-preferences";
import {
  getEmailFrom,
  isEmailConfigured,
  sendProviderEmail,
} from "@/lib/email/provider";
import {
  getNotificationEmailTemplate,
  type NotificationTemplateData,
} from "@/lib/email/templates";
import type { Database, Enums } from "@/types/database";

export { isEmailConfigured };

export async function sendEmail(
  {
    to,
    subject,
    html,
    text,
    userId,
    notificationId,
    type,
  }: {
    to: string | null;
    subject: string;
    html: string;
    text: string;
    userId?: string | null;
    notificationId?: string | null;
    type: Enums<"notification_type">;
  },
  supabase: SupabaseClient<Database> | null,
) {
  if (!to) {
    await logEmailEvent(
      {
        userId,
        notificationId,
        type,
        toEmail: null,
        subject,
        status: "skipped",
        errorMessage: "Recipient email unavailable",
      },
      supabase,
    );

    return { status: "skipped" as const };
  }

  const providerResult = await sendProviderEmail({
    to,
    from: getEmailFrom(),
    subject,
    html,
    text,
  });

  await logEmailEvent(
    {
      userId,
      notificationId,
      type,
      toEmail: to,
      subject,
      status: providerResult.status,
      providerMessageId:
        providerResult.status === "sent" ? providerResult.providerMessageId : null,
      errorMessage:
        providerResult.status === "failed"
          ? providerResult.error
          : providerResult.status === "skipped"
            ? providerResult.reason
            : null,
    },
    supabase,
  );

  return providerResult;
}

export async function sendNotificationEmail(
  {
    userId,
    notificationId,
    type,
    templateData,
  }: {
    userId: string;
    notificationId?: string | null;
    type: Enums<"notification_type">;
    templateData: NotificationTemplateData;
  },
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { status: "skipped" as const };
  }

  const allowed = await shouldSendEmailNotification(userId, type, supabase);

  if (!allowed) {
    const template = getNotificationEmailTemplate(type, templateData);

    await logEmailEvent(
      {
        userId,
        notificationId,
        type,
        subject: template.subject,
        status: "skipped",
        errorMessage: "User email preference disabled",
      },
      supabase,
    );

    return { status: "skipped" as const };
  }

  const template = getNotificationEmailTemplate(type, templateData);
  const to = await getReachableUserEmail(userId, supabase);

  return sendEmail(
    {
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      userId,
      notificationId,
      type,
    },
    supabase,
  );
}

async function getReachableUserEmail(
  userId: string,
  supabase: SupabaseClient<Database>,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id === userId && user.email) {
    return user.email;
  }

  return null;
}
