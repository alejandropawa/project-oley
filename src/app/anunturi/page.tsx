import type { Metadata } from "next";

import { ListingsBrowseExperience } from "@/components/listings/listings-browse-experience";
import { JsonLd } from "@/components/seo/json-ld";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { categories } from "@/lib/mock-data";
import { getCityBySlug } from "@/lib/romanian-cities";
import { searchListings } from "@/lib/search/provider";
import { parseSearchParams, hasMeaningfulSearchParams } from "@/lib/search/url";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import {
  createPublicMetadata,
  indexRobots,
  noIndexRobots,
} from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site";
import { createClient } from "@/lib/supabase/server";
import type { SearchParamsRecord } from "@/lib/search/types";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}): Promise<Metadata> {
  const query = await searchParams;
  const params = parseSearchParams(query);
  const hasQueryParams = Object.values(query).some((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value),
  );
  const category = categories.find((item) => item.slug === params.category);
  const city = params.citySlug ? getCityBySlug(params.citySlug) : null;
  const titleParts = [
    params.q ? `Anunțuri ${params.q}` : "Anunțuri România",
    category?.name,
    city ? `în ${city.name}` : "",
  ].filter(Boolean);

  return createPublicMetadata({
    title: `${titleParts.join(" ")} — TROKO`,
    description:
      "Caută anunțuri din România pentru vânzare, cumpărare, închiriere și schimb.",
    path: "/anunturi",
    robots:
      hasQueryParams || hasMeaningfulSearchParams(params)
        ? noIndexRobots
        : indexRobots,
  });
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}) {
  const query = await searchParams;
  const params = parseSearchParams(query);
  const supabase = await createClient();
  const result = await searchListings(params, supabase);

  return (
    <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">
      <Header />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Acasă", url: absoluteUrl("/") },
          { name: "Anunțuri", url: absoluteUrl("/anunturi") },
        ])}
      />
      <ListingsBrowseExperience params={params} result={result} />
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
