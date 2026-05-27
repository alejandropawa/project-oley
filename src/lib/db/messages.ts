import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/types/database";

export type ConversationMessage = Tables<"messages"> & {
  isCurrentUser: boolean;
  safetyHints: string[];
};

export type MessagesResult = {
  messages: ConversationMessage[];
  source: "supabase" | "unavailable";
};

export async function getConversationMessages(
  conversationId: string,
  userId: string,
  supabase: SupabaseClient<Database> | null,
): Promise<MessagesResult> {
  if (!supabase) {
    return { messages: [], source: "unavailable" };
  }

  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase messages query failed", error);
      return { messages: [], source: "unavailable" };
    }

    return {
      messages: (data ?? []).map((message) => ({
        ...message,
        isCurrentUser: message.sender_id === userId,
        safetyHints: getMessageSafetyHints(message.body),
      })),
      source: "supabase",
    };
  } catch (error) {
    console.error("Supabase messages query failed", error);
    return { messages: [], source: "unavailable" };
  }
}

export async function sendMessage(
  {
    conversationId,
    body,
  }: {
    conversationId: string;
    body: string;
  },
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { message: null, error: "SUPABASE_NOT_CONFIGURED" };
  }

  const cleanBody = body.trim();

  if (!cleanBody) {
    return { message: null, error: "EMPTY_MESSAGE" };
  }

  if (cleanBody.length > 2000) {
    return { message: null, error: "MESSAGE_TOO_LONG" };
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { message: null, error: "NOT_AUTHENTICATED" };
    }

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id, buyer_id, seller_id, status")
      .eq("id", conversationId)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .maybeSingle();

    if (conversationError || !conversation) {
      return { message: null, error: "CONVERSATION_NOT_FOUND" };
    }

    if (conversation.status !== "active") {
      return { message: null, error: "CONVERSATION_NOT_ACTIVE" };
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        body: cleanBody,
      })
      .select("*")
      .single();

    if (error || !data) {
      console.error("Supabase message insert failed", error);
      return { message: null, error: "SEND_MESSAGE_FAILED" };
    }

    return { message: data, error: null };
  } catch (error) {
    console.error("Supabase message insert failed", error);
    return { message: null, error: "SEND_MESSAGE_FAILED" };
  }
}

export function getMessageSafetyHints(body: string) {
  const hints: string[] = [];
  const normalized = body.toLocaleLowerCase("ro");

  if (normalized.includes("http://") || normalized.includes("https://")) {
    hints.push("Ai grijă la linkurile externe.");
  }

  if (/(avans|cod|parolă|parola|whatsapp)/i.test(normalized)) {
    hints.push("Păstrează datele sensibile în siguranță.");
  }

  return hints;
}
