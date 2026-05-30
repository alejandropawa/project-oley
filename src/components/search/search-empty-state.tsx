import Link from "next/link";

import { Button } from "@/components/ui/button";
import { hasMeaningfulSearchParams } from "@/lib/search/url";
import type { SearchListingsParams } from "@/lib/search/types";

export function SearchEmptyState({
  params,
  resetHref,
}: {
  params: SearchListingsParams;
  resetHref: string;
}) {
  const canSave = hasMeaningfulSearchParams(params);
  const needsLocationContext =
    Boolean(params.radiusKm) &&
    !params.citySlug &&
    !params.latitude &&
    !params.longitude;

  return (
    <div className="rounded-[1.75rem] border border-dashed border-border bg-card p-8 text-center shadow-soft-sm">
      <h2 className="text-2xl font-semibold text-foreground">
        Nu am găsit anunțuri pentru filtrele selectate
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        {needsLocationContext
          ? "Alege un oraș sau folosește locația ta pentru ca filtrul de rază să aibă un punct de pornire."
          : "Încearcă să elimini câteva filtre sau salvează căutarea pentru a primi notificări când apar anunțuri noi."}
      </p>
      <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
        <Button
          asChild
          className="h-11 rounded-full bg-primary px-5 font-semibold text-primary-foreground"
        >
          <Link href={resetHref}>Resetează filtrele</Link>
        </Button>
        {canSave ? (
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full border-border bg-background px-5 font-semibold"
          >
            <Link href="/cont/cautari-salvate">Salvează căutarea</Link>
          </Button>
        ) : null}
        <Button
          asChild
          variant="ghost"
          className="h-11 rounded-full px-5 font-semibold text-muted-foreground"
        >
          <Link href="/publica">Publică anunț</Link>
        </Button>
      </div>
    </div>
  );
}
