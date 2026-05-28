import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  onChange,
}: {
  rating: number;
  onChange?: (rating: number) => void;
}) {
  return (
    <div className="inline-flex gap-1" role={onChange ? "radiogroup" : "img"} aria-label={`${rating} din 5 stele`}>
      {[1, 2, 3, 4, 5].map((value) => {
        const active = value <= rating;

        if (onChange) {
          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              className="rounded-full p-1 text-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`${value} stele`}
              aria-checked={active}
              role="radio"
            >
              <Star
                className={cn("size-5", active ? "fill-current" : "fill-none")}
                aria-hidden="true"
              />
            </button>
          );
        }

        return (
          <Star
            key={value}
            className={cn(
              "size-4 text-warm",
              active ? "fill-current" : "fill-none",
            )}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}

