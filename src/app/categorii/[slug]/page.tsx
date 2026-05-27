import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { categoryIcons } from "@/components/categories/category-icons";
import { SearchPageLayout } from "@/components/search/search-page-layout";
import { JsonLd } from "@/components/seo/json-ld";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
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
    <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">
      <Header />
      <main className="bg-[#FFFDF8]">
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
        <section className="relative isolate overflow-hidden border-b border-[#E8E1D8]">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <Breadcrumbs
              items={[
                { label: "Acasă", href: "/" },
                { label: "Categorii", href: "/categorii" },
                { label: category.name },
              ]}
            />

            <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
              <div>
                <span className="grid size-14 place-items-center rounded-[1.25rem] border border-[#E8E1D8] bg-[#FFFDF8]/88 text-[#0F4A43] shadow-[0_14px_34px_rgba(15,70,61,0.1)]">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h1 className="mt-5 font-serif text-5xl font-semibold leading-none text-[#0F4A43] sm:text-6xl">
                  {category.name}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[#2F3E3A]">
                  {category.description}
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
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
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
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
