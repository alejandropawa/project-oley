import Link from "next/link";

import { ListingGrid } from "@/components/listings/listing-grid";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/lib/mock-data";

export function PublicProfileListings({ listings }: { listings: Listing[] }) {
  return (
    <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-soft-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground">Anunturi active</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Anunturile publice ale acestui profil.
          </p>
        </div>
        <Button asChild variant="outline" className="h-10 rounded-full font-bold">
          <Link href="/anunturi">Exploreaza anunturi</Link>
        </Button>
      </div>
      <div className="mt-5">
        {listings.length > 0 ? (
          <ListingGrid listings={listings} />
        ) : (
          <div className="rounded-[1rem] border border-dashed border-border bg-background p-5 text-sm leading-6 text-muted-foreground">
            Acest profil nu are anunturi active in acest moment.
          </div>
        )}
      </div>
    </section>
  );
}
