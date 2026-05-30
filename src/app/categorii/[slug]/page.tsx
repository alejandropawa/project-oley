import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { categoryIcons } from "@/components/categories/category-icons";
import { SearchPageLayout } from "@/components/search/search-page-layout";
import { JsonLd } from "@/components/seo/json-ld";
import { SitePageShell } from "@/components/site/page-shell";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getCategoryBySlug } from "@/lib/listing-utils";
import { categories } from "@/lib/mock-data";
import { searchListings } from "@/lib/search/provider";
import { parseSearchParams } from "@/lib/search/url";
import { breadcrumbJsonLd, categoryPageJsonLd } from "@/lib/seo/json-ld";
import { createPublicMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site";
import { createClient } from "@/lib/supabase/server";
import type { SearchParamsRecord } from "@/lib/search/types";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParamsRecord>;
};

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return createPublicMetadata({
      title: "Categorie negăsită — TROKO",
      description: "Categoria căutată nu este disponibilă încă pe TROKO.",
      path: "/categorii",
    });
  }

  return createPublicMetadata({
    title: `Anunțuri ${category.name} — TROKO`,
    description: `Explorează anunțuri din categoria ${category.name} pe TROKO. Găsește oferte locale pentru vânzare, cumpărare, închiriere și schimb.`,
    path: `/categorii/${category.slug}`,
  });
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const Icon = categoryIcons[category.iconName];
  const filters = parseSearchParams(query, { category: category.slug, page: 1 });
  const supabase = await createClient();
  const result = await searchListings(filters, supabase);

  return (
    <SitePageShell>
      <main className="relative isolate overflow-hidden">
        <JsonLd
          data={[
            categoryPageJsonLd(category, absoluteUrl(`/categorii/${category.slug}`)),
            breadcrumbJsonLd([
              { name: "Acasă", url: absoluteUrl("/") },
              { name: "Categorii", url: absoluteUrl("/categorii") },
              {
                name: category.name,
                url: absoluteUrl(`/categorii/${category.slug}`),
              },
            ]),
          ]}
        />
        <section className="relative isolate overflow-hidden border-b border-border">
          <div className="mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
            <Breadcrumbs
              items={[
                { label: "Acasă", href: "/" },
                { label: "Categorii", href: "/categorii" },
                { label: category.name },
              ]}
            />

            <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
              <div>
                <span className="grid size-14 place-items-center rounded-[1.25rem] border border-border bg-card/88 text-brand shadow-[0_14px_34px_rgba(15,70,61,0.1)]">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h1 className="mt-5 font-heading text-4xl font-semibold leading-none text-brand sm:text-5xl min-[1800px]:text-6xl">
                  {category.name}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-brand-ink">
                  {category.description}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-border/90 bg-card/88 p-4 shadow-[0_18px_48px_rgba(15,70,61,0.1)] backdrop-blur">
                <p className="text-sm font-semibold text-brand-ink">
                  Subcategorii populare
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {category.subcategories.map((subcategory) => (
                    <span
                      key={subcategory}
                      className="rounded-full border border-border bg-card/80 px-3 py-1.5 text-sm font-semibold text-brand-muted"
                    >
                      {subcategory}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10">
            <SearchPageLayout
              params={filters}
              result={result}
              action={`/categorii/${category.slug}`}
              resetHref={`/categorii/${category.slug}`}
              lockedCategory={category.slug}
            />
          </div>
        </section>
      </main>
    </SitePageShell>
  );
}
