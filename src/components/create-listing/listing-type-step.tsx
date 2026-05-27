import { KeyRound, Repeat2, Search, Tag } from "lucide-react";
import type { ComponentType } from "react";

import { cn } from "@/lib/utils";
import { listingTypeLabels } from "@/lib/listing-utils";
import type {
  CreateListingErrors,
  CreateListingValues,
} from "@/lib/create-listing-validation";
import type { ListingType } from "@/lib/mock-data";

const typeOptions: Array<{
  type: ListingType;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  {
    type: "sell",
    title: "Vând",
    description: "Publică un produs sau serviciu pe care vrei să îl vinzi.",
    icon: Tag,
  },
  {
    type: "buy",
    title: "Cumpăr",
    description: "Spune comunității ce cauți.",
    icon: Search,
  },
  {
    type: "rent",
    title: "Închiriez",
    description: "Oferă sau caută ceva pentru închiriere.",
    icon: KeyRound,
  },
  {
    type: "swap",
    title: "Schimb",
    description: "Propune un schimb avantajos.",
    icon: Repeat2,
  },
];

export function ListingTypeStep({
  values,
  errors,
  onChange,
}: {
  values: CreateListingValues;
  errors: CreateListingErrors;
  onChange: (type: ListingType) => void;
}) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-black text-foreground">Ce vrei să publici?</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Alege tipul anunțului. Îl poți ajusta mai târziu înainte de preview.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {typeOptions.map((option) => {
          const Icon = option.icon;
          const selected = values.type === option.type;

          return (
            <button
              key={option.type}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.type)}
              className={cn(
                "flex min-h-36 items-start gap-4 rounded-[1.5rem] border bg-background p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/50",
                selected
                  ? "border-primary bg-[#E8F1EE] shadow-soft-sm"
                  : "border-border shadow-soft-sm",
              )}
            >
              <span
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-[1rem]",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-primary",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-lg font-black text-foreground">
                  {option.title}
                </span>
                <span className="mt-2 block text-sm leading-6 text-muted-foreground">
                  {option.description}
                </span>
                {selected ? (
                  <span className="mt-3 inline-flex rounded-full bg-card px-2.5 py-1 text-xs font-bold text-primary">
                    Selectat: {listingTypeLabels[option.type]}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      {errors.type ? (
        <p className="mt-3 text-sm font-semibold text-destructive">
          {errors.type}
        </p>
      ) : null}
    </div>
  );
}
