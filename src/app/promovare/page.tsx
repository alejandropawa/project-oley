import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, Sparkles, Zap } from "lucide-react";

import { PromotionPackagesGrid } from "@/components/promotions/promotion-packages-grid";
import { SitePageShell } from "@/components/site/page-shell";
import { Button } from "@/components/ui/button";
import { getActivePromotionPackages } from "@/lib/db/promotions";
import { createPublicMetadata } from "@/lib/seo/metadata";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = createPublicMetadata({
  title: "Promovare anunțuri — TROKO",
  description:
    "Promovează anunțurile tale pe TROKO și crește vizibilitatea în rezultatele de căutare.",
  path: "/promovare",
});

export default async function PromotionsPage() {
  const supabase = await createClient();
  const packages = await getActivePromotionPackages(supabase);

  return (
    <SitePageShell>
      <main className="relative isolate overflow-hidden">
        <section className="border-b border-border bg-background">
          <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-10">
            <div>
              <p className="text-sm font-semibold uppercase text-primary">
                Monetizare TROKO
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl min-[1800px]:text-5xl">
                Promovează-ți anunțul pe TROKO
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Crește vizibilitatea anunțurilor tale cu boost-uri simple și
                clare. Pachetele pregătesc fluxul de monetizare fără plăți
                reale în această versiune.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-12 rounded-full bg-primary px-6 font-semibold text-primary-foreground"
                >
                  <Link href="/cont/anunturi">
                    Vezi anunțurile mele
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-full border-border bg-card px-6 font-semibold"
                >
                  <Link href="/publica">Publică anunț</Link>
                </Button>
              </div>
            </div>

            <aside className="rounded-[1.75rem] border border-brand-border bg-brand-soft p-5 shadow-soft">
              <div className="grid gap-4">
                {[
                  {
                    icon: Zap,
                    title: "Boost rapid",
                    copy: "Anunțul primește poziționare mai bună în paginile relevante.",
                  },
                  {
                    icon: Sparkles,
                    title: "Badge Promovat",
                    copy: "Pachetele featured afișează un badge premium, fără să aglomereze cardurile.",
                  },
                  {
                    icon: BadgeCheck,
                    title: "Activare manuală",
                    copy: "Momentan, cererile sunt analizate și activate manual de echipa TROKO.",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.title} className="flex gap-3">
                      <span className="grid size-11 shrink-0 place-items-center rounded-[1rem] bg-card text-primary">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h2 className="font-semibold text-foreground">
                          {item.title}
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {item.copy}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="mx-auto grid w-full max-w-[1440px] gap-6 px-5 sm:px-8 lg:px-10">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase text-primary">
                Pachete disponibile
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-foreground">
                Alege vizibilitatea potrivită
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Plățile online vor fi disponibile în curând. În această
                versiune, poți trimite o solicitare de promovare, iar echipa
                TROKO o poate activa manual.
              </p>
            </div>
            <PromotionPackagesGrid packages={packages.packages} />
          </div>
        </section>
      </main>
    </SitePageShell>
  );
}
