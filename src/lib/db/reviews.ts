import type { SupabaseClient } from "@supabase/supabase-js";

import { notifyUser } from "@/lib/db/notifications";
import { validateReviewInput } from "@/lib/reviews/validation";
import type { Database, Enums, Tables, TablesInsert } from "@/types/database";

export type PublicReview = Tables<"user_reviews"> & {
  reviewerName: string;
};

export async function getReviewsForUser(
  userId: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { reviews: [], source: "unavailable" as const };
  }

  try {
    const { data, error } = await supabase
      .from("user_reviews")
      .select("*")
      .eq("reviewed_user_id", userId)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Supabase reviews query failed", error);
      return { reviews: [], source: "unavailable" as const };
    }

    const reviewerIds = Array.from(new Set((data ?? []).map((row) => row.reviewer_id)));
    const names = await getProfileNames(reviewerIds, supabase);

    return {
      reviews: (data ?? []).map((review) => ({
        ...review,
        reviewerName: names.get(review.reviewer_id) ?? "Utilizator TROKO",
      })),
      source: "supabase" as const,
    };
  } catch (error) {
    console.error("Supabase reviews query failed", error);
    return { reviews: [], source: "unavailable" as const };
  }
}

export async function getCurrentUserReviewOverview(
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return {
      received: [],
      written: [],
      source: "unavailable" as const,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { received: [], written: [], source: "supabase" as const };
  }

  try {
    const [{ data: received, error: receivedError }, { data: written, error: writtenError }] =
      await Promise.all([
        supabase
          .from("user_reviews")
          .select("*")
          .eq("reviewed_user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("user_reviews")
          .select("*")
          .eq("reviewer_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

    if (receivedError || writtenError) {
      console.error("Supabase review overview failed", receivedError ?? writtenError);
      return { received: [], written: [], source: "unavailable" as const };
    }

    return {
      received: received ?? [],
      written: written ?? [],
      source: "supabase" as const,
    };
  } catch (error) {
    console.error("Supabase review overview failed", error);
    return { received: [], written: [], source: "unavailable" as const };
  }
}

export async function createReview(
  input: {
    reviewedUserId: string;
    rating: number;
    comment?: string | null;
    listingId?: string | null;
    conversationId?: string | null;
    context?: Enums<"review_context">;
  },
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { review: null, error: "SUPABASE_NOT_CONFIGURED" as const };
  }

  const validation = validateReviewInput(input);

  if (!validation.success) {
    return { review: null, error: validation.error };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { review: null, error: "NOT_AUTHENTICATED" as const };
  }

  if (user.id === input.reviewedUserId) {
    return { review: null, error: "SELF_REVIEW" as const };
  }

  if (input.conversationId) {
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id, buyer_id, seller_id, listing_id")
      .eq("id", input.conversationId)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .maybeSingle();

    if (
      conversationError ||
      !conversation ||
      ![conversation.buyer_id, conversation.seller_id].includes(input.reviewedUserId)
    ) {
      return { review: null, error: "INVALID_REVIEW_CONTEXT" as const };
    }
  } else {
    return { review: null, error: "INVALID_REVIEW_CONTEXT" as const };
  }

  const insert: TablesInsert<"user_reviews"> = {
    reviewer_id: user.id,
    reviewed_user_id: input.reviewedUserId,
    listing_id: input.listingId ?? null,
    conversation_id: input.conversationId ?? null,
    rating: validation.data.rating,
    comment: validation.data.comment || null,
    context: input.context ?? "listing_conversation",
    status: "published",
  };

  const { data, error } = await supabase
    .from("user_reviews")
    .insert(insert)
    .select("*")
    .single();

  if (error || !data) {
    console.error("Supabase review insert failed", error);
    return { review: null, error: "CREATE_REVIEW_FAILED" as const };
  }

  await notifyUser(
    {
      userId: input.reviewedUserId,
      type: "review_received",
      title: "Ai primit un review nou",
      body: `Ai primit un review de ${validation.data.rating}/5 pe TROKO.`,
      actionUrl: "/cont/review-uri",
    },
    supabase,
  );

  return { review: data, error: null };
}

export async function updateOwnReview(
  id: string,
  input: { rating: number; comment?: string | null },
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" as const };
  }

  const validation = validateReviewInput(input);

  if (!validation.success) {
    return { error: validation.error };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "NOT_AUTHENTICATED" as const };
  }

  const { error } = await supabase
    .from("user_reviews")
    .update({
      rating: validation.data.rating,
      comment: validation.data.comment || null,
    })
    .eq("id", id)
    .eq("reviewer_id", user.id);

  return { error: error ? ("UPDATE_REVIEW_FAILED" as const) : null };
}

export async function getReviewsForAdmin(
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { reviews: [], source: "unavailable" as const };
  }

  try {
    const { data, error } = await supabase
      .from("user_reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(80);

    if (error) {
      console.error("Supabase admin reviews failed", error);
      return { reviews: [], source: "unavailable" as const };
    }

    return { reviews: data ?? [], source: "supabase" as const };
  } catch (error) {
    console.error("Supabase admin reviews failed", error);
    return { reviews: [], source: "unavailable" as const };
  }
}

export async function updateReviewStatusForAdmin(
  id: string,
  status: Enums<"review_status">,
  adminNote: string | null,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" as const };
  }

  const { error } = await supabase
    .from("user_reviews")
    .update({ status, admin_note: adminNote })
    .eq("id", id);

  return { error: error ? ("UPDATE_REVIEW_FAILED" as const) : null };
}

async function getProfileNames(
  userIds: string[],
  supabase: SupabaseClient<Database>,
) {
  const names = new Map<string, string>();

  if (userIds.length === 0) {
    return names;
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", userIds);

  for (const profile of data ?? []) {
    names.set(profile.id, profile.display_name ?? "Utilizator TROKO");
  }

  return names;
}

