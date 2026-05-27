import type { SupabaseClient } from "@supabase/supabase-js";

import { getUserConversations } from "@/lib/db/conversations";
import type { Database } from "@/types/database";

export async function getInboxSummary(
  userId: string,
  supabase: SupabaseClient<Database> | null,
) {
  return getUserConversations(userId, supabase);
}

export async function getUnreadConversationCount(
  userId: string,
  supabase: SupabaseClient<Database> | null,
) {
  const result = await getUserConversations(userId, supabase);

  if (result.source === "unavailable") {
    return { count: 0, source: "unavailable" as const };
  }

  return {
    count: result.conversations.filter((conversation) => conversation.isUnread)
      .length,
    source: "supabase" as const,
  };
}
