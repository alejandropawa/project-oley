import { Check, HelpCircle } from "lucide-react";

import { createListingSteps } from "@/lib/create-listing-validation";
import { cn } from "@/lib/utils";
import type { CreateListingStep } from "@/lib/create-listing-validation";

export function CreateListingProgress({ step }: { step: CreateListingStep }) {
  return (
    <aside className="flex h-full flex-col justify-between gap-6 p-5 sm:p-6">
      <ol className="space-y-0">
        {createListingSteps.map((label, index) => {
          const isDone = index < step;
          const isCurrent = index === step;

          return (
            <li key={label} className="relative flex gap-4 pb-7 last:pb-0">
              {index < createListingSteps.length - 1 ? (
                <span className="absolute left-4 top-8 h-[calc(100%-2rem)] w-px bg-border" />
              ) : null}
              <span
                className={cn(
                  "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border text-xs font-black transition",
                  isDone &&
                    "border-primary bg-brand-soft text-primary",
                  isCurrent &&
                    "border-primary bg-primary text-primary-foreground",
                  !isDone &&
                    !isCurrent &&
                    "border-border bg-background text-muted-foreground",
                )}
              >
                {isDone ? <Check className="size-4" aria-hidden="true" /> : index + 1}
              </span>
              <div className="min-w-0 pt-1">
                <p
                  className={cn(
                    "text-sm font-black leading-5",
                    isCurrent || isDone
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {label}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="hidden rounded-lg border border-brand-border bg-secondary/60 p-4 lg:block">
        <div className="flex gap-3">
          <HelpCircle className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="text-xs font-black text-foreground">
              Ai nevoie de ajutor?
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Consultă ghidul nostru pentru crearea unui anunț de succes.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
