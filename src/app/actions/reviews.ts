"use server";

import { revalidatePath } from "next/cache";

import { createReview, updateOwnReview } from "@/lib/db/reviews";
import { createClient } from "@/lib/supabase/server";

export type ReviewActionResult = {
  success: boolean;
  error?: string;
};

export async function createReviewAction(input: {
  reviewedUserId: string;
  conversationId: string;
  listingId?: string | null;
  rating: number;
  comment?: string | null;
}): Promise<ReviewActionResult> {
  const supabase = await createClient();
  const result = await createReview(
    {
      reviewedUserId: input.reviewedUserId,
      conversationId: input.conversationId,
      listingId: input.listingId ?? null,
      rating: input.rating,
      comment: input.comment,
    },
    supabase,
  );

  if (result.error) {
    return { success: false, error: getReviewError(result.error) };
  }

  revalidatePath("/cont/review-uri");
  revalidatePath("/cont/incredere");
  revalidatePath(`/mesaje/${input.conversationId}`);
  return { success: true };
}

export async function updateOwnReviewAction(input: {
  id: string;
  rating: number;
  comment?: string | null;
}): Promise<ReviewActionResult> {
  const supabase = await createClient();
  const result = await updateOwnReview(
    input.id,
    { rating: input.rating, comment: input.comment },
    supabase,
  );

  if (result.error) {
    return { success: false, error: getReviewError(result.error) };
  }

  revalidatePath("/cont/review-uri");
  return { success: true };
}

function getReviewError(error: string) {
  if (error === "NOT_AUTHENTICATED") {
    return "Intra in cont pentru a lasa un review.";
  }

  if (error === "SUPABASE_NOT_CONFIGURED") {
    return "Review-urile vor fi disponibile dupa configurarea Supabase.";
  }

  if (error === "SELF_REVIEW") {
    return "Nu poti lasa review propriului profil.";
  }

  if (error === "INVALID_REVIEW_CONTEXT") {
    return "Review-ul trebuie sa fie legat de o conversatie reala.";
  }

  if (error === "CREATE_REVIEW_FAILED") {
    return "Nu am putut salva review-ul. Este posibil sa existe deja unul pentru aceasta interactiune.";
  }

  return error || "Nu am putut salva review-ul.";
}

