import { Camera, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getListingAttributeSnippets } from "@/lib/categories/attribute-definitions";
import { parseCreateListingPrice } from "@/lib/create-listing-validation";
import { listingTypeLabels } from "@/lib/listing-utils";
import { categories } from "@/lib/mock-data";
import type { CreateListingValues } from "@/lib/create-listing-validation";

export function ListingPreviewStep({ values }: { values: CreateListingValues }) {
  const category = categories.find((item) => item.slug === values.categorySlug);
  const firstPhoto = values.photos[0];
  const attributeSnippets = getListingAttributeSnippets(
    values.categorySlug,
    values.attributes,
  );
  const subcategoryDetail =
    typeof values.attributes.subcategory_detail === "string"
      ? values.attributes.subcategory_detail
      : "";

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-black text-foreground">
          4. Preview și publicare
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Verifică detaliile anunțului tău înainte de publicare.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
        <section className="overflow-hidden rounded-lg border border-border bg-card shadow-soft-sm">
          <div
            className="relative aspect-[16/9] overflow-hidden bg-muted"
            style={
              firstPhoto
                ? {
                    backgroundImage: `url(${firstPhoto.url})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }
                : {
                    background:
                      "linear-gradient(135deg, var(--brand-soft) 0%, var(--secondary) 52%, var(--brand) 100%)",
                  }
            }
          >
            {!firstPhoto ? (
              <div className="absolute inset-0 grid place-items-center text-primary">
                <Camera className="size-12" aria-hidden="true" />
              </div>
            ) : null}
            <Badge className="absolute bottom-3 right-3 rounded-md bg-foreground/80 px-2 py-1 text-xs font-black text-background">
              <Camera className="size-3" aria-hidden="true" />
              {values.photos.length} imagini
            </Badge>
          </div>

          <div className="p-4">
            <h1 className="text-lg font-black leading-tight text-foreground">
              {values.title || "Apartament 2 camere, central, renovat"}
            </h1>
            <p className="mt-2 text-xl font-black text-primary">
              {formatDraftPrice(values)}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
              <MapPin className="size-4 text-primary" aria-hidden="true" />
              {values.city && values.county
                ? `${values.city}, ${values.county}`
                : "Oraș, județ"}
            </p>
            {values.locationLabel ? (
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                {values.locationLabel}
              </p>
            ) : null}
            {category ? (
              <Badge className="mt-2 rounded-md bg-brand-soft px-2 py-1 text-xs font-bold text-primary">
                {category.name}
              </Badge>
            ) : null}
            {values.subcategory ? (
              <Badge className="ml-2 mt-2 rounded-md bg-background px-2 py-1 text-xs font-bold text-muted-foreground">
                {values.subcategory}
              </Badge>
            ) : null}
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              Stare: {values.condition}
            </p>
            {attributeSnippets.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {attributeSnippets.map((snippet) => (
                  <Badge
                    key={snippet}
                    className="rounded-md bg-background px-2 py-1 text-xs font-bold text-muted-foreground"
                  >
                    {snippet}
                  </Badge>
                ))}
              </div>
            ) : null}
            <p className="mt-3 line-clamp-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
              {values.description ||
                "Apartament modern, renovat complet, situat în zona centrală."}
            </p>
            <button
              type="button"
              className="mt-3 text-xs font-black text-primary"
            >
              Mai mult
            </button>
          </div>
        </section>

        <aside className="rounded-lg border border-border bg-card p-4 shadow-soft-sm">
          <h3 className="text-base font-black text-foreground">
            Detalii anunț
          </h3>
          <dl className="mt-4 divide-y divide-border text-sm">
            <DetailRow label="Categorie" value={category?.name || "-"} />
            <DetailRow
              label="Tip anunț"
              value={values.type ? listingTypeLabels[values.type] : "-"}
            />
            <DetailRow label="Subcategorie" value={values.subcategory || "-"} />
            {subcategoryDetail ? (
              <DetailRow label="Detaliu" value={subcategoryDetail} />
            ) : null}
            <DetailRow label="Preț" value={formatDraftPrice(values)} />
            <DetailRow
              label="Localitate"
              value={
                values.city && values.county
                  ? `${values.city}, ${values.county}`
                  : "-"
              }
            />
            <DetailRow label="Adresă" value={values.locationLabel || "-"} />
            <DetailRow label="Stare" value={values.condition || "-"} />
            <div className="grid grid-cols-[7rem_1fr] gap-4 py-2.5">
              <dt className="text-xs font-bold text-muted-foreground">
                Descriere
              </dt>
              <dd className="max-h-16 overflow-hidden text-right text-xs leading-5 text-muted-foreground">
                {values.description ||
                  "Apartament modern, renovat complet, situat în zona centrală."}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-4 py-2.5">
      <dt className="text-xs font-bold text-muted-foreground">{label}</dt>
      <dd className="text-right text-xs font-semibold text-muted-foreground">
        {value}
      </dd>
    </div>
  );
}

function formatDraftPrice(values: CreateListingValues) {
  const cleanedPrice = values.price.trim();

  if (values.type === "swap" && !cleanedPrice) {
    return "Schimb";
  }

  if (values.type === "buy" && !cleanedPrice) {
    return "Buget de discutat";
  }

  if (!cleanedPrice) {
    return values.type === "rent" ? "Preț închiriere" : "Preț";
  }

  const parsedPrice = parseCreateListingPrice(cleanedPrice);
  const currency = values.currency === "RON" ? "RON" : "EUR";
  const amount = parsedPrice
    ? new Intl.NumberFormat("ro-RO").format(parsedPrice)
    : cleanedPrice;

  if (values.type === "buy") {
    return `Buget ${amount} ${currency}`;
  }

  return `${amount} ${currency}`;
}
