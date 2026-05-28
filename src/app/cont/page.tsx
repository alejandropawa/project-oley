import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccountDashboard } from "@/components/account/account-dashboard";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getCurrentUser } from "@/lib/auth/user";
import { getUserListings } from "@/lib/db/listings";
import { getUnreadNotificationCount } from "@/lib/db/notifications";
import { getCurrentProfile } from "@/lib/db/profiles";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    absolute: "Contul meu — TROKO",
  },
  description:
    "Administrează profilul, anunțurile și preferințele contului TROKO.",
};

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/?auth=login&redirectTo=/cont");
  }

  const supabase = await createClient();
  const [profileResult, userListings, unreadNotifications] = await Promise.all([
    getCurrentProfile(supabase),
    getUserListings(user.id, supabase),
    getUnreadNotificationCount(supabase),
  ]);

  return (
    <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">
      <Header />
      <main className="bg-background">
        <section className="border-b border-border bg-background">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <Breadcrumbs
              items={[{ label: "Acasă", href: "/" }, { label: "Contul meu" }]}
            />
            <div className="mt-8 max-w-3xl">
              <p className="text-sm font-bold uppercase text-primary">
                Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-foreground sm:text-4xl min-[1800px]:text-5xl">
                Contul meu
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Gestionează profilul, preferințele și anunțurile publicate pe
                TROKO.
              </p>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <AccountDashboard
              user={user}
              profile={profileResult.profile}
              privateSettings={profileResult.privateSettings}
              profileSource={profileResult.source}
              userListings={userListings}
              unreadNotificationCount={unreadNotifications.count}
            />
          </div>
        </section>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
