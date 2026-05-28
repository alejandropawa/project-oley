import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ListingDetail } from "@/components/listings/listing-detail";
import { JsonLd } from "@/components/seo/json-ld";
import { SitePageShell } from "@/components/site/page-shell";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getCurrentUser } from "@/lib/auth/user";
import { getListingBySlug as getDbListingBySlug } from "@/lib/db/listings";
import { getActivePromotionForListing } from "@/lib/db/promotions";
import { getSellerTrustSummary } from "@/lib/db/trust";
import {
  getListingBySlug as getMockListingBySlug,
  getListingCategory,
} from "@/lib/listing-utils";
import { listings } from "@/lib/mock-data";
import {
  breadcrumbJsonLd,
  listingDescriptionForMetadata,
  listingJsonLd,
} from "@/lib/seo/json-ld";
import {
  createPublicMetadata,
  indexRobots,
  noIndexRobots,
} from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site";
import { createClient } from "@/lib/supabase/server";

type ListingPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return listings.map((listing) => ({ slug: listing.slug }));
}

export async function generateMetadata({
  params,
}: ListingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const dbResult = await getDbListingBySlug(slug, supabase);
  const listing =
    dbResult.listing ??
    (dbResult.source === "unavailable" || process.env.NODE_ENV !== "production"
      ? getMockListingBySlug(slug)
      : null);

  if (!listing) {
    return createPublicMetadata({
      title: "Anunț negăsit — TROKO",
      description: "Anunțul căutat nu este disponibil pe TROKO.",
      path: `/anunturi/${slug}`,
      robots: noIndexRobots,
    });
  }

  const isActive = !listing.status || listing.status === "active";

  return createPublicMetadata({
    title: `${listing.title} în ${listing.city} — TROKO`,
    description: listingDescriptionForMetadata(listing),
    path: `/anunturi/${listing.slug}`,
    image: listing.imageUrls?.[0],
    type: "article",
    robots: isActive ? indexRobots : noIndexRobots,
  });
}

export default async function ListingDetailPage({ params }: ListingPageProps) {
  const { slug } = await params;
  const [supabase, user] = await Promise.all([createClient(), getCurrentUser()]);
  const dbResult = await getDbListingBySlug(slug, supabase);
  const listing =
    dbResult.listing ??
    (dbResult.source === "unavailable" || process.env.NODE_ENV !== "production"
      ? getMockListingBySlug(slug)
      : null);

  if (!listing) {
    notFound();
  }

  const promotionResult = dbResult.listing
    ? await getActivePromotionForListing(listing.id, supabase)
    : { promotion: null };
  const sellerTrust = await getSellerTrustSummary(listing.userId, supabase);
  const decoratedListing =
    promotionResult.promotion && !listing.promotion
      ? {
          ...listing,
          promotion: {
            type: promotionResult.promotion.type,
            packageName: promotionResult.promotion.packageName,
            endsAt: promotionResult.promotion.ends_at,
          },
        }
      : listing;
  const category = getListingCategory(decoratedListing);
  const isSupabaseListing = Boolean(dbResult.listing);
  const isOwner = Boolean(user && decoratedListing.userId === user.id);

  return (
    <SitePageShell>
      <main className="relative isolate overflow-hidden">
        <JsonLd
          data={[
            listingJsonLd(decoratedListing),
            breadcrumbJsonLd([
              { name: "Acasă", url: absoluteUrl("/") },
              { name: "Anunțuri", url: absoluteUrl("/anunturi") },
              {
                name: category.name,
                url: absoluteUrl(`/categorii/${category.slug}`),
              },
              {
                name: decoratedListing.title,
                url: absoluteUrl(`/anunturi/${decoratedListing.slug}`),
              },
            ]),
          ]}
        />
        <section className="relative isolate overflow-hidden border-b border-border">
          <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">
            <Breadcrumbs
              items={[
                { label: "Acasă", href: "/" },
                { label: "Anunțuri", href: "/anunturi" },
                { label: category.name, href: `/categorii/${category.slug}` },
                { label: decoratedListing.title },
              ]}
            />
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10">
            <ListingDetail
              listing={decoratedListing}
              sellerTrust={sellerTrust.summary}
              contact={{
                isAuthenticated: Boolean(user),
                isOwner,
                canUseMessaging: Boolean(
                  isSupabaseListing && decoratedListing.userId,
                ),
                canUseReporting: Boolean(isSupabaseListing),
              }}
            />
          </div>
        </section>
      </main>
    </SitePageShell>
  );
}
