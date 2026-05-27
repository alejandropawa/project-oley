import { formatListingPrice, getListingCategory } from "@/lib/listing-utils";
import type { RomanianCity } from "@/lib/romanian-cities";
import { SITE_NAME, absoluteUrl, getSiteUrl } from "@/lib/seo/site";
import type { Category, Listing } from "@/lib/mock-data";

type JsonLdObject = Record<string, unknown>;

export type BreadcrumbJsonLdItem = {
  name: string;
  url: string;
};

export function websiteJsonLd(): JsonLdObject {
  const siteUrl = getSiteUrl();

  return compactJsonLd({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    inLanguage: "ro-RO",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/anunturi?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  });
}

export function organizationJsonLd(): JsonLdObject {
  return compactJsonLd({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: getSiteUrl(),
  });
}

export function breadcrumbJsonLd(items: BreadcrumbJsonLdItem[]): JsonLdObject {
  return compactJsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
}

export function listingJsonLd(listing: Listing): JsonLdObject {
  const category = getListingCategory(listing);
  const url = absoluteUrl(`/anunturi/${listing.slug}`);
  const image = listing.imageUrls?.[0];
  const hasPrice = Boolean(
    listing.price !== null &&
      listing.currency &&
      (listing.type === "sell" || listing.type === "rent"),
  );
  const isRealEstate = category.slug === "imobiliare";
  const availability =
    listing.status && listing.status !== "active"
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock";

  return compactJsonLd({
    "@context": "https://schema.org",
    "@type": isRealEstate ? "RealEstateListing" : "Product",
    name: listing.title,
    description: listing.description,
    image,
    url,
    category: category.name,
    offers: hasPrice
      ? compactJsonLd({
          "@type": "Offer",
          price: listing.price,
          priceCurrency: listing.currency === "lei" ? "RON" : listing.currency,
          availability,
          url,
          areaServed: {
            "@type": "City",
            name: listing.city,
          },
        })
      : undefined,
    areaServed: {
      "@type": "City",
      name: listing.city,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.city,
      addressRegion: listing.county,
      addressCountry: "RO",
    },
  });
}

export function categoryPageJsonLd(category: Category, url: string): JsonLdObject {
  return compactJsonLd({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Anunțuri ${category.name}`,
    description: category.description,
    url,
    inLanguage: "ro-RO",
  });
}

export function cityPageJsonLd(city: RomanianCity, url: string): JsonLdObject {
  return compactJsonLd({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Anunțuri în ${city.name}`,
    description: `Anunțuri locale în ${city.name}, ${city.county}, pe TROKO.`,
    url,
    inLanguage: "ro-RO",
    about: {
      "@type": "City",
      name: city.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: city.name,
        addressRegion: city.county,
        addressCountry: "RO",
      },
    },
  });
}

export function listingDescriptionForMetadata(listing: Listing) {
  const category = getListingCategory(listing);
  const price = formatListingPrice(listing);
  const trimmedDescription = listing.description
    .replace(/\s+/g, " ")
    .slice(0, 145)
    .trim();

  return `${category.name} în ${listing.city}. ${price}. ${trimmedDescription}`;
}

function compactJsonLd<T extends JsonLdObject>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (entry === undefined || entry === null) {
        return false;
      }

      if (Array.isArray(entry)) {
        return entry.length > 0;
      }

      return true;
    }),
  ) as T;
}
