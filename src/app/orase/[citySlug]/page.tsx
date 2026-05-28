import Link from "next/link";
import { notFound } from "next/navigation";

import { CityHero } from "@/components/cities/city-hero";
import { ListingGrid } from "@/components/listings/listing-grid";
import { StaticMapCard } from "@/components/maps/static-map-card";
import { JsonLd } from "@/components/seo/json-ld";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/mock-data";
import {
  getCityBySlug,
  romanianCities,
} from "@/lib/romanian-cities";
import { searchListings } from "@/lib/search/provider";
import { parseSearchParams } from "@/lib/search/url";
import { breadcrumbJsonLd, cityPageJsonLd } from "@/lib/seo/json-ld";
import { createPublicMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site";
import { createClient } from "@/lib/supabase/server";

type CityPageProps = {
  params: Promise<{ citySlug: string }>;
};

export function generateStaticParams() {
  return romanianCities.map((city) => ({ citySlug: city.slug }));
}

export async function generateMetadata({ params }: CityPageProps) {
  const { citySlug } = await params;
  const city = getCityBySlug(citySlug);

  if (!city) {
    return createPublicMetadata({
      title: "Oraș negăsit — TROKO",
      description: "Orașul căutat nu este disponibil încă pe TROKO.",
      path: "/orase",
    });
  }

  return createPublicMetadata({
    title: `Anunțuri ${city.name} — TROKO`,
    description: `Găsește anunțuri în ${city.name} pentru vânzare, cumpărare, închiriere și schimb pe TROKO.`,
    path: `/orase/${city.slug}`,
  });
}

export default async function CityDetailPage({ params }: CityPageProps) {
  const { citySlug } = await params;
  const city = getCityBySlug(citySlug);

  if (!city) {
    notFound();
  }

  const supabase = await createClient();
  const filters = parseSearchParams({}, { citySlug: city.slug, perPage: 12 });
  const searchResult = await searchListings(filters, supabase);
  const cityListings = searchResult.listings;
  const categoryCounts = categories
    .map((category) => ({
      category,
      count: cityListings.filter(
        (listing) => listing.categorySlug === category.slug,
      ).length,
    }))
    .filter((item) => item.count > 0);

  return (
    <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">
      <Header />
      <main className="bg-card">
        <JsonLd
          data={[
            cityPageJsonLd(city, absoluteUrl(`/orase/${city.slug}`)),
            breadcrumbJsonLd([
              { name: "Acasă", url: absoluteUrl("/") },
              { name: "Orașe", url: absoluteUrl("/orase") },
              { name: city.name, url: absoluteUrl(`/orase/${city.slug}`) },
            ]),
          ]}
        />
        <section className="relative isolate overflow-hidden border-b border-border">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <Breadcrumbs
              items={[
                { label: "Acasă", href: "/" },
                { label: "Orașe", href: "/orase" },
                { label: city.name },
              ]}
            />
            <CityHero city={city} />
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:px-8">
            <div className="rounded-[1.5rem] border border-border bg-card p-4 shadow-soft-sm">
              <h2 className="text-lg font-black text-foreground">
                Categorii active în {city.name}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {categoryCounts.length > 0 ? (
                  categoryCounts.map(({ category, count }) => (
                    <Link
                      key={category.slug}
                      href={`/categorii/${category.slug}/${city.slug}`}
                    >
                      <Badge className="rounded-full bg-muted px-3 py-1.5 text-sm font-bold text-primary transition hover:bg-primary hover:text-primary-foreground">
                        {category.name} · {count}
                      </Badge>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-muted-foreground">
                    Categoriile se vor popula pe măsură ce apar primele anunțuri
                    active în {city.name}.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase text-primary">
                  {cityListings.length} rezultate
                </p>
                <h2 className="mt-1 text-2xl font-black text-foreground">
                  Anunțuri recomandate în {city.name}
                </h2>
              </div>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-full border-border bg-card px-5 font-bold"
              >
                <Link href={`/anunturi?oras=${city.slug}`}>
                  Vezi toate anunțurile
                </Link>
              </Button>
            </div>

            {cityListings.length > 0 ? (
              <ListingGrid
                listings={cityListings.slice(0, 12)}
                resetHref={`/orase/${city.slug}`}
              />
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-border bg-card p-8 text-center shadow-soft-sm">
                <h2 className="text-xl font-black text-foreground">
                  Nu avem încă anunțuri active în {city.name}.
                </h2>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                  TROKO pornește cu orașele mari și va crește natural odată cu
                  primele anunțuri publicate local.
                </p>
                <Button
                  asChild
                  className="mt-5 h-11 rounded-full bg-primary px-5 font-bold text-primary-foreground"
                >
                  <Link href="/publica">Publică primul anunț în {city.name}</Link>
                </Button>
              </div>
            )}

            <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
              <h2 className="text-xl font-black text-foreground">
                Piață locală pentru {city.name}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Pe TROKO poți urmări anunțuri din {city.name}, {city.county},
                fără să pierzi timp printre rezultate irelevante. Caută produse,
                locuințe, servicii sau propuneri de schimb și continuă discuția
                în siguranță prin contul tău TROKO.
              </p>
            </article>

            <StaticMapCard
              title={`Hartă pentru ${city.name}`}
              description={`Punctul de pe hartă folosește centrul orașului ${city.name}. Anunțurile TROKO afișează public doar locații aproximative.`}
              listings={cityListings}
              heightClass="min-h-80"
            />
          </div>
        </section>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
