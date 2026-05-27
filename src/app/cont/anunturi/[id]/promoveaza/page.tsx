import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { PromoteListingForm } from "@/components/promotions/promote-listing-form";
import { PromotedListingBadge } from "@/components/promotions/promoted-listing-badge";
import { ListingPromotionStatusBadge } from "@/components/promotions/promotion-status-badge";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/user";
import { isSupabaseConfigured } from "@/lib/db/env";
import { getUserListings } from "@/lib/db/listings";
import {
  getActivePromotionForListing,
  getActivePromotionPackages,
} from "@/lib/db/promotions";
import { formatListingPrice } from "@/lib/listing-utils";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    absolute: "Promovează anunțul — TROKO",
  },
  description: "Alege un pachet de promovare pentru anunțul tău TROKO.",
};

type PromoteListingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PromoteListingPage({
  params,
}: PromoteListingPageProps) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <PromoteFrame
        title="Promovează anunțul"
        description="Configurarea Supabase este necesară pentru solicitări reale."
      >
        <SetupState />
      </PromoteFrame>
    );
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirectTo=/cont/anunturi/${id}/promoveaza`);
  }

  const supabase = await createClient();
  const [userListings, packagesResult] = await Promise.all([
    getUserListings(user.id, supabase),
    getActivePromotionPackages(supabase),
  ]);
  const listing = userListings.find((item) => item.id === id);

  if (!listing) {
    notFound();
  }

  const promotionResult = await getActivePromotionForListing(listing.id, supabase);
  const activePromotion = promotionResult.promotion;
  const disabledReason =
    listing.status && listing.status !== "active"
      ? "Doar anunțurile active pot fi promovate."
      : undefined;

  return (
    <PromoteFrame
      title="Promovează anunțul"
      description="Alege un pachet, adaugă o notă opțională și trimite solicitarea pentru activare manuală."
    >
      <div className="grid gap-6">
        <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-soft-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-black text-primary">
                  Status: {listing.status ?? "active"}
                </span>
                {activePromotion ? (
                  <>
                    <PromotedListingBadge type={activePromotion.type} />
                    <ListingPromotionStatusBadge status={activePromotion.status} />
                  </>
                ) : null}
              </div>
              <h2 className="mt-3 text-2xl font-black text-foreground">
                {listing.title}
              </h2>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">
                {listing.city}, {listing.county} · {formatListingPrice(listing)}
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-full border-border bg-background px-5 font-bold"
            >
              <Link href={`/anunturi/${listing.slug}`}>Vezi anunț</Link>
            </Button>
          </div>
          {activePromotion ? (
            <p className="mt-4 rounded-[1rem] border border-[#D5E4DF] bg-[#E8F1EE] p-3 text-sm font-semibold leading-6 text-muted-foreground">
              Acest anunț are deja o promovare activă. Poți trimite o solicitare
              nouă pentru o campanie viitoare, iar echipa TROKO o va analiza
              manual.
            </p>
          ) : null}
          {disabledReason ? (
            <p className="mt-4 rounded-[1rem] border border-[#F3D88D] bg-[#FFF2CF] p-3 text-sm font-semibold leading-6 text-[#7A5718]">
              {disabledReason}
            </p>
          ) : null}
        </section>

        <section className="grid gap-4">
          <div>
            <p className="text-sm font-black uppercase text-primary">
              Pachete promovare
            </p>
            <h2 className="mt-1 text-2xl font-black text-foreground">
              Alege vizibilitatea dorită
            </h2>
          </div>
          <PromoteListingForm
            listingId={listing.id}
            packages={packagesResult.packages}
            disabledReason={disabledReason}
          />
        </section>
      </div>
    </PromoteFrame>
  );
}

function PromoteFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">
      <Header />
      <main className="bg-background">
        <section className="border-b border-border bg-background">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <Breadcrumbs
              items={[
                { label: "Acasă", href: "/" },
                { label: "Contul meu", href: "/cont" },
                { label: "Anunțurile mele", href: "/cont/anunturi" },
                { label: title },
              ]}
            />
            <h1 className="mt-8 text-4xl font-black text-foreground sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              {description}
            </p>
          </div>
        </section>
        <section className="py-8 sm:py-12">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </section>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

function SetupState() {
  return (
    <div className="rounded-[1.75rem] border border-[#F3D88D] bg-[#FFF2CF] p-6 shadow-soft-sm">
      <h2 className="text-2xl font-black text-foreground">
        Promovarea reală are nevoie de configurarea Supabase.
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#7A5718]">
        Aplică migrarea pentru promovări și autentifică-te pentru a trimite
        solicitări reale. Paginile publice rămân disponibile în modul demo.
      </p>
      <Button
        asChild
        className="mt-5 h-11 rounded-full bg-primary px-5 font-bold text-primary-foreground"
      >
        <Link href="/promovare">Vezi pachetele</Link>
      </Button>
    </div>
  );
}
