import type { ReactNode } from "react";

import { CategoryAttributeFields } from "@/components/create-listing/category-attribute-fields";
import { listingTypeLabels } from "@/lib/listing-utils";
import { categories } from "@/lib/mock-data";
import { romanianLocations } from "@/lib/romanian-locations";
import type {
  CreateListingErrors,
  CreateListingValues,
} from "@/lib/create-listing-validation";
import type { ListingCondition, ListingType } from "@/lib/mock-data";

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
  onTypeChange,
  onCategoryChange,
  onSubcategoryChange,
  onAttributeChange,
  onLocationChange,
}: {
  values: CreateListingValues;
  errors: CreateListingErrors;
  onFieldChange: <K extends keyof CreateListingValues>(
    key: K,
    value: CreateListingValues[K],
  ) => void;
  onTypeChange: (type: ListingType) => void;
  onCategoryChange: (categorySlug: string) => void;
  onSubcategoryChange: (subcategory: string) => void;
  onAttributeChange: (
    key: string,
    value: CreateListingValues["attributes"][string],
  ) => void;
  onLocationChange: (locationValue: string) => void;
}) {
  const selectedCategory = categories.find(
    (category) => category.slug === values.categorySlug,
  );
  const allowedListingTypes = selectedCategory?.allowedListingTypes ?? [
    "sell",
    "buy",
    "rent",
    "swap",
  ];
  const selectedSubcategory = selectedCategory?.subcategoryGroups
    .flatMap((group) => group.items)
    .find((item) => item.name === values.subcategory);
  const selectedSubcategoryDetail =
    typeof values.attributes.subcategory_detail === "string"
      ? values.attributes.subcategory_detail
      : "";
  const descriptionCount = values.description.length;
  const priceLabel =
    values.type === "buy"
      ? "Buget"
      : values.type === "swap"
        ? "Valoare estimată"
        : values.type === "rent"
          ? "Preț închiriere"
          : "Preț";
  const priceRequired = values.type === "sell" || values.type === "rent";
  const locationValue =
    values.city && values.county ? `${values.city}|${values.county}` : "";

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-black text-foreground">
          2. Completează detaliile anunțului
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Furnizează informații relevante pentru a atrage cumpărători
          interesați.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Categorie" required error={errors.categorySlug}>
          <select
            value={values.categorySlug}
            onChange={(event) => onCategoryChange(event.target.value)}
            className={controlClassName}
          >
            <option value="">Selectează categoria</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tip anunț" required error={errors.type}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {allowedListingTypes.map((type) => (
              <button
                key={type}
                type="button"
                aria-pressed={values.type === type}
                onClick={() => onTypeChange(type)}
                className={
                  values.type === type
                    ? "h-11 rounded-[0.7rem] bg-primary px-3 text-sm font-black text-primary-foreground shadow-[0_10px_24px_rgba(0,95,63,0.18)]"
                    : "h-11 rounded-[0.7rem] border border-input bg-background px-3 text-sm font-bold text-foreground transition hover:bg-muted"
                }
              >
                {listingTypeLabels[type]}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Subcategorie" required error={errors.subcategory}>
          <select
            value={values.subcategory}
            disabled={!selectedCategory}
            onChange={(event) => onSubcategoryChange(event.target.value)}
            className={controlClassName}
          >
            <option value="">
              {selectedCategory
                ? "Selectează subcategoria"
                : "Alege categoria întâi"}
            </option>
            {selectedCategory?.subcategoryGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.items.map((item) => (
                  <option key={`${group.label}-${item.name}`} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>

        {selectedSubcategory?.children?.length ? (
          <Field label="Detaliu subcategorie">
            <select
              value={selectedSubcategoryDetail}
              onChange={(event) =>
                onAttributeChange("subcategory_detail", event.target.value)
              }
              className={controlClassName}
            >
              <option value="">Selectează detaliul</option>
              {selectedSubcategory.children.map((child) => (
                <option key={child} value={child}>
                  {child}
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        <Field label="Titlu anunț" required error={errors.title}>
          <input
            value={values.title}
            onChange={(event) => onFieldChange("title", event.target.value)}
            placeholder="Ex: Apartament 2 camere, central, renovat"
            className={controlClassName}
          />
        </Field>

        <Field label={priceLabel} required={priceRequired} error={errors.price}>
          <div className="grid grid-cols-[1fr_8rem]">
            <input
              value={values.price}
              onChange={(event) => onFieldChange("price", event.target.value)}
              inputMode="decimal"
              placeholder="Ex: 2.500"
              className="h-11 min-w-0 rounded-l-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <select
              value={values.currency}
              onChange={(event) =>
                onFieldChange(
                  "currency",
                  event.target.value as CreateListingValues["currency"],
                )
              }
              aria-label="Monedă"
              className="h-11 min-w-0 rounded-r-lg border border-l-0 border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="EUR">EUR</option>
              <option value="RON">RON</option>
            </select>
          </div>
        </Field>

        <Field label="Stare produs">
          <select
            value={values.condition}
            onChange={(event) =>
              onFieldChange("condition", event.target.value as ListingCondition)
            }
            className={controlClassName}
          >
            <option value="">Selectează starea</option>
            {conditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Localitate" required error={errors.city ?? errors.county}>
          <select
            value={locationValue}
            onChange={(event) => onLocationChange(event.target.value)}
            className={controlClassName}
          >
            <option value="">Ex: Cluj-Napoca</option>
            {romanianLocations.map((location) => (
              <option
                key={`${location.city}-${location.county}`}
                value={`${location.city}|${location.county}`}
              >
                {location.city}, {location.county}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Adresă (opțional)">
          <input
            value={values.locationLabel}
            onChange={(event) =>
              onFieldChange("locationLabel", event.target.value)
            }
            placeholder="Ex: Strada Ion Creangă nr. 10"
            className={controlClassName}
          />
        </Field>

        <Field
          label="Descriere"
          required
          error={errors.description}
          className="lg:col-span-2"
        >
          <div className="relative">
            <textarea
              value={values.description}
              onChange={(event) =>
                onFieldChange("description", event.target.value)
              }
              placeholder="Descrie produsul sau serviciul tău în detaliu..."
              rows={5}
              maxLength={2000}
              className="min-h-32 w-full resize-y rounded-lg border border-input bg-background px-3 py-3 pb-8 text-sm leading-6 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <span className="absolute bottom-3 right-3 text-xs font-semibold text-muted-foreground">
              {descriptionCount} / 2000
            </span>
          </div>
        </Field>

        <label className="flex items-center gap-3 lg:col-span-2">
          <input
            type="checkbox"
            checked={values.negotiable}
            onChange={(event) =>
              onFieldChange("negotiable", event.target.checked)
            }
            className="size-4 accent-brand"
          />
          <span className="text-sm font-bold text-muted-foreground">
            Preț negociabil
          </span>
        </label>

        <div className="lg:col-span-2">
          <CategoryAttributeFields
            categorySlug={values.categorySlug}
            values={values.attributes}
            onChange={onAttributeChange}
          />
          {errors.attributes ? (
            <p className="mt-3 rounded-[0.9rem] border border-destructive/20 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
              {errors.attributes}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const controlClassName =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60";

function Field({
  label,
  required = false,
  error,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-xs font-black text-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs font-semibold text-destructive">
          {error}
        </span>
      ) : null}
    </label>
  );
}
