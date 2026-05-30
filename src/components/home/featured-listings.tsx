import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/listing-card";
import { featuredListings } from "@/lib/mock-data";

export function FeaturedListings() {
  return (
    <section id="anunturi" className="border-t border-border bg-card py-10 sm:py-12">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">
              Preview
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
              Câteva anunțuri de pornire
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Un eșantion scurt din experiența de browsing: preț, oraș, stare și
              categorie la vedere.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full border-border bg-background px-5 font-semibold hover:bg-muted"
          >
            <Link href="/anunturi">
              Vezi toate
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredListings.slice(0, 3).map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  );
}
