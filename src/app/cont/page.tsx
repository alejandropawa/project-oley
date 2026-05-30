import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccountDashboard } from "@/components/account/account-dashboard";
import { SitePageShell } from "@/components/site/page-shell";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getCurrentUser } from "@/lib/auth/user";
import { getFavoriteListingIds } from "@/lib/db/favorites";
import { getUnreadConversationCount } from "@/lib/db/inbox";
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
  const [
    profileResult,
    userListings,
    unreadNotifications,
    favoriteIds,
    unreadConversations,
  ] = await Promise.all([
    getCurrentProfile(supabase),
    getUserListings(user.id, supabase),
    getUnreadNotificationCount(supabase),
    getFavoriteListingIds(supabase),
    getUnreadConversationCount(user.id, supabase),
  ]);

  return (
    <SitePageShell>
      <main className="relative isolate min-h-[calc(100svh-8rem)] overflow-hidden bg-[#FAF8F3]">
        <div className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10">
          <Breadcrumbs
            items={[{ label: "Acasă", href: "/" }, { label: "Contul meu" }]}
          />
          <AccountDashboard
            user={user}
            profile={profileResult.profile}
            profileSource={profileResult.source}
            userListings={userListings}
            unreadNotificationCount={unreadNotifications.count}
            unreadConversationCount={unreadConversations.count}
            favoriteCount={favoriteIds.length}
          />
        </div>
      </main>
    </SitePageShell>
  );
}
