import { ReviewCard } from "@/components/reviews/review-card";
import type { PublicReview } from "@/lib/db/reviews";
import type { Tables } from "@/types/database";

export function ReviewList({
  reviews,
  emptyText = "Nu exista review-uri inca.",
  showStatus = false,
}: {
  reviews: Array<PublicReview | Tables<"user_reviews">>;
  emptyText?: string;
  showStatus?: boolean;
}) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-[1.25rem] border border-dashed border-border bg-card p-5 text-sm leading-6 text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} showStatus={showStatus} />
      ))}
    </div>
  );
}

