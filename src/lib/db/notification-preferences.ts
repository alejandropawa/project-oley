import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  Database,
  Enums,
  Tables,
  TablesUpdate,
} from "@/types/database";

export type NotificationPreferencesUpdate = Pick<
  TablesUpdate<"notification_preferences">,
  | "email_messages"
  | "email_listing_activity"
  | "email_saved_searches"
  | "email_promotions"
  | "email_moderation"
  | "email_system"
  | "in_app_messages"
  | "in_app_listing_activity"
  | "in_app_saved_searches"
  | "in_app_promotions"
  | "in_app_moderation"
  | "in_app_system"
>;

export function defaultNotificationPreferences(
  userId: string,
): Tables<"notification_preferences"> {
  const now = new Date().toISOString();

  return {
    user_id: userId,
    email_messages: true,
    email_listing_activity: true,
    email_saved_searches: true,
    email_promotions: true,
    email_moderation: true,
    email_system: true,
    in_app_messages: true,
    in_app_listing_activity: true,
    in_app_saved_searches: true,
    in_app_promotions: true,
    in_app_moderation: true,
    in_app_system: true,
    created_at: now,
    updated_at: now,
  };
}

export async function getCurrentUserNotificationPreferences(
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return {
      preferences: null,
      source: "unavailable" as const,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      preferences: null,
      source: "supabase" as const,
    };
  }

  try {
    const { data, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Supabase notification preferences query failed", error);
      return {
        preferences: defaultNotificationPreferences(user.id),
        source: "unavailable" as const,
      };
    }

    return {
      preferences: data ?? defaultNotificationPreferences(user.id),
      source: "supabase" as const,
    };
  } catch (error) {
    console.error("Supabase notification preferences query failed", error);
    return {
      preferences: defaultNotificationPreferences(user.id),
      source: "unavailable" as const,
    };
  }
}

export async function ensureCurrentUserNotificationPreferences(
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return {
      preferences: null,
      error: "SUPABASE_NOT_CONFIGURED" as const,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { preferences: null, error: "NOT_AUTHENTICATED" as const };
  }

  const current = await getCurrentUserNotificationPreferences(supabase);

  if (current.preferences && current.source === "supabase") {
    const { error } = await supabase
      .from("notification_preferences")
      .upsert({ user_id: user.id }, { onConflict: "user_id" });

    if (error) {
      console.error("Supabase notification preferences upsert failed", error);
    }
  }

  return {
    preferences: current.preferences ?? defaultNotificationPreferences(user.id),
    error: null,
  };
}

export async function updateCurrentUserNotificationPreferences(
  input: NotificationPreferencesUpdate,
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

  await ensureCurrentUserNotificationPreferences(supabase);

  const { error } = await supabase
    .from("notification_preferences")
    .update(input)
    .eq("user_id", user.id);

  if (error) {
    console.error("Supabase notification preferences update failed", error);
    return { error: "UPDATE_PREFERENCES_FAILED" as const };
  }

  return { error: null };
}

export async function shouldSendInAppNotification(
  userId: string,
  type: Enums<"notification_type">,
  supabase: SupabaseClient<Database> | null,
) {
  return shouldSendNotification(userId, type, "in_app", supabase);
}

export async function shouldSendEmailNotification(
  userId: string,
  type: Enums<"notification_type">,
  supabase: SupabaseClient<Database> | null,
) {
  return shouldSendNotification(userId, type, "email", supabase);
}

async function shouldSendNotification(
  userId: string,
  type: Enums<"notification_type">,
  channel: Enums<"notification_channel">,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return false;
  }

  try {
    const { data, error } = await supabase.rpc("notification_preference_enabled", {
      target_user_id: userId,
      notification_kind: type,
      channel,
    });

    if (error) {
      console.error("Supabase notification preference helper failed", error);
      return true;
    }

    return Boolean(data);
  } catch (error) {
    console.error("Supabase notification preference helper failed", error);
    return true;
  }
}
