import type { ReactNode } from "react";

import { CategoryAttributeFields } from "@/components/create-listing/category-attribute-fields";
import { categories } from "@/lib/mock-data";
import type {
  CreateListingErrors,
  CreateListingValues,
} from "@/lib/create-listing-validation";
import type { ListingCondition } from "@/lib/mock-data";

const conditions: ListingCondition[] = [
  "Nou",
  "Foarte bun",
  "Bun",
  "Folosit",
  "Nu se aplică",
];

export function ListingDetailsStep({
  values,
  errors,
  onFieldChange,
  onCategoryChange,
  onAttributeChange,
}: {
  values: CreateListingValues;
  errors: CreateListingErrors;
  onFieldChange: <K extends keyof CreateListingValues>(
    key: K,
    value: CreateListingValues[K],
  ) => void;
  onCategoryChange: (categorySlug: string) => void;
  onAttributeChange: (
    key: string,
    value: CreateListingValues["attributes"][string],
  ) => void;
}) {
  const selectedCategory = categories.find(
    (category) => category.slug === values.categorySlug,
  );
  const priceLabel =
    values.type === "buy"
      ? "Buget"
      : values.type === "swap"
        ? "Valoare orientativă"
        : "Preț";
  const pricePlaceholder =
    values.type === "buy" ? "ex. 2500" : values.type === "swap" ? "opțional" : "ex. 1200";

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-black text-foreground">
          Detalii despre anunț
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Scrie clar ce oferi sau ce cauți. Primele propoziții contează mult.
        </p>
      </div>

      <div className="grid gap-4">
        <Field label="Titlu anunț" error={errors.title}>
          <input
            value={values.title}
            onChange={(event) => onFieldChange("title", event.target.value)}
            placeholder="ex. iPhone 14 Pro, 128GB"
            className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Minimum 8 caractere. Fii specific și ușor de găsit.
          </p>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Categorie" error={errors.categorySlug}>
            <select
              value={values.categorySlug}
              onChange={(event) => onCategoryChange(event.target.value)}
              className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Alege categoria</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Subcategorie">
            <select
              value={values.subcategory}
              disabled={!selectedCategory}
              onChange={(event) =>
                onFieldChange("subcategory", event.target.value)
              }
              className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
            >
              <option value="">
                {selectedCategory ? "Alege subcategoria" : "Alege categoria întâi"}
              </option>
              {selectedCategory?.subcategories.map((subcategory) => (
                <option key={subcategory} value={subcategory}>
                  {subcategory}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Descriere" error={errors.description}>
          <textarea
            value={values.description}
            onChange={(event) => onFieldChange("description", event.target.value)}
            placeholder="Descrie starea, ce este inclus, motivul vânzării sau ce cauți."
            rows={6}
            className="min-h-36 w-full resize-y rounded-[1rem] border border-input bg-background px-3 py-3 text-base leading-7 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Minimum 30 de caractere. Include detalii care răspund la întrebările
            evidente.
          </p>
        </Field>

        <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
          <Field label={priceLabel} error={errors.price}>
            <input
              value={values.price}
              onChange={(event) => onFieldChange("price", event.target.value)}
              inputMode="decimal"
              placeholder={pricePlaceholder}
              className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              {values.type === "rent"
                ? "Pentru închiriere, menționează în descriere dacă prețul este pe zi sau lună."
                : values.type === "swap"
                  ? "Pentru schimb, prețul este opțional."
                  : values.type === "buy"
                    ? "Pentru cumpărare, bugetul este opțional."
                    : "Pentru vânzare, prețul este obligatoriu."}
            </p>
          </Field>

          <Field label="Monedă">
            <select
              value={values.currency}
              onChange={(event) =>
                onFieldChange(
                  "currency",
                  event.target.value as CreateListingValues["currency"],
                )
              }
              className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="RON">RON</option>
              <option value="EUR">EUR</option>
            </select>
          </Field>
        </div>

        <label className="flex items-start gap-3 rounded-[1rem] border border-border bg-background p-3">
          <input
            type="checkbox"
            checked={values.negotiable}
            onChange={(event) =>
              onFieldChange("negotiable", event.target.checked)
            }
            className="mt-1 size-4 accent-[#2F6F65]"
          />
          <span>
            <span className="block text-sm font-bold text-foreground">
              Preț negociabil
            </span>
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
              Marchează dacă ești deschis la oferte sau ajustări.
            </span>
          </span>
        </label>

        <Field label="Stare">
          <select
            value={values.condition}
            onChange={(event) =>
              onFieldChange("condition", event.target.value as ListingCondition)
            }
            className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {conditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </Field>

        <CategoryAttributeFields
          categorySlug={values.categorySlug}
          values={values.attributes}
          onChange={onAttributeChange}
        />
        {errors.attributes ? (
          <p className="rounded-[1rem] border border-destructive/20 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
            {errors.attributes}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-foreground">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-sm font-semibold text-destructive">
          {error}
        </span>
      ) : null}
    </label>
  );
}
