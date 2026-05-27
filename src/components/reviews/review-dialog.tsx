"use client";

import { useState, useTransition } from "react";
import { MessageSquareText } from "lucide-react";

import { createReviewAction } from "@/app/actions/reviews";
import { RatingStars } from "@/components/reviews/rating-stars";
import { Button } from "@/components/ui/button";

export function ReviewDialog({
  reviewedUserId,
  conversationId,
  listingId,
}: {
  reviewedUserId: string;
  conversationId: string;
  listingId?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitReview() {
    setMessage("");
    startTransition(async () => {
      const result = await createReviewAction({
        reviewedUserId,
        conversationId,
        listingId,
        rating,
        comment,
      });

      if (!result.success) {
        setMessage(result.error ?? "Nu am putut trimite review-ul.");
        return;
      }

      setComment("");
      setMessage("Review-ul a fost publicat. Multumim!");
    });
  }

  return (
    <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-black text-foreground">Ai finalizat interactiunea?</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Review-urile ajuta comunitatea TROKO sa cumpere si sa vanda mai in
            siguranta.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="h-11 rounded-full bg-primary px-5 font-bold text-primary-foreground"
        >
          <MessageSquareText className="size-4" aria-hidden="true" />
          Scrie review
        </Button>
      </div>

      {open ? (
        <div className="mt-5 grid gap-4 rounded-[1.25rem] border border-border bg-background p-4">
          <div>
            <p className="mb-2 text-sm font-bold text-foreground">Rating</p>
            <RatingStars rating={rating} onChange={setRating} />
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-foreground">
              Comentariu optional
            </span>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              maxLength={1200}
              placeholder="Cum a decurs interactiunea?"
              className="w-full rounded-[1rem] border border-input bg-card px-3 py-3 text-sm leading-6 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
          {message ? (
            <p className="rounded-[1rem] border border-border bg-card p-3 text-sm font-semibold text-muted-foreground">
              {message}
            </p>
          ) : null}
          <Button
            type="button"
            disabled={isPending}
            onClick={submitReview}
            className="h-11 rounded-full bg-primary px-5 font-bold text-primary-foreground"
          >
            {isPending ? "Se trimite..." : "Trimite review"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

