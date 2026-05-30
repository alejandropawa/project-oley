import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { categoryIcons } from "@/components/categories/category-icons";
import { getListingCount } from "@/lib/listing-utils";
import type { Category } from "@/lib/mock-data";

export function CategoryCard({ category }: { category: Category }) {
  const Icon = categoryIcons[category.iconName];
  const count = getListingCount(category.slug);

  return (
    <Link
      href={`/categorii/${category.slug}`}
      className="group flex h-full min-h-52 flex-col rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-12 place-items-center rounded-[1rem] bg-muted text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <Badge className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
          {count} {count === 1 ? "anunț" : "anunțuri"}
        </Badge>
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <h3 className="text-xl font-semibold text-foreground">{category.name}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {category.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {category.subcategories.slice(0, 3).map((subcategory) => (
            <span
              key={subcategory}
              className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-muted-foreground"
            >
              {subcategory}
            </span>
          ))}
        </div>

        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          Vezi categoria
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}
