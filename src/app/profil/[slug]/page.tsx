import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicProfileHeader } from "@/components/profiles/public-profile-header";
import { PublicProfileListings } from "@/components/profiles/public-profile-listings";
import { PublicProfileReviews } from "@/components/profiles/public-profile-reviews";
import { ReportButton } from "@/components/reports/report-button";
import { JsonLd } from "@/components/seo/json-ld";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getAuthDrawerPath } from "@/lib/auth/redirect";
import { getCurrentUser } from "@/lib/auth/user";
import { getPublicProfileBySlug } from "@/lib/db/public-profiles";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import {
  createPublicMetadata,
  indexRobots,
  noIndexRobots,
} from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site";
import { createClient } from "@/lib/supabase/server";

type PublicProfilePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const result = await getPublicProfileBySlug(slug, supabase);

  if (!result.publicProfile) {
    return createPublicMetadata({
      title: "Profil negasit — TROKO",
      description: "Profilul cautat nu este disponibil pe TROKO.",
      path: `/profil/${slug}`,
      robots: noIndexRobots,
    });
  }

  const profile = result.publicProfile.profile;
  const displayName = profile.display_name ?? "Utilizator TROKO";
  const hasPublicActivity =
    result.publicProfile.activeListingsCount > 0 || profile.reviews_count > 0;

  return createPublicMetadata({
    title: `${displayName} — Profil TROKO`,
    description: `Vezi anunturile si review-urile utilizatorului ${displayName} pe TROKO.`,
    path: `/profil/${slug}`,
    robots: hasPublicActivity ? indexRobots : noIndexRobots,
  });
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { slug } = await params;
  const [supabase, user] = await Promise.all([createClient(), getCurrentUser()]);
  const result = await getPublicProfileBySlug(slug, supabase);

  if (!result.publicProfile) {
    notFound();
  }

  const publicProfile = result.publicProfile;
  const displayName =
    publicProfile.profile.display_name ?? "Utilizator TROKO";
  const isOwnProfile = user?.id === publicProfile.profile.id;

  return (
    <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">
      <Header />
      <main className="bg-background">
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Acasa", url: absoluteUrl("/") },
            { name: displayName, url: absoluteUrl(`/profil/${slug}`) },
          ])}
        />
        <section className="border-b border-border bg-background">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <Breadcrumbs
              items={[{ label: "Acasa", href: "/" }, { label: displayName }]}
            />
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 sm:px-6 lg:px-8">
            <PublicProfileHeader publicProfile={publicProfile} />
            <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
              <div className="grid gap-5">
                <PublicProfileListings listings={publicProfile.listings} />
                <PublicProfileReviews reviews={publicProfile.reviews} />
              </div>
              <aside className="grid gap-5 lg:sticky lg:top-24">
                <div className="rounded-[1.5rem] border border-brand-border bg-brand-soft p-5">
                  <h2 className="font-black text-foreground">
                    Discutati in siguranta
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Verifica anuntul, pastreaza discutia in TROKO si nu trimite
                    avansuri fara sa verifici produsul sau vanzatorul.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
                  <h2 className="font-black text-foreground">
                    Raportare profil
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Daca observi comportament suspect, trimite o raportare clara.
                  </p>
                  <div className="mt-4">
                    <ReportButton
                      entityType="user"
                      entityId={publicProfile.profile.id}
                      isAuthenticated={Boolean(user)}
                      loginHref={getAuthDrawerPath("login", `/profil/${slug}`)}
                      buttonLabel="Raporteaza utilizatorul"
                      disabledReason={
                        isOwnProfile
                          ? "Nu poti raporta propriul profil."
                          : result.source === "unavailable"
                            ? "Raportarea va fi disponibila dupa configurarea Supabase."
                            : undefined
                      }
                    />
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
