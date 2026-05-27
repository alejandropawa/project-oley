import { ReviewList } from "@/components/reviews/review-list";
import type { PublicReview } from "@/lib/db/reviews";

export function PublicProfileReviews({ reviews }: { reviews: PublicReview[] }) {
  return (
    <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-soft-sm">
      <h2 className="text-xl font-black text-foreground">Review-uri</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        Rating bazat pe review-uri de la utilizatori TROKO.
      </p>
      <div className="mt-5">
        <ReviewList
          reviews={reviews}
          emptyText="Acest profil nu are review-uri publice inca."
        />
      </div>
    </section>
  );
}

