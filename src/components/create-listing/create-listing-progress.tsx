import { Check } from "lucide-react";

import { createListingSteps } from "@/lib/create-listing-validation";
import type { CreateListingStep } from "@/lib/create-listing-validation";

export function CreateListingProgress({ step }: { step: CreateListingStep }) {
  const progress = ((step + 1) / createListingSteps.length) * 100;

  return (
    <div className="rounded-[1.5rem] border border-border bg-card p-4 shadow-soft-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-primary">
            Pasul {step + 1} din {createListingSteps.length}
          </p>
          <h2 className="mt-1 text-xl font-black text-foreground">
            {createListingSteps[step]}
          </h2>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-primary">
          {Math.round(progress)}%
        </span>
      </div>

      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-background"
        aria-label={`Progres ${Math.round(progress)}%`}
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="mt-4 grid grid-cols-4 gap-2">
        {createListingSteps.map((label, index) => {
          const isDone = index < step;
          const isCurrent = index === step;

          return (
            <li key={label} className="min-w-0">
              <div
                className={
                  isCurrent || isDone
                    ? "flex h-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
                    : "flex h-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground"
                }
              >
                {isDone ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  <span className="text-xs font-black">{index + 1}</span>
                )}
              </div>
              <p className="mt-1 hidden truncate text-center text-xs font-semibold text-muted-foreground sm:block">
                {label}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
