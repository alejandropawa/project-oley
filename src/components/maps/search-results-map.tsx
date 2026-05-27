import { StaticMapCard } from "@/components/maps/static-map-card";
import type { Listing } from "@/lib/mock-data";

export function SearchResultsMap({ listings }: { listings: Listing[] }) {
  return (
    <StaticMapCard
      title="Rezultate pe hartă"
      description="Harta interactivă va fi disponibilă după configurarea providerului de hărți. Până atunci, filtrarea după distanță folosește coordonate publice aproximative."
      listings={listings}
      heightClass="min-h-[520px]"
    />
  );
}
