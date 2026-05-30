import { SlidersHorizontal } from "lucide-react";

import { UseSearchLocationButton } from "@/components/location/use-search-location-button";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/mock-data";
import { radiusOptions } from "@/lib/locations/types";
import {
  getFallbackAttributeDefinitions,
  stringifyAttribute,
} from "@/lib/categories/attribute-definitions";
import {
  getCityOptions,
  getCountyOptions,
} from "@/lib/romanian-cities";
import { searchSortOptions } from "@/lib/search/sort";
import type { SearchListingsParams } from "@/lib/search/types";
import type { ReactNode } from "react";

const typeOptions = [
  { value: "all", label: "Toate" },
  { value: "sell", label: "Vând" },
  { value: "buy", label: "Cumpăr" },
  { value: "rent", label: "Închiriez" },
  { value: "swap", label: "Schimb" },
];

const conditionOptions = [
  { value: "all", label: "Toate" },
  { value: "Nou", label: "Nou" },
  { value: "Foarte bun", label: "Foarte bun" },
  { value: "Bun", label: "Bun" },
  { value: "Folosit", label: "Folosit" },
  { value: "Nu se aplică", label: "Nu se aplică" },
];

export function SearchFilters({
  params,
  action = "/anunturi",
  lockedCategory,
  lockedCitySlug,
}: {
  params: SearchListingsParams;
  action?: string;
  lockedCategory?: string;
  lockedCitySlug?: string;
}) {
  return (
    <>
      <details className="rounded-[1.5rem] border border-border bg-card p-4 shadow-soft-sm lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground">
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-primary" aria-hidden="true" />
            Filtre
          </span>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-primary">
            Deschide
          </span>
        </summary>
        <form action={action} className="mt-5 grid gap-4">
          <FilterFields
            params={params}
            lockedCategory={lockedCategory}
            lockedCitySlug={lockedCitySlug}
          />
          <Button className="h-11 rounded-full bg-action px-5 font-semibold text-action-foreground hover:bg-action-hover">
            Aplică filtrele
          </Button>
        </form>
      </details>

      <aside className="hidden rounded-[1.75rem] border border-border bg-card p-5 shadow-soft-sm lg:block">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="size-4 text-primary" aria-hidden="true" />
          Filtre
        </div>
        <form action={action} className="grid gap-4">
          <FilterFields
            params={params}
            lockedCategory={lockedCategory}
            lockedCitySlug={lockedCitySlug}
          />
          <Button className="h-11 rounded-full bg-action px-5 font-semibold text-action-foreground hover:bg-action-hover">
            Aplică filtrele
          </Button>
        </form>
      </aside>
    </>
  );
}

