import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/listing-card";
import type { Listing } from "@/lib/mock-data";

export function ListingGrid({
  listings,
  resetHref = "/anunturi",
  emptyTitle = "Nu am găsit anunțuri pentru filtrele selectate.",
}: {
  listings: Listing[];
  resetHref?: string;
  emptyTitle?: string;
}) {
  if (listings.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-border bg-card p-8 text-center shadow-soft-sm">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-muted text-primary">
          <SearchX className="size-6" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          {emptyTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Încearcă să ajustezi căutarea, orașul, categoria sau intervalul de
          preț.
        </p>
        <Button
          asChild
          className="mt-5 h-11 rounded-full bg-primary px-5 font-semibold text-primary-foreground"
        >
          <Link href={resetHref}>Resetează filtrele</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.slug} listing={listing} />
      ))}
    </div>
  );
}
