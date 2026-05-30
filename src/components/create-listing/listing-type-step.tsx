import { categoryIcons } from "@/components/categories/category-icons";
import { listingTypeLabels } from "@/lib/listing-utils";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/mock-data";
import type {
  CreateListingErrors,
  CreateListingValues,
} from "@/lib/create-listing-validation";
import type { ListingType } from "@/lib/mock-data";

const listingTypes: ListingType[] = ["sell", "rent", "buy", "swap"];

export function ListingTypeStep({
  values,
  errors,
  onTypeChange,
  onCategoryChange,
}: {
  values: CreateListingValues;
  errors: CreateListingErrors;
  onTypeChange: (type: ListingType) => void;
  onCategoryChange: (categorySlug: string) => void;
}) {
  return (
    <div className="grid gap-8">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-semibold text-foreground">
          1. Tip și categorie
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Alege intenția anunțului, apoi categoria potrivită. Opțiunile rămân simple și clare pe mobil.
        </p>
      </div>

      <section className="grid gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Tip anunț</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Selectează ce vrei să faci cu acest anunț.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-4">
          {listingTypes.map((type) => {
            const selected = values.type === type;

            return (
              <button
                key={type}
                type="button"
                aria-pressed={selected}
                onClick={() => onTypeChange(type)}
                className={cn(
                  "h-12 rounded-sm border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20",
                  selected
                    ? "border-primary bg-primary text-primary-foreground shadow-soft-sm"
                    : "border-border bg-white text-foreground hover:border-primary/35 hover:bg-brand-soft hover:text-primary",
                )}
              >
                {listingTypeLabels[type]}
              </button>
            );
          })}
        </div>
        {errors.type ? (
          <p className="text-sm font-semibold text-destructive">{errors.type}</p>
        ) : null}
      </section>

      <section className="grid gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Categorie</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Alege categoria principală. Detaliile fine apar în pasul următor.
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
                  "flex min-h-36 flex-col items-start justify-between rounded-md border bg-white p-5 text-left shadow-soft-sm transition hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-soft focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20",
                  selected && "border-primary bg-brand-soft shadow-soft",
                )}
              >
                <span
                  className={cn(
                    "grid size-12 shrink-0 place-items-center rounded-sm transition",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-brand-soft text-primary",
                  )}
                >
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <span>
                  <span className="mt-4 block text-base font-semibold text-foreground">
                    {category.name}
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                    {category.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {errors.categorySlug ? (
          <p className="text-sm font-semibold text-destructive">
            {errors.categorySlug}
          </p>
        ) : null}
      </section>
    </div>
  );
}
