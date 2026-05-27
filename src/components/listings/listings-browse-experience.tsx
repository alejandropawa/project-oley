import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  Heart,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type { ReactNode } from "react";

import { ActiveFilterChips } from "@/components/search/active-filter-chips";
import { SearchEmptyState } from "@/components/search/search-empty-state";
import { SearchPagination } from "@/components/search/pagination";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getListingAttributeSnippets } from "@/lib/categories/attribute-definitions";
import {
  formatListingPrice,
  getListingCategory,
  listingTypeLabels,
} from "@/lib/listing-utils";
import { categories } from "@/lib/mock-data";
import type { Listing } from "@/lib/mock-data";
import { getCityByName, getCityBySlug } from "@/lib/romanian-cities";
import { searchSortOptions } from "@/lib/search/sort";
import type {
  SearchListingsParams,
  SearchListingsResult,
} from "@/lib/search/types";
import { describeSearchParamLocation } from "@/lib/search/url";

const typeOptions = [
  { value: "all", label: "Toate ofertele" },
  { value: "sell", label: "De vânzare" },
  { value: "buy", label: "Cumpăr" },
  { value: "rent", label: "De închiriat" },
  { value: "swap", label: "Schimb" },
];

const cityPositions: Record<string, { x: number; y: number }> = {
  bucuresti: { x: 70, y: 64 },
  "cluj-napoca": { x: 33, y: 34 },
  iasi: { x: 82, y: 30 },
  timisoara: { x: 18, y: 58 },
  brasov: { x: 66, y: 57 },
  constanta: { x: 86, y: 78 },
  oradea: { x: 22, y: 29 },
  sibiu: { x: 50, y: 49 },
  craiova: { x: 43, y: 76 },
  ploiesti: { x: 75, y: 68 },
  arad: { x: 17, y: 49 },
  galati: { x: 88, y: 55 },
  pitesti: { x: 62, y: 69 },
  suceava: { x: 72, y: 21 },
  "targu-mures": { x: 46, y: 39 },
};

