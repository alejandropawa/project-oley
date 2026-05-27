import { StaticMapCard } from "@/components/maps/static-map-card";
import type { Listing } from "@/lib/mock-data";

export function ListingMapPreview({ listing }: { listing: Listing }) {
  return (
    <StaticMapCard
      title={listing.locationLabel || `${listing.city}, ${listing.county}`}
      description="Locația este aproximativă pentru siguranța utilizatorilor. TROKO nu afișează adrese exacte."
      listings={[listing]}
      heightClass="min-h-64"
    />
  );
}
