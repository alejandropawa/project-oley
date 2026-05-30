import { saveSearchAction } from "@/app/actions/saved-searches";
import { Button } from "@/components/ui/button";
import { formatSavedSearchSummary } from "@/lib/search/filters";
import { hasMeaningfulSearchParams } from "@/lib/search/url";
import type { SearchListingsParams } from "@/lib/search/types";

export function SaveSearchForm({ params }: { params: SearchListingsParams }) {
  if (!hasMeaningfulSearchParams(params)) {
    return null;
  }

  const name = params.q ? `Căutare: ${params.q}` : formatSavedSearchSummary(params);
  const savedParams = {
    ...params,
    latitude: params.latitude ? roundCoordinate(params.latitude) : "",
    longitude: params.longitude ? roundCoordinate(params.longitude) : "",
  };

  return (
    <form action={saveSearchAction}>
      <input type="hidden" name="name" value={name} />
      <input type="hidden" name="query" value={params.q} />
      <input type="hidden" name="filters" value={JSON.stringify(savedParams)} />
      {params.nearMe ? (
        <p className="mb-2 text-xs font-semibold text-muted-foreground">
          Pentru confidențialitate, salvăm doar locația aproximativă a căutării.
        </p>
      ) : null}
      <Button
        variant="outline"
        className="h-11 rounded-full border-border bg-card px-5 font-semibold"
      >
        Salvează căutarea
      </Button>
    </form>
  );
}

function roundCoordinate(value: string) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return "";
  }

  return String(Math.round(numeric * 100) / 100);
}
