import { ActiveFilterChips } from "@/components/search/active-filter-chips";
import { SearchResultsMap } from "@/components/maps/search-results-map";
import { ResultsCount } from "@/components/search/results-count";
import { SearchEmptyState } from "@/components/search/search-empty-state";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchPagination } from "@/components/search/pagination";
import { SaveSearchForm } from "@/components/search/save-search-form";
import { ViewToggle } from "@/components/search/view-toggle";
import { ListingGrid } from "@/components/listings/listing-grid";
import { ListingsMapPanel } from "@/components/listings/listings-browse-experience";
import type { SearchListingsParams, SearchListingsResult } from "@/lib/search/types";
import { describeSearchParamLocation } from "@/lib/search/url";

export function SearchPageLayout({
  params,
  result,
  action = "/anunturi",
  resetHref = "/anunturi",
  lockedCategory,
  lockedCitySlug,
}: {
  params: SearchListingsParams;
  result: SearchListingsResult;
  action?: string;
  resetHref?: string;
  lockedCategory?: string;
  lockedCitySlug?: string;
}) {
  const baseLocationLabel = describeSearchParamLocation(params);
  const locationLabel = params.nearMe
    ? params.radiusKm
      ? `La ${params.radiusKm} km de tine`
      : "Aproape de mine"
    : baseLocationLabel || "Toată România";

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
      <SearchFilters
        params={params}
        action={action}
        lockedCategory={lockedCategory}
        lockedCitySlug={lockedCitySlug}
      />
      <section className="grid min-w-0 gap-5">
        <div className="flex flex-col gap-4 rounded-[1.5rem] border border-border/90 bg-card/92 p-4 shadow-[0_18px_48px_rgba(15,70,61,0.08)] sm:flex-row sm:items-end sm:justify-between">
          <ResultsCount
            totalCount={result.totalCount}
            source={result.source}
            locationLabel={locationLabel}
          />
          <div className="flex flex-col gap-2 sm:items-end">
            <p className="text-sm font-semibold text-muted-foreground">
              Pagina {result.currentPage} din {result.totalPages}
            </p>
            <ViewToggle params={params} path={action} />
            <SaveSearchForm params={params} />
          </div>
        </div>

        <ActiveFilterChips params={params} resetHref={resetHref} path={action} />

        {params.view === "map" ? (
          <>
            <SearchResultsMap listings={result.listings} />
            {result.listings.length === 0 ? (
              <SearchEmptyState params={params} resetHref={resetHref} />
            ) : null}
          </>
        ) : result.listings.length > 0 ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0">
              <ListingGrid listings={result.listings} resetHref={resetHref} />
              <div className="mt-5">
                <SearchPagination
                  params={params}
                  totalPages={result.totalPages}
                  path={action}
                />
              </div>
            </div>
            <ListingsMapPanel
              listings={result.listings}
              locationLabel={locationLabel}
            />
          </div>
        ) : (
          <SearchEmptyState params={params} resetHref={resetHref} />
        )}
      </section>
    </div>
  );
}
