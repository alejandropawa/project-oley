import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PromotedListingBadge } from "@/components/promotions/promoted-listing-badge";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/user";
import { getUserListings } from "@/lib/db/listings";
import { getActivePromotionsForListings } from "@/lib/db/promotions";
import { formatListingPrice } from "@/lib/listing-utils";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    absolute: "Anunțurile mele — TROKO",
  },
  description: "Gestionează anunțurile publicate pe TROKO.",
};

export default async function AccountListingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/?auth=login&redirectTo=/cont/anunturi");
  }

  const supabase = await createClient();
  const listings = await getUserListings(user.id, supabase);
  const activePromotions = await getActivePromotionsForListings(
    listings.map((listing) => listing.id),
    supabase,
  );

  return (
    <AccountSubpageFrame
      title="Anunțurile mele"
      description="Primele instrumente de management pentru anunțurile publicate."
    >
      {listings.length > 0 ? (
        <div className="grid gap-3">
          {listings.map((listing) => {
            const promotion = activePromotions.promotions.get(listing.id);
            const isActive = (listing.status ?? "active") === "active";

            return (
              <article
                key={listing.id}
                className="grid gap-4 rounded-[1.25rem] border border-border bg-card p-4 shadow-soft-sm transition hover:border-primary/40 sm:grid-cols-[1fr_auto]"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-black text-foreground">
                      {listing.title}
                    </h2>
                    {promotion ? (
                      <PromotedListingBadge type={promotion.type} />
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">
                    {listing.city}, {listing.county} · status{" "}
                    {listing.status ?? "active"} · {formatListingPrice(listing)}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 rounded-full border-border bg-background px-4 text-sm font-bold"
                  >
                    <Link href={`/anunturi/${listing.slug}`}>Vezi</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 rounded-full border-border bg-background px-4 text-sm font-bold"
                  >
                    <Link href={`/cont/anunturi/${listing.id}/editeaza`}>
                      Editează
                    </Link>
                  </Button>
                  {promotion ? (
                    <Button
                      asChild
                      variant="outline"
                      className="h-10 rounded-full border-border bg-background px-4 text-sm font-bold"
                    >
                      <Link href="/cont/promovari">Vezi promovări</Link>
                    </Button>
                  ) : isActive ? (
                    <Button
                      asChild
                      className="h-10 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground"
                    >
                      <Link href={`/cont/anunturi/${listing.id}/promoveaza`}>
                        Promovează
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-border bg-card p-8 text-center shadow-soft-sm">
          <h2 className="text-2xl font-black text-foreground">
            Nu ai anunțuri publicate încă
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            După ce publici un anunț, îl vei putea urmări de aici.
          </p>
          <Button
            asChild
            className="mt-6 h-11 rounded-full bg-primary px-5 font-bold text-primary-foreground"
          >
            <Link href="/publica">Publică anunț</Link>
          </Button>
        </div>
      )}
    </AccountSubpageFrame>
  );
}

function AccountSubpageFrame({
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
                { label: title },
              ]}
            />
            <h1 className="mt-8 text-3xl font-black text-foreground sm:text-4xl min-[1800px]:text-5xl">
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
