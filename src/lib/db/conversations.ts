import type { SupabaseClient } from "@supabase/supabase-js";

import { getPublicListingImageUrl } from "@/lib/db/storage";
import type { Database, Enums, Tables, TablesInsert } from "@/types/database";

export type ConversationListing = Pick<
  Tables<"listings">,
  "id" | "title" | "slug" | "price_cents" | "currency" | "city" | "status"
> & {
  imageUrl?: string;
};

export type ConversationProfile = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  city: string | null;
};

export type ConversationSummary = {
  id: string;
  status: Enums<"conversation_status">;
  role: "buyer" | "seller";
  listing: ConversationListing;
  otherParticipant: ConversationProfile;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  lastMessageSenderId: string | null;
  lastReadAt: string | null;
  unreadCount: number;
  isUnread: boolean;
  createdAt: string;
};

export type ConversationDetail = ConversationSummary & {
  buyer: ConversationProfile;
  seller: ConversationProfile;
  buyerId: string;
  sellerId: string;
};

export type ConversationListResult = {
  conversations: ConversationSummary[];
  source: "supabase" | "unavailable";
};

export type ConversationDetailResult = {
  conversation: ConversationDetail | null;
  source: "supabase" | "unavailable";
};

export async function getUserConversations(
  userId: string,
  supabase: SupabaseClient<Database> | null,
): Promise<ConversationListResult> {
  if (!supabase) {
    return { conversations: [], source: "unavailable" };
  }

  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase conversations query failed", error);
      return { conversations: [], source: "unavailable" };
    }

    return {
      conversations: await hydrateConversations(data ?? [], userId, supabase),
      source: "supabase",
    };
  } catch (error) {
    console.error("Supabase conversations query failed", error);
    return { conversations: [], source: "unavailable" };
  }
}

export async function getConversationById(
  conversationId: string,
  userId: string,
  supabase: SupabaseClient<Database> | null,
): Promise<ConversationDetailResult> {
  if (!supabase) {
    return { conversation: null, source: "unavailable" };
  }

  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .maybeSingle();

    if (error) {
      console.error("Supabase conversation detail query failed", error);
      return { conversation: null, source: "unavailable" };
    }

    if (!data) {
      return { conversation: null, source: "supabase" };
    }

    const [summary] = await hydrateConversations([data], userId, supabase);

    if (!summary) {
      return { conversation: null, source: "supabase" };
    }

    const profiles = await getProfiles(
      [data.buyer_id, data.seller_id],
      supabase,
    );

    return {
      conversation: {
        ...summary,
        buyer: profiles.get(data.buyer_id) ?? fallbackProfile(data.buyer_id),
        seller: profiles.get(data.seller_id) ?? fallbackProfile(data.seller_id),
        buyerId: data.buyer_id,
        sellerId: data.seller_id,
      },
      source: "supabase",
    };
  } catch (error) {
    console.error("Supabase conversation detail query failed", error);
    return { conversation: null, source: "unavailable" };
  }
}

