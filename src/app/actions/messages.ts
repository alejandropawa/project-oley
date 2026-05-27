"use server";

import { revalidatePath } from "next/cache";

import { getConversationById } from "@/lib/db/conversations";
import { sendMessage } from "@/lib/db/messages";
import { notifyUser } from "@/lib/db/notifications";
import { safeNotificationPreview } from "@/lib/notifications/format";
import { createClient } from "@/lib/supabase/server";

export type MessageActionResult = {
  success: boolean;
  error?: string;
};

export async function sendMessageAction({
  conversationId,
  body,
}: {
  conversationId: string;
  body: string;
}): Promise<MessageActionResult> {
  const supabase = await createClient();
  const result = await sendMessage({ conversationId, body }, supabase);

  if (result.error) {
    return {
      success: false,
      error: getMessageError(result.error),
    };
  }

  if (result.message) {
    const conversation = await getConversationById(
      conversationId,
      result.message.sender_id,
      supabase,
    );
    const detail = conversation.conversation;
    const recipientId =
      detail?.buyerId === result.message.sender_id
        ? detail.sellerId
        : detail?.buyerId;

    if (recipientId && detail) {
      await notifyUser(
        {
          userId: recipientId,
          type: "message_received",
          title: "Ai primit un mesaj nou",
          body: `${detail.listing.title}: ${safeNotificationPreview(result.message.body, 120)}`,
          actionUrl: `/mesaje/${conversationId}`,
          data: {
            conversation_id: conversationId,
            listing_id: detail.listing.id,
            message_id: result.message.id,
          },
          emailData: {
            listingTitle: detail.listing.title,
            messagePreview: safeNotificationPreview(result.message.body, 160),
          },
        },
        supabase,
      );
    }
  }

  revalidatePath("/mesaje");
  revalidatePath(`/mesaje/${conversationId}`);
  revalidatePath("/notificari");

  return { success: true };
}

function getMessageError(error: string) {
  if (error === "EMPTY_MESSAGE") {
    return "Scrie un mesaj înainte de trimitere.";
  }

  if (error === "MESSAGE_TOO_LONG") {
    return "Mesajul poate avea maximum 2000 de caractere.";
  }

  if (error === "NOT_AUTHENTICATED") {
    return "Intră în cont pentru a trimite mesaje.";
  }

  if (error === "CONVERSATION_NOT_ACTIVE") {
    return "Conversația nu mai este activă.";
  }

  if (error === "SUPABASE_NOT_CONFIGURED") {
    return "Mesageria va fi disponibilă după configurarea Supabase.";
  }

  return "Nu am putut trimite mesajul. Încearcă din nou.";
}
