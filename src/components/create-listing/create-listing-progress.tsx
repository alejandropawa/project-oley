import { ArrowRight, Check, HelpCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CreateListingStep } from "@/lib/create-listing-validation";

const editorSteps = [
  "Tip anunț",
  "Detalii",
  "Fotografii",
  "Preview și publicare",
] as const;

export function CreateListingProgress({
  onOpenGuide,
  step,
}: {
  onOpenGuide: () => void;
  step: CreateListingStep;
}) {
  return (
    <aside className="flex h-full flex-col gap-4 p-4 sm:p-5 lg:justify-between lg:p-7">
      <ol className="grid grid-cols-4 gap-2 lg:block lg:space-y-0 lg:pt-1">
        {editorSteps.map((label, index) => {
          const isDone = index < step;
          const isCurrent = index === step;

          return (
            <li
              key={label}
              className="relative flex min-w-0 flex-col items-center gap-2 text-center lg:flex-row lg:items-start lg:gap-4 lg:pb-8 lg:text-left lg:last:pb-0"
            >
              {index < editorSteps.length - 1 ? (
                <span className="absolute left-4 top-8 hidden h-[calc(100%-2rem)] w-px bg-primary/24 lg:block" />
              ) : null}
              <span
                className={cn(
                  "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold shadow-sm transition",
                  isDone &&
                    "border-primary bg-card text-primary",
                  isCurrent &&
                    "border-primary bg-primary text-primary-foreground",
                  !isDone &&
                    !isCurrent &&
                    "border-border bg-background text-muted-foreground",
                )}
              >
                {isDone ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </span>
              <div className="min-w-0 pt-1">
                <p
                  className={cn(
                    "text-[0.7rem] font-semibold leading-4 sm:text-xs lg:text-sm lg:leading-5",
                    isCurrent || isDone
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {label}
                </p>
                <p className="mt-1 hidden text-xs font-medium leading-5 text-muted-foreground lg:block">
                  {getStepHint(index, isDone, isCurrent)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="hidden rounded-md border border-brand-border bg-secondary/60 p-4 shadow-sm lg:block">
        <div className="flex gap-3">
          <HelpCircle className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="text-xs font-semibold text-foreground">
              Ai nevoie de ajutor?
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Consultă ghidul nostru pentru crearea unui anunț de succes.
            </p>
            <button
              type="button"
              onClick={onOpenGuide}
              aria-label="Vezi ghidul de publicare"
              className="mt-3 inline-flex h-9 items-center gap-2 rounded-sm border border-border bg-card px-3 text-xs font-semibold text-primary shadow-sm transition hover:border-primary/35 hover:bg-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
            >
              Vezi ghidul
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function getStepHint(index: number, isDone: boolean, isCurrent: boolean) {
  if (isDone) {
    return "Completat";
  }

  if (!isCurrent) {
    return "Urmează";
  }

    return [
      "Alege categoria",
    "Informațiile anunțului",
    "Adaugă fotografii",
    "Verifică și publică",
  ][index];
}