export function ListingsBrowseExperience({
  params,
  result,
}: {
  params: SearchListingsParams;
  result: SearchListingsResult;
}) {
  const activeCategory = categories.find(
    (category) => category.slug === params.category,
  );
  const city = params.citySlug ? getCityBySlug(params.citySlug) : null;
  const title = activeCategory?.name ?? "Anunțuri";
  const subtitle = activeCategory
    ? `${activeCategory.description} Găsește oferte locale curate, filtrate și ușor de comparat.`
    : "Descoperă anunțuri locale pentru vânzare, cumpărare, închiriere și schimb în România.";
  const locationLabel =
    describeSearchParamLocation(params) || city?.name || "România";

  return (
    <main className="relative isolate overflow-hidden">
      <section className="mx-auto w-full max-w-[1440px] px-5 pb-8 pt-8 sm:px-8 lg:px-10">
        <Breadcrumbs
          items={[
            { label: "Acasă", href: "/" },
            activeCategory
              ? { label: activeCategory.name }
              : { label: "Anunțuri" },
          ]}
        />

        <div className="mt-5 max-w-3xl">
          <h1 className="font-serif text-5xl font-semibold leading-none text-[#0F4A43] sm:text-6xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#2F3E3A]">
            {subtitle}
          </p>
        </div>

        <ListingsFilterBar params={params} />

        <div className="mt-5">
          <ActiveFilterChips
            params={params}
            resetHref="/anunturi"
            path="/anunturi"
          />
        </div>

        <section className="mt-5 grid gap-7 xl:grid-cols-[minmax(0,1.12fr)_minmax(420px,0.78fr)] xl:items-start">
          <div className="min-w-0">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-base font-black text-[#0F4A43]">
                {new Intl.NumberFormat("ro-RO").format(result.totalCount)}{" "}
                anunțuri găsite
              </p>
              <SortMiniForm params={params} />
            </div>

            {result.listings.length > 0 ? (
              <div className="grid gap-3">
                {result.listings.map((listing) => (
                  <CompactListingRow key={listing.slug} listing={listing} />
                ))}
                <SearchPagination
                  params={params}
                  totalPages={result.totalPages}
                  path="/anunturi"
                />
              </div>
            ) : (
              <SearchEmptyState params={params} resetHref="/anunturi" />
            )}
          </div>

          <ListingsMapPanel
            listings={result.listings}
            locationLabel={locationLabel}
          />
        </section>
      </section>
    </main>
  );
}

function ListingsFilterBar({ params }: { params: SearchListingsParams }) {
  return (
    <form
      action="/anunturi"
      className="mt-8 rounded-[1.5rem] border border-[#E8E1D8]/90 bg-[#FFFDF8]/90 p-4 shadow-[0_24px_70px_rgba(15,70,61,0.12)] backdrop-blur-md"
    >
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_0.8fr_0.7fr_0.7fr_0.95fr_auto]">
        <label className="relative block">
          <span className="sr-only">Caută anunțuri</span>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#0F4A43]"
            aria-hidden="true"
          />
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Caută în anunțuri..."
            className="h-12 w-full rounded-full border border-[#E8E1D8] bg-[#FFFDF8]/80 pl-12 pr-4 text-sm text-[#123F37] outline-none transition placeholder:text-[#78847F] focus:border-[#2F6F65] focus:ring-3 focus:ring-[#2F6F65]/20"
          />
        </label>

        <SelectField
          name="categorie"
          label="Categorie"
          value={params.category}
          options={[
            { value: "", label: "Toate categoriile" },
            ...categories.map((category) => ({
              value: category.slug,
              label: category.name,
            })),
          ]}
        />
        <SelectField
          name="tip"
          label="Tip"
          value={params.type}
          options={typeOptions}
        />
        <input
          name="pret_min"
          inputMode="numeric"
          defaultValue={params.priceMin}
          placeholder="Preț minim"
          className="h-12 rounded-full border border-[#E8E1D8] bg-[#FFFDF8]/80 px-4 text-sm outline-none focus:border-[#2F6F65] focus:ring-3 focus:ring-[#2F6F65]/20"
        />
        <input
          name="pret_max"
          inputMode="numeric"
          defaultValue={params.priceMax}
          placeholder="Preț maxim"
          className="h-12 rounded-full border border-[#E8E1D8] bg-[#FFFDF8]/80 px-4 text-sm outline-none focus:border-[#2F6F65] focus:ring-3 focus:ring-[#2F6F65]/20"
        />
        <SelectField
          name="oras"
          label="Oraș"
          value={params.citySlug}
          options={[
            { value: "", label: "Oraș sau zonă" },
            ...[
              "bucuresti",
              "cluj-napoca",
              "iasi",
              "timisoara",
              "brasov",
              "constanta",
            ].map((slug) => {
              const city = getCityBySlug(slug);
              return { value: slug, label: city?.name ?? slug };
            }),
          ]}
          icon={<MapPin className="size-4" aria-hidden="true" />}
        />
        <Button className="h-12 rounded-full bg-[#0F4A43] px-8 text-sm font-bold text-white shadow-[0_14px_34px_rgba(15,70,61,0.18)] hover:bg-[#173F38]">
          Caută
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#E8F1EE] px-3 py-1.5 text-xs font-bold text-[#123F37]">
          <SlidersHorizontal className="size-3.5" aria-hidden="true" />
          Filtre rapide
        </span>
        {(params.category || params.citySlug || params.q) ? (
          <Link
            href="/anunturi"
            className="text-xs font-bold text-[#0F4A43] hover:text-[#2F6F65]"
          >
            Resetează filtrele
          </Link>
        ) : (
          <span className="text-xs font-semibold text-[#52645F]">
            România
          </span>
        )}
      </div>
    </form>
  );
}

