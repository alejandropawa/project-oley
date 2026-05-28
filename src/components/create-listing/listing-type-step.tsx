import { categoryIcons } from "@/components/categories/category-icons";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/mock-data";
import type {
  CreateListingErrors,
  CreateListingValues,
} from "@/lib/create-listing-validation";

export function ListingTypeStep({
  values,
  errors,
  onCategoryChange,
}: {
  values: CreateListingValues;
  errors: CreateListingErrors;
  onCategoryChange: (categorySlug: string) => void;
}) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-black text-foreground">
          1. Alege tipul anunțului
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Selectează categoria care se potrivește cel mai bine anunțului tău.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => {
          const Icon = categoryIcons[category.iconName];
          const selected = values.categorySlug === category.slug;

          return (
            <button
              key={category.slug}
              type="button"
              aria-pressed={selected}
              onClick={() => onCategoryChange(category.slug)}
              className={cn(
                "flex min-h-32 flex-col items-center justify-center rounded-[0.9rem] border bg-background p-4 text-center transition hover:-translate-y-0.5 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                selected
                  ? "border-primary bg-brand-soft shadow-soft-sm"
                  : "border-border shadow-soft-sm",
              )}
            >
              <span
                className={cn(
                  "grid size-14 shrink-0 place-items-center rounded-full",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-brand-soft text-primary",
                )}
              >
                <Icon className="size-7" aria-hidden="true" />
              </span>
              <span className="mt-3 block text-sm font-black text-foreground">
                {category.name}
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                {category.description}
              </span>
            </button>
          );
        })}
      </div>

      {errors.categorySlug ? (
        <p className="mt-3 text-sm font-semibold text-destructive">
          {errors.categorySlug}
        </p>
      ) : null}
    </div>
  );
}
