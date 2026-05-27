import type { SupabaseClient } from "@supabase/supabase-js";

import { shouldSendInAppNotification } from "@/lib/db/notification-preferences";
import { sendNotificationEmail } from "@/lib/email/send";
import type { NotificationTemplateData } from "@/lib/email/templates";
import {
  isSafeInternalPath,
  safeNotificationPreview,
} from "@/lib/notifications/format";
import type {
  Database,
  Enums,
  Json,
  Tables,
  TablesInsert,
} from "@/types/database";

export type NotifyUserInput = {
  userId: string;
  type: Enums<"notification_type">;
  title: string;
  body: string;
  actionUrl?: string | null;
  data?: Json;
  emailData?: NotificationTemplateData;
};

export type NotificationListOptions = {
  limit?: number;
  unreadOnly?: boolean;
};

export async function getCurrentUserNotifications(
  options: NotificationListOptions,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return {
      notifications: [],
      source: "unavailable" as const,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { notifications: [], source: "supabase" as const };
  }

  try {
    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(options.limit ?? 40);

    if (options.unreadOnly) {
      query = query.is("read_at", null);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase notifications query failed", error);
      return { notifications: [], source: "unavailable" as const };
    }

    return {
      notifications: data ?? [],
      source: "supabase" as const,
    };
  } catch (error) {
    console.error("Supabase notifications query failed", error);
    return { notifications: [], source: "unavailable" as const };
  }
}

export async function getUnreadNotificationCount(
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { count: 0, source: "unavailable" as const };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { count: 0, source: "supabase" as const };
  }

  try {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null);

    if (error) {
      console.error("Supabase unread notification count failed", error);
      return { count: 0, source: "unavailable" as const };
    }

    return { count: count ?? 0, source: "supabase" as const };
  } catch (error) {
    console.error("Supabase unread notification count failed", error);
    return { count: 0, source: "unavailable" as const };
  }
}

export async function createNotification(
  input: NotifyUserInput,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { notification: null, error: "SUPABASE_NOT_CONFIGURED" as const };
  }

  if (!isSafeInternalPath(input.actionUrl)) {
    return { notification: null, error: "INVALID_ACTION_URL" as const };
  }

  const enabled = await shouldSendInAppNotification(
    input.userId,
    input.type,
    supabase,
  );

  if (!enabled) {
    return { notification: null, error: null };
  }

  const insert: TablesInsert<"notifications"> = {
    user_id: input.userId,
    type: input.type,
    title: safeNotificationPreview(input.title, 160),
    body: safeNotificationPreview(input.body, 1000),
    action_url: input.actionUrl ?? null,
    data: input.data ?? {},
  };

  const { data, error } = await supabase
    .from("notifications")
    .insert(insert)
    .select("*")
    .single();

  if (error || !data) {
    console.error("Supabase notification insert failed", error);
    return { notification: null, error: "CREATE_NOTIFICATION_FAILED" as const };
  }

  return { notification: data, error: null };
}

export async function createNotifications(
  inputs: NotifyUserInput[],
  supabase: SupabaseClient<Database> | null,
) {
  const results = [];

  for (const input of inputs) {
    results.push(await createNotification(input, supabase));
  }

  return results;
}

export async function notifyUser(
  input: NotifyUserInput,
  supabase: SupabaseClient<Database> | null,
) {
  try {
    const result = await createNotification(input, supabase);

    await sendNotificationEmail(
      {
        userId: input.userId,
        notificationId: result.notification?.id ?? null,
        type: input.type,
        templateData: {
          title: input.title,
          body: input.body,
          actionUrl: input.actionUrl,
          ...input.emailData,
        },
      },
      supabase,
    );

    return result;
  } catch (error) {
    console.error("TROKO notifyUser failed", error);
    return { notification: null, error: "NOTIFY_FAILED" as const };
  }
}

export async function markNotificationAsRead(
  notificationId: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" as const };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "NOT_AUTHENTICATED" as const };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  return { error: error ? ("MARK_READ_FAILED" as const) : null };
}

export async function markAllNotificationsAsRead(
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" as const };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "NOT_AUTHENTICATED" as const };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  return { error: error ? ("MARK_ALL_READ_FAILED" as const) : null };
}

export async function deleteNotification(
  notificationId: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" as const };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "NOT_AUTHENTICATED" as const };
  }

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", user.id);

  return { error: error ? ("DELETE_NOTIFICATION_FAILED" as const) : null };
}

export async function notifySavedSearchMatchesForListing(
  listingId: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { notified: 0, source: "unavailable" as const };
  }

  // A full cross-user saved-search matcher needs a server-only privileged
  // execution context. The public app keeps this helper as the future hook.
  console.info(
    `Saved-search notification matching queued for future worker: ${listingId}`,
  );

  return { notified: 0, source: "supabase" as const };
}

export async function createSystemAnnouncementNotifications(
  inputs: Array<{
    userId: string;
    title: string;
    body: string;
    actionUrl?: string | null;
  }>,
  supabase: SupabaseClient<Database> | null,
) {
  return createNotifications(
    inputs.map((input) => ({
      userId: input.userId,
      type: "system_announcement",
      title: input.title,
      body: input.body,
      actionUrl: input.actionUrl ?? "/notificari",
    })),
    supabase,
  );
}

export function isUnread(notification: Tables<"notifications">) {
  return notification.read_at === null;
}
