import Link from "next/link";
import { MapPin } from "lucide-react";

import { formatListingPrice } from "@/lib/listing-utils";
import type { Listing } from "@/lib/mock-data";

export function StaticMapCard({
  title = "Hartă TROKO",
  description = "Harta interactivă va fi disponibilă după configurarea providerului de hărți.",
  listings = [],
  heightClass = "min-h-72",
}: {
  title?: string;
  description?: string;
  listings?: Listing[];
  heightClass?: string;
}) {
  return (
    <div
      className={`${heightClass} relative overflow-hidden rounded-[1.75rem] border border-border bg-[#E8F1EE] p-5 shadow-soft-sm`}
    >
      <div className="absolute inset-0 opacity-70">
        <div className="absolute left-[-10%] top-8 h-px w-[120%] rotate-[-8deg] bg-primary/15" />
        <div className="absolute left-[-10%] top-24 h-px w-[120%] rotate-[7deg] bg-primary/15" />
        <div className="absolute left-[-10%] top-44 h-px w-[120%] rotate-[-4deg] bg-primary/15" />
        <div className="absolute left-1/4 top-[-20%] h-[140%] w-px rotate-[18deg] bg-primary/10" />
        <div className="absolute right-1/4 top-[-20%] h-[140%] w-px rotate-[-14deg] bg-primary/10" />
      </div>

      <div className="relative z-10 max-w-md">
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-card text-primary shadow-soft-sm">
          <MapPin className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-xl font-black text-foreground">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="relative z-10 mt-5 grid gap-2 sm:grid-cols-2">
        {listings.slice(0, 4).map((listing, index) => (
          <Link
            key={listing.id}
            href={`/anunturi/${listing.slug}`}
            className="rounded-[1rem] border border-white/70 bg-card/90 p-3 shadow-soft-sm backdrop-blur transition hover:border-primary/40"
            style={{
              transform: `translate(${index % 2 === 0 ? 0 : 8}px, ${index * 2}px)`,
            }}
          >
            <p className="line-clamp-1 text-sm font-black text-foreground">
              {listing.title}
            </p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              {listing.city} · {formatListingPrice(listing)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
