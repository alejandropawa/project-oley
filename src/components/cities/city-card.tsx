import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { RomanianCity } from "@/lib/romanian-cities";

export function CityCard({
  city,
  count,
}: {
  city: RomanianCity;
  count: number;
}) {
  return (
    <Link
      href={`/orase/${city.slug}`}
      className="group flex h-full min-h-48 flex-col rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-12 place-items-center rounded-[1rem] bg-muted text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
          <MapPin className="size-5" aria-hidden="true" />
        </span>
        <Badge className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
          {count} {count === 1 ? "anunț" : "anunțuri"}
        </Badge>
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <h3 className="text-xl font-black text-foreground">{city.name}</h3>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          {city.county}
        </p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Anunțuri locale în {city.name}, pregătite pentru cumpărare, vânzare,
          închiriere și schimb.
        </p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
          Vezi orașul
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}
