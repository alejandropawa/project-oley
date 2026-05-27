import { RatingStars } from "@/components/reviews/rating-stars";
import { reviewStatusLabels } from "@/lib/trust/labels";
import type { PublicReview } from "@/lib/db/reviews";
import type { Tables } from "@/types/database";

export function ReviewCard({
  review,
  showStatus = false,
}: {
  review: PublicReview | Tables<"user_reviews">;
  showStatus?: boolean;
}) {
  const reviewerName =
    "reviewerName" in review ? review.reviewerName : "Utilizator TROKO";

  return (
    <article className="rounded-[1.25rem] border border-border bg-card p-4 shadow-soft-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-black text-foreground">{reviewerName}</p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            {new Intl.DateTimeFormat("ro-RO", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date(review.created_at))}
          </p>
        </div>
        <RatingStars rating={review.rating} />
      </div>
      {review.comment ? (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {review.comment}
        </p>
      ) : (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Review fara comentariu.
        </p>
      )}
      {showStatus ? (
        <p className="mt-3 text-xs font-bold uppercase text-primary">
          {reviewStatusLabels[review.status]}
        </p>
      ) : null}
    </article>
  );
}

