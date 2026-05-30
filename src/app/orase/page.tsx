import { CityGrid } from "@/components/cities/city-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { SitePageShell } from "@/components/site/page-shell";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getCityListingCounts } from "@/lib/db/listings";
import { listings } from "@/lib/mock-data";
import { romanianCities, normalizeRomanianSlug } from "@/lib/romanian-cities";
import { createPublicMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/seo/site";
import { createClient } from "@/lib/supabase/server";

export const metadata = createPublicMetadata({
  title: "Anunțuri pe orașe — TROKO",
  description: "Explorează anunțuri locale pe TROKO în orașele din România.",
  path: "/orase",
});

export default async function CitiesPage() {
  const supabase = await createClient();
  const dbCounts = await getCityListingCounts(
    romanianCities.map((city) => city.name),
    supabase,
  );
  const counts =
    dbCounts.source === "supabase" ? dbCounts.counts : getMockCityCounts();

  return (
    <SitePageShell>
      <main className="relative isolate overflow-hidden">
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Acasă", url: absoluteUrl("/") },
            { name: "Orașe", url: absoluteUrl("/orase") },
          ])}
        />
        <section className="border-b border-border bg-background">
          <div className="mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
            <Breadcrumbs
              items={[{ label: "Acasă", href: "/" }, { label: "Orașe" }]}
            />
            <div className="mt-8 max-w-3xl">
              <p className="text-sm font-semibold uppercase text-primary">
                Orașe TROKO
              </p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight text-foreground sm:text-4xl min-[1800px]:text-5xl">
                Anunțuri locale în orașele din România
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Alege orașul și descoperă anunțuri pentru vânzare, cumpărare,
                închiriere și schimb aproape de tine.
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10">
            <CityGrid cities={romanianCities} counts={counts} />
          </div>
        </section>
      </main>
    </SitePageShell>
  );
}

function getMockCityCounts() {
  const counts = new Map<string, number>();

  for (const city of romanianCities) {
    counts.set(
      city.name,
      listings.filter((listing) => normalizeRomanianSlug(listing.city) === city.slug)
        .length,
    );
  }

  return counts;
}
