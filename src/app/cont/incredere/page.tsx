import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ReviewList } from "@/components/reviews/review-list";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { TrustBadges } from "@/components/trust/trust-badges";
import { TrustChecklist } from "@/components/trust/trust-checklist";
import { TrustScoreCard } from "@/components/trust/trust-score-card";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getCurrentUser } from "@/lib/auth/user";
import { getCurrentProfile } from "@/lib/db/profiles";
import { getReviewsForUser } from "@/lib/db/reviews";
import { getTrustBadgesForUser, getActiveListingCount, syncCurrentUserTrustProfile } from "@/lib/db/trust";
import { getCurrentUserVerificationStatus } from "@/lib/db/verification";
import { getTrustChecklist } from "@/lib/trust/profile-completion";
import { verificationStatusLabels } from "@/lib/trust/labels";
import { noIndexRobots } from "@/lib/seo/metadata";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    absolute: "Incredere — TROKO",
  },
  description: "Centrul de incredere pentru profilul TROKO.",
  robots: noIndexRobots,
};

export default async function TrustCenterPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/?auth=login&redirectTo=/cont/incredere");
  }

  const supabase = await createClient();
  await syncCurrentUserTrustProfile(user, supabase);
  const [profileResult, badgesResult, verificationResult, activeListingsCount] =
    await Promise.all([
      getCurrentProfile(supabase),
      getTrustBadgesForUser(user.id, supabase),
      getCurrentUserVerificationStatus(supabase),
      getActiveListingCount(user.id, supabase),
    ]);
  const reviews = profileResult.profile
    ? await getReviewsForUser(profileResult.profile.id, supabase)
    : { reviews: [], source: "unavailable" as const };
  const checklist = getTrustChecklist({
    profile: profileResult.profile,
    activeListingsCount,
  });

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
                { label: "Incredere" },
              ]}
            />
            <div className="mt-8 max-w-3xl">
              <p className="text-sm font-bold uppercase text-primary">
                Semnale de incredere
              </p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-foreground sm:text-4xl min-[1800px]:text-5xl">
                Centrul de incredere
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Urmareste verificarile, badge-urile si review-urile care fac
                profilul tau mai clar pentru comunitate.
              </p>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8">
            <aside className="grid gap-5 lg:sticky lg:top-24 lg:self-start">
              <TrustScoreCard score={profileResult.profile?.trust_score ?? 0} />
              <TrustChecklist items={checklist} />
            </aside>
            <div className="grid gap-5">
              <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-xl font-black text-foreground">
                      Badge-uri
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Badge-urile sunt semnale, nu garantii absolute.
                    </p>
                  </div>
                  {profileResult.profile?.slug ? (
                    <Button asChild variant="outline" className="h-10 rounded-full font-bold">
                      <Link href={`/profil/${profileResult.profile.slug}`}>
                        Vezi profilul public
                      </Link>
                    </Button>
                  ) : null}
                </div>
                <div className="mt-5">
                  <TrustBadges badges={badgesResult.badges} />
                </div>
              </article>

              <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
                <h2 className="text-xl font-black text-foreground">
                  Verificari
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Verificarea telefonului este momentan manuala. Echipa TROKO va
                  valida cererea inainte sa apara badge-ul.
                </p>
                <div className="mt-4 grid gap-3">
                  {verificationResult.requests.length > 0 ? (
                    verificationResult.requests.map((request) => (
                      <div
                        key={request.id}
                        className="rounded-[1rem] border border-border bg-background p-3"
                      >
                        <p className="text-sm font-black text-foreground">
                          {request.type === "phone"
                            ? "Telefon"
                            : "Verificare vanzator"}
                        </p>
                        <p className="mt-1 text-xs font-bold uppercase text-primary">
                          {verificationStatusLabels[request.status]}
                        </p>
                        {request.admin_note ? (
                          <p className="mt-2 text-sm text-muted-foreground">
                            Nota TROKO: {request.admin_note}
                          </p>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1rem] border border-dashed border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
                      Nu ai cereri de verificare in analiza.
                    </div>
                  )}
                </div>
                <Button asChild className="mt-4 h-11 rounded-full bg-action px-5 font-bold text-action-foreground hover:bg-action-hover">
                  <Link href="/cont/profil">Editează profilul</Link>
                </Button>
              </article>

              <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
                <h2 className="text-xl font-black text-foreground">
                  Review-uri primite
                </h2>
                <div className="mt-5">
                  <ReviewList
                    reviews={reviews.reviews}
                    emptyText="Nu ai primit review-uri inca."
                  />
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
