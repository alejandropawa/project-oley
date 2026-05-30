import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/account/profile-form";
import { SitePageShell } from "@/components/site/page-shell";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getCurrentUser, getDisplayName } from "@/lib/auth/user";
import { getCurrentProfile } from "@/lib/db/profiles";
import { syncCurrentUserTrustProfile } from "@/lib/db/trust";
import { noIndexRobots } from "@/lib/seo/metadata";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    absolute: "Profilul meu — TROKO",
  },
  description: "Editeaza profilul public TROKO.",
  robots: noIndexRobots,
};

export default async function AccountProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/?auth=login&redirectTo=/cont/profil");
  }

  const supabase = await createClient();
  await syncCurrentUserTrustProfile(user, supabase);
  const profileResult = await getCurrentProfile(supabase);

  return (
    <SitePageShell>
      <main className="relative isolate overflow-hidden">
        <section className="border-b border-border bg-background">
          <div className="mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
            <Breadcrumbs
              items={[
                { label: "Acasa", href: "/" },
                { label: "Cont", href: "/cont" },
                { label: "Profil" },
              ]}
            />
            <div className="mt-8 max-w-3xl">
              <p className="text-sm font-semibold uppercase text-primary">
                Profil public
              </p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight text-foreground sm:text-4xl min-[1800px]:text-5xl">
                Profilul meu
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Editeaza bio-ul, locatia publica si informatiile de contact.
                Emailul si telefonul nu sunt afisate public.
              </p>
              {profileResult.profile?.slug ? (
                <Button asChild variant="outline" className="mt-5 h-11 rounded-full font-semibold">
                  <Link href={`/profil/${profileResult.profile.slug}`}>
                    Vezi profilul public
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10">
            <ProfileForm
              initialProfile={profileResult.profile}
              initialPrivateSettings={profileResult.privateSettings}
              initialDisplayName={getDisplayName(user)}
              isProfileUnavailable={profileResult.source === "unavailable"}
            />
          </div>
        </section>
      </main>
    </SitePageShell>
  );
}