function FilterFields({
  params,
  lockedCategory,
  lockedCitySlug,
}: {
  params: SearchListingsParams;
  lockedCategory?: string;
  lockedCitySlug?: string;
}) {
  const categorySlug = lockedCategory ?? params.category;
  const selectedCategory = categories.find((category) => category.slug === categorySlug);
  const attributeDefinitions = categorySlug
    ? getFallbackAttributeDefinitions(categorySlug)
    : [];
  const cityOptions = getCityOptions();
  const countyOptions = getCountyOptions();

  return (
    <>
      {lockedCategory ? <input type="hidden" name="categorie" value={lockedCategory} /> : null}
      {lockedCitySlug ? <input type="hidden" name="oras" value={lockedCitySlug} /> : null}
      {params.latitude ? <input type="hidden" name="lat" value={params.latitude} /> : null}
      {params.longitude ? <input type="hidden" name="lng" value={params.longitude} /> : null}
      {params.nearMe ? <input type="hidden" name="aproape" value="1" /> : null}

      <Field label="Caută">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Caută telefoane, biciclete, apartamente..."
          className="h-11 w-full rounded-[1rem] border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </Field>

      {!lockedCategory ? (
        <Field label="Categorie">
          <select
            name="categorie"
            defaultValue={params.category}
            className="h-11 w-full rounded-[1rem] border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Toate categoriile</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {selectedCategory ? (
        <Field label="Subcategorie">
          <select
            name="subcategorie"
            defaultValue={params.subcategory}
            className="h-11 w-full rounded-[1rem] border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Toate subcategoriile</option>
            {selectedCategory.subcategories.map((subcategory) => (
              <option key={subcategory} value={subcategory}>
                {subcategory}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
        <Field label="Tip">
          <select
            name="tip"
            defaultValue={params.type}
            className="h-11 w-full rounded-[1rem] border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Stare">
          <select
            name="stare"
            defaultValue={params.condition}
            className="h-11 w-full rounded-[1rem] border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50"
          >
            {conditionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Preț min.">
          <input
            name="pret_min"
            inputMode="numeric"
            defaultValue={params.priceMin}
            placeholder="0"
            className="h-11 w-full rounded-[1rem] border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </Field>
        <Field label="Preț max.">
          <input
            name="pret_max"
            inputMode="numeric"
            defaultValue={params.priceMax}
            placeholder="5000"
            className="h-11 w-full rounded-[1rem] border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </Field>
      </div>

      <Field label="Monedă">
        <select
          name="moneda"
          defaultValue={params.currency}
          className="h-11 w-full rounded-[1rem] border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">RON și EUR</option>
          <option value="RON">RON</option>
          <option value="EUR">EUR</option>
        </select>
      </Field>

      <Field label="Sortează">
        <select
          name="sort"
          defaultValue={params.sort}
          className="h-11 w-full rounded-[1rem] border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {searchSortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      {!lockedCitySlug ? (
        <Field label="Oraș">
          <select
            name="oras"
            defaultValue={params.citySlug}
            className="h-11 w-full rounded-[1rem] border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Toate orașele</option>
            {cityOptions.map((city) => (
              <option key={city.value} value={city.value}>
                {city.label}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      <section className="grid gap-3 rounded-[1.25rem] border border-border bg-background p-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Aproape de mine</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Activează locația sau alege un oraș și o rază.
          </p>
        </div>
        <UseSearchLocationButton />
        <Field label="Rază">
          <select
            name="raza"
            defaultValue={params.radiusKm}
            className="h-11 w-full rounded-[1rem] border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {radiusOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </section>

      <Field label="Județ">
        <select
          name="judet"
          defaultValue={params.countySlug}
          className="h-11 w-full rounded-[1rem] border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">Toate județele</option>
          {countyOptions.map((county) => (
            <option key={county.slug} value={county.slug}>
              {county.label}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Brand">
          <input
            name="brand"
            defaultValue={params.brand}
            placeholder="ex. Apple"
            className="h-11 w-full rounded-[1rem] border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </Field>
        <Field label="Model">
          <input
            name="model"
            defaultValue={params.model}
            placeholder="ex. Golf"
            className="h-11 w-full rounded-[1rem] border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="An min.">
          <input
            name="an_min"
            inputMode="numeric"
            defaultValue={params.yearMin}
            placeholder="2015"
            className="h-11 w-full rounded-[1rem] border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </Field>
        <Field label="An max.">
          <input
            name="an_max"
            inputMode="numeric"
            defaultValue={params.yearMax}
            placeholder="2026"
            className="h-11 w-full rounded-[1rem] border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </Field>
      </div>

      {attributeDefinitions.length > 0 ? (
        <section className="grid gap-3 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase text-primary">
            Detalii categorie
          </p>
          {attributeDefinitions.map((definition) => {
            const name = `attr_${definition.key}`;
            const value = params.attributes[definition.key];

            if (definition.type === "boolean") {
              return (
                <label
                  key={definition.key}
                  className="flex items-start gap-3 rounded-[1rem] border border-border bg-background p-3"
                >
                  <input
                    name={name}
                    value="true"
                    type="checkbox"
                    defaultChecked={value === true || value === "true"}
                    className="mt-1 size-4 accent-brand"
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {definition.label}
                  </span>
                </label>
              );
            }

            if (definition.type === "select") {
              return (
                <Field
                  key={definition.key}
                  label={formatLabel(definition.label, definition.unit)}
                >
                  <select
                    name={name}
                    defaultValue={stringifyAttribute(
                      Array.isArray(value) ? value[0] : value,
                    )}
                    className="h-11 w-full rounded-[1rem] border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">Toate</option>
                    {definition.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>
              );
            }

            return (
              <Field
                key={definition.key}
                label={formatLabel(definition.label, definition.unit)}
              >
                <input
                  name={name}
                  type={definition.type === "number" ? "number" : "text"}
                  defaultValue={stringifyAttribute(
                    Array.isArray(value) ? value[0] : value,
                  )}
                  className="h-11 w-full rounded-[1rem] border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </Field>
            );
          })}
        </section>
      ) : null}
    </>
  );
}

function formatLabel(label: string, unit?: string) {
  return unit ? `${label} (${unit})` : label;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
