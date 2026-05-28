import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getCityOptions,
  listingSortOptions,
  listingTypeOptions,
} from "@/lib/listing-utils";
import { categories } from "@/lib/mock-data";
import type { ListingFilters } from "@/lib/listing-utils";

export function ListingsFilters({
  filters,
  action = "/anunturi",
  resetHref = "/anunturi",
  compact = false,
  hideCategory = false,
}: {
  filters: ListingFilters;
  action?: string;
  resetHref?: string;
  compact?: boolean;
  hideCategory?: boolean;
}) {
  const cities = getCityOptions();

  return (
    <form
      action={action}
      className="rounded-[1.5rem] border border-border bg-card p-3 shadow-soft-sm sm:p-4"
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-foreground">
        <SlidersHorizontal className="size-4 text-primary" aria-hidden="true" />
        Filtre
      </div>

      <div
        className={
          compact
            ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            : "grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7"
        }
      >
        <label className={compact ? "sm:col-span-2" : "lg:col-span-2"}>
          <span className="mb-1.5 block text-xs font-bold text-muted-foreground">
            Caută
          </span>
          <Input
            name="q"
            defaultValue={filters.q}
            placeholder="Titlu, oraș, vânzător..."
            className="h-11 rounded-[1rem] bg-background"
          />
        </label>

        {!hideCategory ? (
          <label>
            <span className="mb-1.5 block text-xs font-bold text-muted-foreground">
              Categorie
            </span>
            <select
              name="category"
              defaultValue={filters.category}
              className="h-11 w-full rounded-[1rem] border border-input bg-background px-3 text-sm font-medium outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Toate categoriile</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label>
          <span className="mb-1.5 block text-xs font-bold text-muted-foreground">
            Tip
          </span>
          <select
            name="type"
            defaultValue={filters.type}
            className="h-11 w-full rounded-[1rem] border border-input bg-background px-3 text-sm font-medium outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {listingTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1.5 block text-xs font-bold text-muted-foreground">
            Oraș
          </span>
          <select
            name="city"
            defaultValue={filters.city}
            className="h-11 w-full rounded-[1rem] border border-input bg-background px-3 text-sm font-medium outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Toate orașele</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1.5 block text-xs font-bold text-muted-foreground">
            Preț minim
          </span>
          <Input
            name="min"
            inputMode="numeric"
            defaultValue={filters.min}
            placeholder="0"
            className="h-11 rounded-[1rem] bg-background"
          />
        </label>

        <label>
          <span className="mb-1.5 block text-xs font-bold text-muted-foreground">
            Preț maxim
          </span>
          <Input
            name="max"
            inputMode="numeric"
            defaultValue={filters.max}
            placeholder="5000"
            className="h-11 rounded-[1rem] bg-background"
          />
        </label>

        <label>
          <span className="mb-1.5 block text-xs font-bold text-muted-foreground">
            Sortează
          </span>
          <select
            name="sort"
            defaultValue={filters.sort}
            className="h-11 w-full rounded-[1rem] border border-input bg-background px-3 text-sm font-medium outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {listingSortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <Button
          asChild
          variant="ghost"
          className="h-11 rounded-full px-5 font-bold text-muted-foreground"
        >
          <Link href={resetHref}>Resetează</Link>
        </Button>
        <Button className="h-11 rounded-full bg-action px-5 font-bold text-action-foreground hover:bg-action-hover">
          Aplică filtrele
        </Button>
      </div>
    </form>
  );
}
