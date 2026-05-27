"use server";

import { revalidatePath } from "next/cache";

import {
  archiveConversation,
  getOrCreateConversationForListing,
  markConversationAsRead,
} from "@/lib/db/conversations";
import { createClient } from "@/lib/supabase/server";

export type ConversationActionResult = {
  success: boolean;
  error?: string;
  redirectUrl?: string;
};

export async function startConversationAction({
  listingId,
}: {
  listingId: string;
}): Promise<ConversationActionResult> {
  const supabase = await createClient();
  const result = await getOrCreateConversationForListing({ listingId }, supabase);

  if (result.conversationId) {
    revalidatePath("/mesaje");
    return {
      success: true,
      redirectUrl: `/mesaje/${result.conversationId}`,
    };
  }

  return {
    success: false,
    error: getConversationErrorMessage(result.error),
  };
}

export async function markConversationAsReadAction({
  conversationId,
}: {
  conversationId: string;
}): Promise<ConversationActionResult> {
  const supabase = await createClient();

  if (!supabase) {
    return {
      success: false,
      error: "Mesageria va fi disponibilă după configurarea Supabase.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Intră în cont pentru a continua." };
  }

  const result = await markConversationAsRead(conversationId, user.id, supabase);

  if (result.error) {
    return {
      success: false,
      error: "Nu am putut marca această conversație ca citită.",
    };
  }

  revalidatePath("/mesaje");
  revalidatePath(`/mesaje/${conversationId}`);
  return { success: true };
}

export async function archiveConversationAction({
  conversationId,
}: {
  conversationId: string;
}): Promise<ConversationActionResult> {
  const supabase = await createClient();

  if (!supabase) {
    return {
      success: false,
      error: "Mesageria va fi disponibilă după configurarea Supabase.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Intră în cont pentru a continua." };
  }

  const result = await archiveConversation(conversationId, user.id, supabase);

  if (result.error) {
    return {
      success: false,
      error: "Nu am putut arhiva conversația.",
    };
  }

  revalidatePath("/mesaje");
  revalidatePath(`/mesaje/${conversationId}`);
  return { success: true };
}

function getConversationErrorMessage(error: string | null) {
  if (error === "NOT_AUTHENTICATED") {
    return "Intră în cont pentru a trimite mesaj vânzătorului.";
  }

  if (error === "OWNER_CANNOT_START") {
    return "Acesta este anunțul tău.";
  }

  if (error === "LISTING_INACTIVE") {
    return "Anunțul nu mai este activ.";
  }

  if (error === "SUPABASE_NOT_CONFIGURED") {
    return "Mesageria va fi disponibilă după configurarea Supabase.";
  }

  return "Nu am putut porni conversația. Încearcă din nou.";
}
