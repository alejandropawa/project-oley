import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  MapPin,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

import { ContactSellerButton } from "@/components/listings/contact-seller-button";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { ListingMapPreview } from "@/components/maps/listing-map-preview";
import { PromotedListingBadge } from "@/components/promotions/promoted-listing-badge";
import { ReportButton } from "@/components/reports/report-button";
import { SellerTrustSummary } from "@/components/trust/seller-trust-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAuthDrawerPath } from "@/lib/auth/redirect";
import {
  formatListingPrice,
  getListingCategory,
  listingTypeLabels,
} from "@/lib/listing-utils";
import type { Listing } from "@/lib/mock-data";
import type { SellerTrustSummary as SellerTrustSummaryType } from "@/lib/db/trust";

export function ListingDetail({
  listing,
  contact,
  sellerTrust,
}: {
  listing: Listing;
  contact?: {
    isAuthenticated: boolean;
    isOwner: boolean;
    canUseMessaging: boolean;
    canUseReporting?: boolean;
  };
  sellerTrust?: SellerTrustSummaryType | null;
}) {
  const category = getListingCategory(listing);
  const firstImage = listing.imageUrls?.[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-5">
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-border bg-muted shadow-soft"
          style={firstImage ? undefined : { background: listing.visualStyle }}
        >
          {firstImage ? (
            <Image
              src={firstImage}
              alt={`Fotografie principală pentru ${listing.title}`}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
              loading="eager"
            />
          ) : null}
          <Badge className="absolute left-4 top-4 rounded-full bg-card px-3 py-1 text-sm font-black text-primary shadow-soft-sm">
            {listingTypeLabels[listing.type]}
          </Badge>
          {listing.promotion ? (
            <div className="absolute right-4 top-4">
              <PromotedListingBadge type={listing.promotion.type} />
            </div>
          ) : null}
          {!firstImage ? (
            <>
              <div className="absolute inset-x-8 bottom-8 h-16 rounded-full bg-white/35 backdrop-blur-md" />
              <div className="absolute bottom-12 left-12 h-4 w-36 rounded-full bg-white/55" />
            </>
          ) : null}
        </div>

        {listing.imageUrls && listing.imageUrls.length > 1 ? (
          <div className="grid grid-cols-4 gap-3">
            {listing.imageUrls.slice(0, 4).map((imageUrl, index) => (
              <div
                key={imageUrl}
                className="relative aspect-square overflow-hidden rounded-[1rem] border border-border bg-muted shadow-soft-sm"
                aria-label={`Fotografia ${index + 1} pentru ${listing.title}`}
              >
                <Image
                  src={imageUrl}
                  alt={`Fotografia ${index + 1} pentru ${listing.title}`}
                  fill
                  sizes="(max-width: 640px) 25vw, 120px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : null}

        <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
          <h2 className="text-xl font-black text-foreground">Descriere</h2>
          <p className="mt-3 text-base leading-8 text-muted-foreground">
            {listing.description}
          </p>
        </article>

        <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
          <h2 className="text-xl font-black text-foreground">Locație</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {listing.locationLabel
              ? `${listing.locationLabel} · ${listing.city}, ${listing.county}`
              : `${listing.city}, ${listing.county}`}
          </p>
          <div className="mt-4">
            <ListingMapPreview listing={listing} />
          </div>
          <p className="mt-3 text-xs font-semibold text-muted-foreground">
            Locația este aproximativă pentru siguranța utilizatorilor.
          </p>
        </article>

        <aside className="rounded-[1.5rem] border border-brand-border bg-brand-soft p-5">
          <div className="flex gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-[1rem] bg-card text-primary">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-black text-foreground">Sfat de siguranță</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Verifică produsul înainte de plată, păstrează discuția în TROKO
                și evită transferurile urgente către persoane necunoscute.
              </p>
            </div>
          </div>
        </aside>
        <aside className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
          <h2 className="font-black text-foreground">Ajută-ne să păstrăm TROKO curat</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Dacă observi o problemă, trimite o raportare calmă și clară către
            echipa noastră.
          </p>
          <div className="mt-4">
            <ReportButton
              entityType="listing"
              entityId={listing.id}
              isAuthenticated={contact?.isAuthenticated ?? false}
              loginHref={getAuthDrawerPath("login", `/anunturi/${listing.slug}`)}
              buttonLabel="Raportează anunțul"
              disabledReason={
                contact?.isOwner
                  ? "Nu poți raporta propriul anunț."
                  : contact?.canUseReporting === false
                    ? "Raportarea va fi disponibilă după configurarea Supabase."
                    : undefined
              }
            />
          </div>
        </aside>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[1.75rem] border border-border bg-card p-5 shadow-soft-sm">
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full bg-muted px-3 py-1 text-sm font-bold text-primary">
              {category.name}
            </Badge>
            {listing.subcategory ? (
              <Badge className="rounded-full bg-background px-3 py-1 text-sm font-bold text-muted-foreground">
                {listing.subcategory}
              </Badge>
            ) : null}
            <Badge className="rounded-full bg-secondary px-3 py-1 text-sm font-bold text-secondary-foreground">
              {listing.condition}
            </Badge>
            {listing.isNegotiable ? (
              <Badge className="rounded-full bg-secondary px-3 py-1 text-sm font-bold text-warm-foreground">
                Negociabil
              </Badge>
            ) : null}
            {listing.status ? (
              <Badge className="rounded-full bg-background px-3 py-1 text-sm font-bold text-muted-foreground">
                Status: {listing.status}
              </Badge>
            ) : null}
            {listing.promotion ? (
              <PromotedListingBadge type={listing.promotion.type} />
            ) : null}
          </div>

          <h1 className="mt-5 text-3xl font-black leading-tight text-foreground sm:text-4xl">
            {listing.title}
          </h1>
          <p className="mt-4 text-3xl font-black text-primary">
            {formatListingPrice(listing)}
          </p>
          {listing.promotion ? (
            <p className="mt-3 rounded-[1rem] border border-brand-border bg-brand-soft p-3 text-sm font-semibold leading-6 text-muted-foreground">
              Anunț promovat. Acest anunț are vizibilitate crescută pe TROKO.
            </p>
          ) : null}

          <div className="mt-5 grid gap-3 text-sm font-semibold text-muted-foreground">
            <span className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" aria-hidden="true" />
              {listing.city}, {listing.county}
            </span>
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" aria-hidden="true" />
              Publicat pe{" "}
              {new Intl.DateTimeFormat("ro-RO", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(new Date(listing.createdAt))}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <ContactSellerButton
              listingId={listing.id}
              listingSlug={listing.slug}
              isAuthenticated={contact?.isAuthenticated ?? false}
              isOwner={contact?.isOwner ?? false}
              canUseMessaging={contact?.canUseMessaging ?? false}
              listingStatus={listing.status ?? "active"}
            />
            <FavoriteButton
              listingId={listing.id}
              isAuthenticated={contact?.isAuthenticated ?? false}
            />
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
          <div className="flex items-start gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-lg font-black text-primary-foreground">
              {listing.seller.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              {sellerTrust ? (
                <div className="mb-4">
                  <SellerTrustSummary
                    summary={sellerTrust}
                    fallbackName={listing.seller.name}
                  />
                </div>
              ) : null}
              {!sellerTrust ? (
                <>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-black text-foreground">
                  {listing.seller.name}
                </h2>
                {listing.seller.verified ? (
                  <Badge className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-primary">
                    <UserRoundCheck className="size-3" aria-hidden="true" />
                    verificat
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Din {listing.seller.city} · pe TROKO din {listing.seller.joinedAt}
              </p>
              <p className="mt-2 text-sm font-bold text-primary">
                Rating {listing.seller.rating}/5
              </p>
                </>
              ) : null}
              {listing.userId ? (
                <div className="mt-3">
                  <ReportButton
                    entityType="user"
                    entityId={listing.userId}
                    isAuthenticated={contact?.isAuthenticated ?? false}
                    loginHref={getAuthDrawerPath("login", `/anunturi/${listing.slug}`)}
                    buttonLabel="Raportează utilizatorul"
                    disabledReason={
                      contact?.isOwner
                        ? "Nu poți raporta propriul profil."
                        : contact?.canUseReporting === false
                          ? "Raportarea va fi disponibilă după configurarea Supabase."
                          : undefined
                    }
                    compact
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <Button
          asChild
          variant="ghost"
          className="h-11 rounded-full px-5 font-bold text-muted-foreground"
        >
          <Link href={`/categorii/${category.slug}`}>
            Vezi mai multe în {category.name}
          </Link>
        </Button>
      </aside>
    </div>
  );
}
