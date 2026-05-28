import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";

import { PromotedListingBadge } from "@/components/promotions/promoted-listing-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatListingPrice,
  getListingCategory,
  listingTypeLabels,
} from "@/lib/listing-utils";
import { getListingAttributeSnippets } from "@/lib/categories/attribute-definitions";
import { formatDistanceKm } from "@/lib/locations/distance";
import { cn } from "@/lib/utils";
import type { Listing, ListingType } from "@/lib/mock-data";

const typeStyles: Record<ListingType, string> = {
  sell: "border-brand-border bg-brand-soft text-brand",
  buy: "border-warm/45 bg-secondary text-warm-foreground",
  rent: "border-brand-border bg-brand-surface text-brand-ink",
  swap: "border-brand-border bg-brand-surface text-brand",
};

export function ListingCard({ listing }: { listing: Listing }) {
  const category = getListingCategory(listing);
  const firstImage = listing.imageUrls?.[0];
  const attributeSnippets = getListingAttributeSnippets(
    listing.categorySlug,
    listing.attributes,
  );
  const distanceLabel = formatDistanceKm(listing.distanceKm);

  return (
    <Link href={`/anunturi/${listing.slug}`} className="group block h-full">
      <Card className="h-full gap-0 rounded-[1.5rem] border border-border bg-card p-2 shadow-soft-sm transition group-hover:-translate-y-0.5 group-hover:shadow-soft">
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-muted"
          style={firstImage ? undefined : { background: listing.visualStyle }}
        >
          {firstImage ? (
            <Image
              src={firstImage}
              alt={`Fotografie pentru ${listing.title}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : null}
          <div className="absolute left-3 top-3">
            <div className="flex flex-col items-start gap-2">
              {listing.promotion ? (
                <PromotedListingBadge type={listing.promotion.type} />
              ) : null}
              <Badge
                variant="outline"
                className={cn(
                  "h-7 rounded-full px-3 text-xs font-black shadow-soft-sm",
                  typeStyles[listing.type],
                )}
              >
                {listingTypeLabels[listing.type]}
              </Badge>
            </div>
          </div>
          <div className="absolute right-3 top-3 rounded-full bg-white/70 px-2.5 py-1 text-xs font-bold text-foreground backdrop-blur-md">
            {category.name}
          </div>
          {!firstImage ? (
            <>
              <div className="absolute inset-x-5 bottom-5 h-10 rounded-full bg-white/35 backdrop-blur-md" />
              <div className="absolute bottom-7 left-8 h-3 w-24 rounded-full bg-white/55" />
            </>
          ) : null}
        </div>

        <CardHeader className="px-2 pb-0 pt-4">
          <CardTitle className="line-clamp-2 min-h-12 text-lg font-black leading-6">
            {listing.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-2 pb-3 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xl font-black text-primary">
              {formatListingPrice(listing)}
            </p>
            {listing.isNegotiable ? (
              <Badge className="rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-warm-foreground">
                Negociabil
              </Badge>
            ) : null}
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">
            {listing.condition}
          </p>
          {attributeSnippets.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {attributeSnippets.map((snippet) => (
                <span
                  key={snippet}
                  className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground"
                >
                  {snippet}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
            <MapPin className="size-4 text-primary" aria-hidden="true" />
            {listing.city}, {listing.county}
          </div>
          {distanceLabel ? (
            <p className="mt-1 text-xs font-bold text-primary">
              {distanceLabel}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