export async function getOrCreateConversationForListing(
  {
    listingId,
  }: {
    listingId: string;
  },
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { conversationId: null, error: "SUPABASE_NOT_CONFIGURED" };
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { conversationId: null, error: "NOT_AUTHENTICATED" };
    }

    const { data: existing, error: existingError } = await supabase
      .from("conversations")
      .select("id")
      .eq("listing_id", listingId)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .maybeSingle();

    if (existingError) {
      console.error("Supabase existing conversation lookup failed", existingError);
      return { conversationId: null, error: "CONVERSATION_UNAVAILABLE" };
    }

    if (existing) {
      return { conversationId: existing.id, error: null };
    }

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, user_id, status")
      .eq("id", listingId)
      .maybeSingle();

    if (listingError) {
      console.error("Supabase conversation listing lookup failed", listingError);
      return { conversationId: null, error: "LISTING_UNAVAILABLE" };
    }

    if (!listing) {
      return { conversationId: null, error: "LISTING_NOT_FOUND" };
    }

    if (listing.user_id === user.id) {
      return { conversationId: null, error: "OWNER_CANNOT_START" };
    }

    if (listing.status !== "active") {
      return { conversationId: null, error: "LISTING_INACTIVE" };
    }

    const insert: TablesInsert<"conversations"> = {
      listing_id: listing.id,
      buyer_id: user.id,
      seller_id: listing.user_id,
      buyer_last_read_at: new Date().toISOString(),
    };

    const { data: conversation, error: insertError } = await supabase
      .from("conversations")
      .insert(insert)
      .select("id")
      .single();

    if (insertError || !conversation) {
      console.error("Supabase conversation insert failed", insertError);
      return { conversationId: null, error: "CREATE_CONVERSATION_FAILED" };
    }

    return { conversationId: conversation.id, error: null };
  } catch (error) {
    console.error("Supabase conversation create failed", error);
    return { conversationId: null, error: "CREATE_CONVERSATION_FAILED" };
  }
}

export async function markConversationAsRead(
  conversationId: string,
  userId: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" };
  }

  const { data: conversation, error: lookupError } = await supabase
    .from("conversations")
    .select("buyer_id, seller_id")
    .eq("id", conversationId)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .maybeSingle();

  if (lookupError || !conversation) {
    return { error: "CONVERSATION_NOT_FOUND" };
  }

  const now = new Date().toISOString();
  const update =
    conversation.buyer_id === userId
      ? { buyer_last_read_at: now }
      : { seller_last_read_at: now };

  const { error } = await supabase
    .from("conversations")
    .update(update)
    .eq("id", conversationId);

  return { error: error ? "MARK_READ_FAILED" : null };
}

export async function archiveConversation(
  conversationId: string,
  userId: string,
  supabase: SupabaseClient<Database> | null,
) {
  return updateConversationStatus(
    conversationId,
    userId,
    "archived",
    supabase,
  );
}

export async function blockConversation(
  conversationId: string,
  userId: string,
  supabase: SupabaseClient<Database> | null,
) {
  return updateConversationStatus(conversationId, userId, "blocked", supabase);
}

async function updateConversationStatus(
  conversationId: string,
  userId: string,
  status: Enums<"conversation_status">,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" };
  }

  const { error } = await supabase
    .from("conversations")
    .update({ status })
    .eq("id", conversationId)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

  return { error: error ? "UPDATE_CONVERSATION_FAILED" : null };
}

async function hydrateConversations(
  rows: Tables<"conversations">[],
  userId: string,
  supabase: SupabaseClient<Database>,
): Promise<ConversationSummary[]> {
  if (rows.length === 0) {
    return [];
  }

  const listingIds = Array.from(new Set(rows.map((row) => row.listing_id)));
  const participantIds = Array.from(
    new Set(rows.flatMap((row) => [row.buyer_id, row.seller_id])),
  );

  const [listings, images, profiles, unreadCounts] = await Promise.all([
    getListings(listingIds, supabase),
    getListingImages(listingIds, supabase),
    getProfiles(participantIds, supabase),
    getUnreadCounts(rows, userId, supabase),
  ]);

  return rows.map((row) => {
    const role = row.buyer_id === userId ? "buyer" : "seller";
    const otherId = role === "buyer" ? row.seller_id : row.buyer_id;
    const lastReadAt =
      role === "buyer" ? row.buyer_last_read_at : row.seller_last_read_at;
    const unreadCount = unreadCounts.get(row.id) ?? 0;
    const listing = listings.get(row.listing_id) ?? fallbackListing(row.listing_id);
    const firstImage = images.get(row.listing_id);

    return {
      id: row.id,
      status: row.status,
      role,
      listing: {
        ...listing,
        imageUrl: firstImage,
      },
      otherParticipant: profiles.get(otherId) ?? fallbackProfile(otherId),
      lastMessageAt: row.last_message_at,
      lastMessagePreview: row.last_message_preview,
      lastMessageSenderId: row.last_message_sender_id,
      lastReadAt,
      unreadCount,
      isUnread: unreadCount > 0,
      createdAt: row.created_at,
    };
  });
}

