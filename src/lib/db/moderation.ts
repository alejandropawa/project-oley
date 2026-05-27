import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Enums, Json, TablesInsert } from "@/types/database";

export async function addModerationEvent(
  input: {
    reportId?: string | null;
    adminId: string;
    action: Enums<"moderation_action_type">;
    note?: string;
    metadata?: Json;
  },
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" };
  }

  const insert: TablesInsert<"moderation_events"> = {
    report_id: input.reportId ?? null,
    admin_id: input.adminId,
    action: input.action,
    note: input.note?.trim() || null,
    metadata: input.metadata ?? {},
  };

  const { error } = await supabase.from("moderation_events").insert(insert);

  return { error: error ? "CREATE_MODERATION_EVENT_FAILED" : null };
}

export async function getModerationEventsForReport(
  reportId: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { events: [], source: "unavailable" as const };
  }

  const { data, error } = await supabase
    .from("moderation_events")
    .select("*")
    .eq("report_id", reportId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Supabase moderation events failed", error);
    return { events: [], source: "unavailable" as const };
  }

  return { events: data ?? [], source: "supabase" as const };
}

export async function archiveListingForModeration(
  listingId: string,
  adminId: string,
  reportId: string | null,
  supabase: SupabaseClient<Database> | null,
) {
  return updateListingStatusForModeration(
    listingId,
    "archived",
    "listing_archived",
    adminId,
    reportId,
    supabase,
  );
}

export async function reactivateListingForModeration(
  listingId: string,
  adminId: string,
  reportId: string | null,
  supabase: SupabaseClient<Database> | null,
) {
  return updateListingStatusForModeration(
    listingId,
    "active",
    "listing_reactivated",
    adminId,
    reportId,
    supabase,
  );
}

export async function expireListingForModeration(
  listingId: string,
  adminId: string,
  reportId: string | null,
  supabase: SupabaseClient<Database> | null,
) {
  return updateListingStatusForModeration(
    listingId,
    "expired",
    "listing_expired",
    adminId,
    reportId,
    supabase,
  );
}

async function updateListingStatusForModeration(
  listingId: string,
  status: Enums<"listing_status">,
  action: Enums<"moderation_action_type">,
  adminId: string,
  reportId: string | null,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" };
  }

  const { error } = await supabase
    .from("listings")
    .update({ status })
    .eq("id", listingId);

  if (error) {
    console.error("Supabase listing moderation failed", error);
    return { error: "UPDATE_LISTING_FAILED" };
  }

  await addModerationEvent(
    {
      reportId,
      adminId,
      action,
      metadata: { listing_id: listingId, status },
    },
    supabase,
  );

  return { error: null };
}
