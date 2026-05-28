import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/user";
import { getSavedSearches } from "@/lib/db/saved-searches";
import { formatSavedSearchSummary } from "@/lib/search/filters";
import { buildSearchHref, parseSearchParams } from "@/lib/search/url";
import { createClient } from "@/lib/supabase/server";
import type { SearchListingsParams } from "@/lib/search/types";

export const metadata: Metadata = {
  title: {
    absolute: "Căutări salvate — TROKO",
  },
  description: "Căutările salvate în contul TROKO.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountSavedSearchesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/?auth=login&redirectTo=/cont/cautari-salvate");
  }

  const supabase = await createClient();
  const savedSearches = await getSavedSearches(supabase);

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
                { label: "Căutări salvate" },
              ]}
            />
            <h1 className="mt-8 text-3xl font-black text-foreground sm:text-4xl min-[1800px]:text-5xl">
              Căutări salvate
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Salvează filtre avansate și revino rapid la anunțurile care te
              interesează.
            </p>
          </div>
        </section>
        <section className="py-8 sm:py-12">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-soft-sm">
              <p className="text-sm font-semibold text-muted-foreground">
                Ai {savedSearches.length} căutări salvate.
              </p>

              {savedSearches.length > 0 ? (
                <div className="mt-5 grid gap-3">
                  {savedSearches.map((savedSearch) => {
                    const filters = normalizeSavedFilters(savedSearch.filters);

                    return (
                      <article
                        key={savedSearch.id}
                        className="rounded-[1.25rem] border border-border bg-background p-4"
                      >
                        <h2 className="font-black text-foreground">
                          {savedSearch.name}
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {formatSavedSearchSummary(filters)}
                        </p>
                        <Button
                          asChild
                          variant="outline"
                          className="mt-3 h-10 rounded-full border-border bg-card px-4 text-sm font-bold"
                        >
                          <Link href={buildSearchHref(filters)}>
                            Deschide căutarea
                          </Link>
                        </Button>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Când salvezi o căutare din pagina de anunțuri, filtrele vor fi
                  păstrate aici.
                </p>
              )}

              <Button
                asChild
                className="mt-5 h-11 rounded-full bg-primary px-5 font-bold text-primary-foreground"
              >
                <Link href="/anunturi">Caută anunțuri</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

function normalizeSavedFilters(filters: unknown): SearchListingsParams {
  if (filters && typeof filters === "object" && "sort" in filters) {
    return filters as SearchListingsParams;
  }

  return parseSearchParams({});
}