function SelectField({
  name,
  label,
  value,
  options,
  icon,
}: {
  name: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  icon?: ReactNode;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      {icon ? (
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#0F4A43]">
          {icon}
        </span>
      ) : null}
      <select
        name={name}
        defaultValue={value}
        className={`h-12 w-full appearance-none rounded-full border border-[#E8E1D8] bg-[#FFFDF8]/80 ${
          icon ? "pl-11" : "pl-4"
        } pr-10 text-sm text-[#123F37] outline-none transition focus:border-[#2F6F65] focus:ring-3 focus:ring-[#2F6F65]/20`}
      >
        {options.map((option) => (
          <option key={`${name}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#52645F]"
        aria-hidden="true"
      />
    </label>
  );
}

function SortMiniForm({ params }: { params: SearchListingsParams }) {
  return (
    <form action="/anunturi" className="flex items-center gap-2">
      {params.q ? <input type="hidden" name="q" value={params.q} /> : null}
      {params.category ? (
        <input type="hidden" name="categorie" value={params.category} />
      ) : null}
      {params.citySlug ? (
        <input type="hidden" name="oras" value={params.citySlug} />
      ) : null}
      <label className="sr-only" htmlFor="listing-sort">
        Sortează anunțurile
      </label>
      <select
        id="listing-sort"
        name="sort"
        defaultValue={params.sort}
        className="h-10 rounded-full border border-[#E8E1D8] bg-[#FFFDF8]/90 px-4 text-sm font-medium text-[#123F37] outline-none focus:border-[#2F6F65] focus:ring-3 focus:ring-[#2F6F65]/20"
      >
        {searchSortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Button className="h-10 rounded-full bg-[#0F4A43] px-4 text-xs font-bold text-white hover:bg-[#173F38]">
        Aplică
      </Button>
    </form>
  );
}

function CompactListingRow({ listing }: { listing: Listing }) {
  const firstImage = listing.imageUrls?.[0];
  const category = getListingCategory(listing);
  const snippets = getListingAttributeSnippets(
    listing.categorySlug,
    listing.attributes,
  ).slice(0, 3);

  return (
    <Link
      href={`/anunturi/${listing.slug}`}
      className="group grid gap-4 rounded-[1.25rem] border border-[#E8E1D8]/80 bg-[#FFFDF8]/92 p-3 shadow-[0_16px_46px_rgba(15,70,61,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_64px_rgba(15,70,61,0.12)] sm:grid-cols-[220px_1fr_auto]"
    >
      <div
        className="relative aspect-[16/10] overflow-hidden rounded-[1rem] bg-[#E8F1EE] sm:aspect-auto sm:h-32"
        style={firstImage ? undefined : { background: listing.visualStyle }}
      >
        {firstImage ? (
          <Image
            src={firstImage}
            alt={`Fotografie pentru ${listing.title}`}
            fill
            sizes="(max-width: 640px) 100vw, 220px"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-x-8 bottom-8 h-7 rounded-full bg-white/35" />
        )}
        <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-[#FFFDF8]/90 text-[#0F4A43] shadow-sm">
          <Heart className="size-4" aria-hidden="true" />
        </span>
      </div>

      <div className="min-w-0 py-1">
        <h2 className="line-clamp-2 text-lg font-black leading-6 text-[#123F37]">
          {listing.title}
        </h2>
        <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[#52645F]">
          <MapPin className="size-4 text-[#0F4A43]" aria-hidden="true" />
          {listing.city}, {listing.county}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-bold text-[#52645F]">
          <span>{category.name}</span>
          {snippets.map((snippet) => (
            <span key={snippet}>• {snippet}</span>
          ))}
        </div>
        <span className="mt-3 inline-flex rounded-full bg-[#E8F1EE] px-3 py-1 text-xs font-bold text-[#0F4A43]">
          {listingTypeLabels[listing.type]}
        </span>
      </div>

      <div className="flex flex-row items-end justify-between gap-4 sm:min-w-32 sm:flex-col sm:items-end sm:py-4">
        <p className="text-xl font-black text-[#0F4A43]">
          {formatListingPrice(listing)}
        </p>
        <span className="text-xs font-medium text-[#52645F]">
          {new Intl.DateTimeFormat("ro-RO", {
            day: "2-digit",
            month: "short",
          }).format(new Date(listing.createdAt))}
        </span>
      </div>
    </Link>
  );
}

export function ListingsMapPanel({
  listings,
  locationLabel,
}: {
  listings: Listing[];
  locationLabel: string;
}) {
  const markers = getListingMarkers(listings);

  return (
    <aside className="sticky top-24 hidden overflow-hidden rounded-[1.5rem] border border-[#E8E1D8]/80 bg-[#E8F1EE] shadow-[0_22px_70px_rgba(15,70,61,0.12)] xl:block">
      <div className="relative min-h-[520px] bg-[#EDE6D8]">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-80 [background-image:radial-gradient(circle_at_20%_25%,rgba(47,111,101,0.14),transparent_14rem),radial-gradient(circle_at_80%_70%,rgba(233,180,76,0.13),transparent_13rem),linear-gradient(135deg,rgba(255,253,248,0.55),rgba(232,241,238,0.4))]"
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 600 520"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M-20 105C95 132 146 93 235 128C310 158 359 118 438 142C509 164 560 122 625 144V560H-20Z"
            fill="#DDE7D8"
          />
          <path
            d="M-20 312C96 276 173 332 255 298C340 263 386 323 477 289C545 264 583 294 625 281V560H-20Z"
            fill="#CBDCCF"
          />
          <path
            d="M145 0C130 82 180 146 246 205C312 263 305 343 270 520"
            fill="none"
            stroke="#B8D3D6"
            strokeWidth="3"
            opacity="0.7"
          />
          <path
            d="M-10 380C85 361 150 387 225 368C289 352 343 370 413 352C498 330 548 349 620 334"
            fill="none"
            stroke="#FFFDF8"
            strokeWidth="16"
            opacity="0.55"
          />
          <path
            d="M88 70C165 132 202 193 286 214C352 231 411 272 502 250"
            fill="none"
            stroke="#AFCED0"
            strokeWidth="2"
            opacity="0.65"
          />
        </svg>

        <div className="absolute left-5 top-5 flex h-12 w-[210px] items-center gap-3 rounded-full bg-[#FFFDF8]/95 px-4 text-sm font-semibold text-[#123F37] shadow-sm">
          <Search className="size-4 text-[#0F4A43]" aria-hidden="true" />
          Caută în hartă
        </div>
        <div className="absolute right-5 top-5 grid overflow-hidden rounded-full border border-[#E8E1D8] bg-[#FFFDF8]/95 text-[#0F4A43] shadow-sm">
          <button className="grid size-10 place-items-center border-b border-[#E8E1D8] text-lg font-bold">
            +
          </button>
          <button className="grid size-10 place-items-center text-lg font-bold">
            −
          </button>
        </div>

        {markers.map((marker) => (
          <div
            key={marker.slug}
            className="absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#0F4A43] text-xs font-black text-white shadow-[0_10px_24px_rgba(15,70,61,0.28)]"
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            title={marker.label}
          >
            {marker.count}
          </div>
        ))}

        <div className="absolute inset-x-5 bottom-5 rounded-[1.15rem] bg-[#FFFDF8]/92 p-4 shadow-sm backdrop-blur">
          <p className="text-sm font-black text-[#0F4A43]">
            Rezultate în {locationLabel}
          </p>
          <p className="mt-1 text-xs leading-5 text-[#52645F]">
            Harta este o previzualizare statică. Coordonatele publice rămân
            aproximative pentru siguranța utilizatorilor.
          </p>
        </div>
      </div>
    </aside>
  );
}

function getListingMarkers(listings: Listing[]) {
  const counts = new Map<string, { label: string; count: number }>();

  for (const listing of listings) {
    const city = getCityByName(listing.city);

    if (!city) {
      continue;
    }

    const current = counts.get(city.slug) ?? { label: city.name, count: 0 };
    counts.set(city.slug, { ...current, count: current.count + 1 });
  }

  return Array.from(counts.entries())
    .map(([slug, item]) => ({
      slug,
      label: item.label,
      count: item.count,
      ...(cityPositions[slug] ?? { x: 50, y: 50 }),
    }))
    .slice(0, 14);
}