async function getListings(
  listingIds: string[],
  supabase: SupabaseClient<Database>,
) {
  const listingMap = new Map<string, ConversationListing>();

  if (listingIds.length === 0) {
    return listingMap;
  }

  const { data, error } = await supabase
    .from("listings")
    .select("id, title, slug, price_cents, currency, city, status")
    .in("id", listingIds);

  if (error) {
    console.error("Supabase conversation listings query failed", error);
    return listingMap;
  }

  for (const listing of data ?? []) {
    listingMap.set(listing.id, listing);
  }

  return listingMap;
}

async function getListingImages(
  listingIds: string[],
  supabase: SupabaseClient<Database>,
) {
  const imageMap = new Map<string, string>();

  if (listingIds.length === 0) {
    return imageMap;
  }

  const { data, error } = await supabase
    .from("listing_images")
    .select("listing_id, storage_path, sort_order")
    .in("listing_id", listingIds)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Supabase conversation image query failed", error);
    return imageMap;
  }

  for (const image of data ?? []) {
    if (!imageMap.has(image.listing_id)) {
      imageMap.set(
        image.listing_id,
        getPublicListingImageUrl(supabase, image.storage_path),
      );
    }
  }

  return imageMap;
}

async function getProfiles(
  userIds: string[],
  supabase: SupabaseClient<Database>,
) {
  const profileMap = new Map<string, ConversationProfile>();

  if (userIds.length === 0) {
    return profileMap;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, city")
    .in("id", userIds);

  if (error) {
    console.error("Supabase conversation profiles query failed", error);
    return profileMap;
  }

  for (const profile of data ?? []) {
    profileMap.set(profile.id, {
      id: profile.id,
      displayName: profile.display_name || "Utilizator TROKO",
      avatarUrl: profile.avatar_url,
      city: profile.city,
    });
  }

  return profileMap;
}

async function getUnreadCounts(
  rows: Tables<"conversations">[],
  userId: string,
  supabase: SupabaseClient<Database>,
) {
  const counts = new Map<string, number>();
  const unreadCandidates = rows.filter((row) => {
    const role = row.buyer_id === userId ? "buyer" : "seller";
    const lastReadAt =
      role === "buyer" ? row.buyer_last_read_at : row.seller_last_read_at;

    if (!row.last_message_at || row.last_message_sender_id === userId) {
      return false;
    }

    return !lastReadAt || new Date(row.last_message_at) > new Date(lastReadAt);
  });

  if (unreadCandidates.length === 0) {
    return counts;
  }

  const conversationIds = unreadCandidates.map((row) => row.id);
  const readMap = new Map(
    unreadCandidates.map((row) => [
      row.id,
      row.buyer_id === userId ? row.buyer_last_read_at : row.seller_last_read_at,
    ]),
  );

  const { data, error } = await supabase
    .from("messages")
    .select("conversation_id, sender_id, created_at")
    .in("conversation_id", conversationIds)
    .neq("sender_id", userId);

  if (error) {
    console.error("Supabase unread messages query failed", error);
    return counts;
  }

  for (const message of data ?? []) {
    const readAt = readMap.get(message.conversation_id);

    if (!readAt || new Date(message.created_at) > new Date(readAt)) {
      counts.set(
        message.conversation_id,
        (counts.get(message.conversation_id) ?? 0) + 1,
      );
    }
  }

  return counts;
}

function fallbackListing(listingId: string): ConversationListing {
  return {
    id: listingId,
    title: "Anunț indisponibil",
    slug: "anunt-indisponibil",
    price_cents: null,
    currency: "RON",
    city: "România",
    status: "archived",
  };
}

function fallbackProfile(userId: string): ConversationProfile {
  return {
    id: userId,
    displayName: "Utilizator TROKO",
    avatarUrl: null,
    city: null,
  };
}
