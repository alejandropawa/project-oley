import { Heart, MapPin, MessageCircle, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getListingAttributeSnippets } from "@/lib/categories/attribute-definitions";
import { listingTypeLabels } from "@/lib/listing-utils";
import { categories } from "@/lib/mock-data";
import type { CreateListingValues } from "@/lib/create-listing-validation";

const contactLabels = {
  chat: "Răspunde prin Chat TROKO",
  phone: "Răspunde prin telefon",
  "chat-phone": "Răspunde prin Chat TROKO sau telefon",
};

export function ListingPreviewStep({ values }: { values: CreateListingValues }) {
  const category = categories.find((item) => item.slug === values.categorySlug);
  const firstPhoto = values.photos[0];
  const attributeSnippets = getListingAttributeSnippets(
    values.categorySlug,
    values.attributes,
  );

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-black text-foreground">
          Verifică preview-ul
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Așa va arăta anunțul pentru ceilalți utilizatori. Poți reveni oricând
          la pașii anteriori.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[1.75rem] border border-border bg-card p-3 shadow-soft-sm">
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-[1.35rem] bg-muted"
            style={
              firstPhoto
                ? {
                    backgroundImage: `url(${firstPhoto.url})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }
                : {
                    background:
                      "linear-gradient(135deg, #E8F1EE 0%, #FFF2CF 52%, #E9B44C 100%)",
                  }
            }
          >
            <Badge className="absolute left-3 top-3 rounded-full bg-card px-3 py-1 text-xs font-black text-primary shadow-soft-sm">
              {values.type ? listingTypeLabels[values.type] : "Tip anunț"}
            </Badge>
            {!firstPhoto ? (
              <div className="absolute inset-x-6 bottom-6 h-12 rounded-full bg-white/35 backdrop-blur-md" />
            ) : null}
          </div>

          <div className="p-3">
            <div className="flex flex-wrap gap-2">
              {category ? (
                <Badge className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-primary">
                  {category.name}
                </Badge>
              ) : null}
              {values.subcategory ? (
                <Badge className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                  {values.subcategory}
                </Badge>
              ) : null}
              <Badge className="rounded-full bg-background px-3 py-1 text-xs font-bold text-muted-foreground">
                {values.condition}
              </Badge>
              {values.negotiable ? (
                <Badge className="rounded-full bg-[#FFF2CF] px-3 py-1 text-xs font-bold text-[#7A5718]">
                  Negociabil
                </Badge>
              ) : null}
            </div>

            <h1 className="mt-4 text-3xl font-black leading-tight text-foreground">
              {values.title || "Titlul anunțului tău"}
            </h1>
            <p className="mt-3 text-2xl font-black text-primary">
              {formatDraftPrice(values)}
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
              <MapPin className="size-4 text-primary" aria-hidden="true" />
              {values.city && values.county
                ? `${values.city}, ${values.county}`
                : "Oraș, județ"}
            </p>
            {values.locationLabel ? (
              <p className="mt-1 text-sm font-semibold text-primary">
                {values.locationLabel}
              </p>
            ) : null}
            {attributeSnippets.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {attributeSnippets.map((snippet) => (
                  <Badge
                    key={snippet}
                    className="rounded-full bg-background px-3 py-1 text-xs font-bold text-muted-foreground"
                  >
                    {snippet}
                  </Badge>
                ))}
              </div>
            ) : null}
            <p className="mt-5 whitespace-pre-line text-base leading-7 text-muted-foreground">
              {values.description || "Descrierea anunțului va apărea aici."}
            </p>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
            <h3 className="text-lg font-black text-foreground">
              Profilul tău
            </h3>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full bg-primary text-lg font-black text-primary-foreground">
                T
              </span>
              <div>
                <p className="font-black text-foreground">Cont nou TROKO</p>
                <p className="text-sm text-muted-foreground">
                  {contactLabels[values.contactPreference]}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[#D5E4DF] bg-[#E8F1EE] p-5">
            <div className="flex gap-3">
              <ShieldCheck
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <p className="text-sm leading-6 text-muted-foreground">
                Verifică datele înainte de publicare. După salvare, anunțul va
                fi legat de contul tău TROKO.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button className="h-11 rounded-full bg-primary font-bold text-primary-foreground">
              <MessageCircle className="size-4" aria-hidden="true" />
              Mesaj
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-full border-border bg-background font-bold"
            >
              <Heart className="size-4" aria-hidden="true" />
              Salvează
            </Button>
          </div>
        </aside>
      </div>
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

  const amount = new Intl.NumberFormat("ro-RO").format(Number(cleanedPrice));
  const currency = values.currency === "RON" ? "RON" : "EUR";

  if (values.type === "buy") {
    return `Buget ${amount} ${currency}`;
  }

  return `${amount} ${currency}`;
}
