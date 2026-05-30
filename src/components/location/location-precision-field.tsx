import {
  locationPrecisionDescriptions,
  locationPrecisionLabels,
  type ListingLocationPrecision,
} from "@/lib/locations/types";
import { cn } from "@/lib/utils";

const options: ListingLocationPrecision[] = [
  "city",
  "approximate",
  "exact_private",
];

export function LocationPrecisionField({
  value,
  onChange,
}: {
  value: ListingLocationPrecision;
  onChange: (value: ListingLocationPrecision) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-foreground">
        Precizia locației
      </legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {options.map((option) => {
          const selected = value === option;

          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option)}
              className={cn(
                "rounded-[1.25rem] border p-4 text-left transition hover:border-primary/50",
                selected
                  ? "border-primary bg-brand-soft"
                  : "border-border bg-background",
              )}
            >
              <span className="block text-sm font-semibold text-foreground">
                {locationPrecisionLabels[option]}
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                {locationPrecisionDescriptions[option]}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
