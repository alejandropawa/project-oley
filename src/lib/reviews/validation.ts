export type ReviewValidationResult =
  | { success: true; data: { rating: number; comment: string } }
  | { success: false; error: string };

export function validateReviewInput(input: {
  rating: number;
  comment?: string | null;
}): ReviewValidationResult {
  const rating = Number(input.rating);
  const comment = (input.comment ?? "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { success: false, error: "Alege un rating intre 1 si 5." };
  }

  if (comment.length > 1200) {
    return {
      success: false,
      error: "Comentariul trebuie sa aiba cel mult 1200 de caractere.",
    };
  }

  return { success: true, data: { rating, comment } };
}

