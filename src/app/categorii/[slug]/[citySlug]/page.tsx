import Link from "next/link";
import { notFound } from "next/navigation";

import { categoryIcons } from "@/components/categories/category-icons";
import { SearchPageLayout } from "@/components/search/search-page-layout";
import { JsonLd } from "@/components/seo/json-ld";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { getCategoryBySlug } from "@/lib/listing-utils";
import { categories } from "@/lib/mock-data";
import {
  getCityBySlug,
  romanianCities,
} from "@/lib/romanian-cities";
import { searchListings } from "@/lib/search/provider";
import { parseSearchParams } from "@/lib/search/url";
import {
  breadcrumbJsonLd,
  categoryPageJsonLd,
  cityPageJsonLd,
} from "@/lib/seo/json-ld";
import { createPublicMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site";
import { createClient } from "@/lib/supabase/server";
import type { SearchParamsRecord } from "@/lib/search/types";

type CategoryCityPageProps = {
  params: Promise<{ slug: string; citySlug: string }>;
  searchParams?: Promise<SearchParamsRecord>;
};

export function generateStaticParams() {
  return categories.flatMap((category) =>
    romanianCities.map((city) => ({
      slug: category.slug,
      citySlug: city.slug,
    })),
  );
}

export async function generateMetadata({ params }: CategoryCityPageProps) {
  const { slug, citySlug } = await params;
  const category = getCategoryBySlug(slug);
  const city = getCityBySlug(citySlug);

  if (!category || !city) {
    return createPublicMetadata({
      title: "Pagină negăsită — TROKO",
      description: "Categoria sau orașul căutat nu este disponibil încă pe TROKO.",
      path: "/categorii",
    });
  }

  return createPublicMetadata({
    title: `${category.name} ${city.name} — Anunțuri TROKO`,
    description: `Găsește anunțuri din categoria ${category.name} în ${city.name}. Vânzare, cumpărare, închiriere și schimb pe TROKO.`,
    path: `/categorii/${category.slug}/${city.slug}`,
  });
}

export default async function CategoryCityPage({
  params,
  searchParams,
}: CategoryCityPageProps) {
  const [{ slug, citySlug }, query] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({}),
  ]);
  const category = getCategoryBySlug(slug);
  const city = getCityBySlug(citySlug);

  if (!category || !city) {
    notFound();
  }

  const Icon = categoryIcons[category.iconName];
  const supabase = await createClient();
  const filters = parseSearchParams(
    query,
    { category: category.slug, citySlug: city.slug, perPage: 12 },
  );
  const searchResult = await searchListings(filters, supabase);
  const sameCategoryCities = romanianCities
    .filter((candidate) => candidate.slug !== city.slug)
    .slice(0, 6);
  const otherCategories = categories
    .filter((candidate) => candidate.slug !== category.slug)
    .slice(0, 6);

  return (
    <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">
      <Header />
      <main className="bg-[#FFFDF8]">
        <JsonLd
          data={[
            categoryPageJsonLd(
              category,
              absoluteUrl(`/categorii/${category.slug}/${city.slug}`),
            ),
            cityPageJsonLd(city, absoluteUrl(`/orase/${city.slug}`)),
            breadcrumbJsonLd([
              { name: "Acasă", url: absoluteUrl("/") },
              { name: "Categorii", url: absoluteUrl("/categorii") },
              {
                name: category.name,
                url: absoluteUrl(`/categorii/${category.slug}`),
              },
              {
                name: city.name,
                url: absoluteUrl(`/categorii/${category.slug}/${city.slug}`),
              },
            ]),
          ]}
        />
        <section className="relative isolate overflow-hidden border-b border-[#E8E1D8]">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <Breadcrumbs
              items={[
                { label: "Acasă", href: "/" },
                { label: "Categorii", href: "/categorii" },
                { label: category.name, href: `/categorii/${category.slug}` },
                { label: city.name },
              ]}
            />

            <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <span className="grid size-14 place-items-center rounded-[1.25rem] border border-[#E8E1D8] bg-[#FFFDF8]/88 text-[#0F4A43] shadow-[0_14px_34px_rgba(15,70,61,0.1)]">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h1 className="mt-5 font-serif text-5xl font-semibold leading-none text-[#0F4A43] sm:text-6xl">
                  {category.name} în {city.name}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[#2F3E3A]">
                  Explorează anunțuri din categoria {category.name} în{" "}
                  {city.name}, {city.county}.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-[#E8E1D8]/90 bg-[#FFFDF8]/88 p-4 shadow-[0_18px_48px_rgba(15,70,61,0.1)] backdrop-blur">
                <p className="text-sm font-black text-[#123F37]">
                  Subcategorii populare
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {category.subcategories.map((subcategory) => (
                    <span
                      key={subcategory}
                      className="rounded-full border border-[#E8E1D8] bg-[#FFFDF8]/80 px-3 py-1.5 text-sm font-semibold text-[#52645F]"
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
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase text-primary">
                  {searchResult.totalCount} rezultate
                </p>
                <h2 className="mt-1 text-2xl font-black text-foreground">
                  Anunțuri {category.name} în {city.name}
                </h2>
              </div>
              <Button
                asChild
                className="h-11 rounded-full bg-primary px-5 font-bold text-primary-foreground"
              >
                <Link href="/publica">Publică anunț în {city.name}</Link>
              </Button>
            </div>

            <SearchPageLayout
              params={filters}
              result={searchResult}
              action={`/categorii/${category.slug}/${city.slug}`}
              resetHref={`/categorii/${category.slug}/${city.slug}`}
              lockedCategory={category.slug}
              lockedCitySlug={city.slug}
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <aside className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
                <h2 className="text-lg font-black text-foreground">
                  {category.name} în alte orașe
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sameCategoryCities.map((candidate) => (
                    <Link
                      key={candidate.slug}
                      href={`/categorii/${category.slug}/${candidate.slug}`}
                    >
                      <Badge className="rounded-full bg-muted px-3 py-1.5 text-sm font-bold text-primary transition hover:bg-primary hover:text-primary-foreground">
                        {candidate.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </aside>

              <aside className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
                <h2 className="text-lg font-black text-foreground">
                  Alte categorii în {city.name}
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {otherCategories.map((candidate) => (
                    <Link
                      key={candidate.slug}
                      href={`/categorii/${candidate.slug}/${city.slug}`}
                    >
                      <Badge className="rounded-full bg-muted px-3 py-1.5 text-sm font-bold text-primary transition hover:bg-primary hover:text-primary-foreground">
                        {candidate.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
