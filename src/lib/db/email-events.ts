import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  Database,
  Enums,
  TablesInsert,
  TablesUpdate,
} from "@/types/database";

export async function createEmailEvent(
  input: TablesInsert<"email_events">,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { eventId: null, error: "SUPABASE_NOT_CONFIGURED" as const };
  }

  try {
    const { data, error } = await supabase
      .from("email_events")
      .insert(input)
      .select("id")
      .single();

    if (error || !data) {
      console.error("Supabase email event insert failed", error);
      return { eventId: null, error: "CREATE_EMAIL_EVENT_FAILED" as const };
    }

    return { eventId: data.id, error: null };
  } catch (error) {
    console.error("Supabase email event insert failed", error);
    return { eventId: null, error: "CREATE_EMAIL_EVENT_FAILED" as const };
  }
}

export async function updateEmailEvent(
  eventId: string | null,
  input: TablesUpdate<"email_events">,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase || !eventId) {
    return { error: null };
  }

  const { error } = await supabase
    .from("email_events")
    .update(input)
    .eq("id", eventId);

  if (error) {
    console.error("Supabase email event update failed", error);
    return { error: "UPDATE_EMAIL_EVENT_FAILED" as const };
  }

  return { error: null };
}

export async function logEmailEvent(
  input: {
    userId?: string | null;
    notificationId?: string | null;
    type: Enums<"notification_type">;
    toEmail?: string | null;
    subject: string;
    status: Enums<"email_delivery_status">;
    providerMessageId?: string | null;
    errorMessage?: string | null;
  },
  supabase: SupabaseClient<Database> | null,
) {
  return createEmailEvent(
    {
      user_id: input.userId ?? null,
      notification_id: input.notificationId ?? null,
      type: input.type,
      to_email: input.toEmail ?? null,
      subject: input.subject,
      status: input.status,
      provider_message_id: input.providerMessageId ?? null,
      error_message: input.errorMessage ?? null,
      sent_at: input.status === "sent" ? new Date().toISOString() : null,
    },
    supabase,
  );
}
