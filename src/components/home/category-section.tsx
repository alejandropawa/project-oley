import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { categoryIcons } from "@/components/categories/category-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getListingCount } from "@/lib/listing-utils";
import { categories } from "@/lib/mock-data";

export function CategorySection() {
  return (
    <section id="categorii" className="bg-background py-10 sm:py-12">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">
              Categorii
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
              Alege unde vrei să cauți
            </h2>
          </div>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full border-border bg-card px-5 font-semibold"
          >
            <Link href="/categorii">
              Toate categoriile
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          {categories.map((category) => {
            const Icon = categoryIcons[category.iconName];
            const count = getListingCount(category.slug);

            return (
              <Link
                key={category.slug}
                href={`/categorii/${category.slug}`}
                className="group min-h-36 rounded-[1.35rem] border border-border bg-card p-4 shadow-soft-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="grid size-10 place-items-center rounded-[0.9rem] bg-muted text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <Badge className="rounded-full bg-secondary px-2 py-0.5 text-[0.7rem] font-semibold text-warm-foreground">
                    {count}
                  </Badge>
                </div>
                <h3 className="mt-4 text-base font-semibold leading-5 text-foreground">
                  {category.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                  {category.subcategories.slice(0, 3).join(" · ")}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
