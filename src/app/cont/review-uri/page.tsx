import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ReviewList } from "@/components/reviews/review-list";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getCurrentUser } from "@/lib/auth/user";
import { getCurrentUserReviewOverview } from "@/lib/db/reviews";
import { noIndexRobots } from "@/lib/seo/metadata";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    absolute: "Review-urile mele — TROKO",
  },
  description: "Review-uri primite si scrise pe TROKO.",
  robots: noIndexRobots,
};

export default async function AccountReviewsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/?auth=login&redirectTo=/cont/review-uri");
  }

  const supabase = await createClient();
  const overview = await getCurrentUserReviewOverview(supabase);

  return (
    <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">
      <Header />
      <main className="bg-background">
        <section className="border-b border-border bg-background">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <Breadcrumbs
              items={[
                { label: "Acasa", href: "/" },
                { label: "Cont", href: "/cont" },
                { label: "Review-uri" },
              ]}
            />
            <div className="mt-8 max-w-3xl">
              <p className="text-sm font-bold uppercase text-primary">
                Reputatie
              </p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-foreground sm:text-4xl min-[1800px]:text-5xl">
                Review-urile mele
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Vezi review-urile primite si cele scrise dupa interactiuni reale
                pe TROKO.
              </p>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
              <h2 className="text-xl font-black text-foreground">
                Primite
              </h2>
              <div className="mt-5">
                <ReviewList
                  reviews={overview.received}
                  emptyText="Nu ai primit review-uri inca."
                  showStatus
                />
              </div>
            </article>
            <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
              <h2 className="text-xl font-black text-foreground">Scrise</h2>
              <div className="mt-5">
                <ReviewList
                  reviews={overview.written}
                  emptyText="Nu ai scris review-uri inca."
                  showStatus
                />
              </div>
            </article>
          </div>
        </section>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
