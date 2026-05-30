import Link from "next/link";

import { getActiveFilterChips } from "@/lib/search/filters";
import type { SearchListingsParams } from "@/lib/search/types";

export function ActiveFilterChips({
  params,
  resetHref,
  path = "/anunturi",
}: {
  params: SearchListingsParams;
  resetHref: string;
  path?: string;
}) {
  const chips = getActiveFilterChips(params, path);

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={chip.href}
          aria-label={`Elimină filtrul ${chip.label}`}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-primary"
        >
          {chip.label} <span aria-hidden="true">×</span>
        </Link>
      ))}
      <Link
        href={resetHref}
        className="rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        Resetează filtrele
      </Link>
    </div>
  );
}
