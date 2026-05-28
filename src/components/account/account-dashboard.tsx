import Link from "next/link";
import {
  Bell,
  Heart,
  Megaphone,
  MessageCircle,
  Search,
  ShieldCheck,
  Star,
  Store,
  UserRound,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

import { AccountSummaryCard } from "@/components/account/account-summary-card";
import { ProfileForm } from "@/components/account/profile-form";
import { Badge } from "@/components/ui/badge";
import { getDisplayName } from "@/lib/auth/user";
import { formatListingPrice } from "@/lib/listing-utils";
import type { Listing } from "@/lib/mock-data";
import type { Tables } from "@/types/database";

const dashboardCards = [
  {
    title: "Profil public",
    description: "Editeaza bio-ul, locatia publica si pagina ta de vanzator.",
    icon: UserRound,
    href: "/cont/profil",
  },
  {
    title: "Incredere",
    description:
      "Completeaza profilul, verifica telefonul si urmareste review-urile.",
    icon: ShieldCheck,
    href: "/cont/incredere",
  },
  {
    title: "Review-uri",
    description: "Vezi ratingul primit si review-urile scrise dupa interactiuni.",
    icon: Star,
    href: "/cont/review-uri",
  },
  {
    title: "Promovări",
    description: "Urmărești solicitările și campaniile active pentru anunțuri.",
    icon: Megaphone,
    href: "/cont/promovari",
  },
  {
    title: "Favorite",
    description: "Produsele salvate vor fi sincronizate cu contul tău.",
    icon: Heart,
    href: "/cont/favorite",
  },
  {
    title: "Căutări salvate",
    description: "Primești mai târziu notificări pentru căutările importante.",
    icon: Search,
    href: "/cont/cautari-salvate",
  },
  {
    title: "Mesaje",
    description: "Discută cu vânzători și cumpărători în siguranță.",
    icon: MessageCircle,
    href: "/mesaje",
  },
  {
    title: "Siguranță cont",
    description: "Setări pentru parolă, sesiuni și verificări viitoare.",
    icon: ShieldCheck,
    href: "/cont",
  },
  {
    title: "Notificări",
    description: "Vezi noutățile despre anunțuri, mesaje și promovări.",
    icon: Bell,
    href: "/notificari",
  },
];

export function AccountDashboard({
  user,
  profile,
  privateSettings,
  profileSource,
  userListings,
  unreadNotificationCount = 0,
}: {
  user: User;
  profile: Tables<"profiles"> | null;
  privateSettings: Tables<"profile_private_settings"> | null;
  profileSource: "supabase" | "unavailable";
  userListings: Listing[];
  unreadNotificationCount?: number;
}) {
  const displayName = profile?.display_name || getDisplayName(user);
  const activeCount = userListings.filter(
    (listing) => listing.status === "active" || !listing.status,
  ).length;
  const inactiveCount = Math.max(userListings.length - activeCount, 0);
  const latestListings = userListings.slice(0, 3);

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr] lg:items-start">
      <aside className="grid gap-5 lg:sticky lg:top-24">
        <AccountSummaryCard
          name={displayName}
          email={user.email ?? "email indisponibil"}
        />
        <ProfileForm
          initialProfile={profile}
          initialPrivateSettings={privateSettings}
          initialDisplayName={displayName}
          isProfileUnavailable={profileSource === "unavailable"}
        />
      </aside>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm sm:col-span-2">
          <span className="grid size-11 place-items-center rounded-[1rem] bg-muted text-primary">
            <Store className="size-5" aria-hidden="true" />
          </span>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-foreground">
                Anunțurile mele
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Anunțuri încărcate din Supabase pentru contul autentificat.
              </p>
            </div>
            <div className="flex gap-2">
              <Badge className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-primary">
                {activeCount} active
              </Badge>
              <Badge className="rounded-full bg-background px-3 py-1 text-xs font-bold text-muted-foreground">
                {inactiveCount} draft/arhivate/vândute
              </Badge>
            </div>
          </div>

          {latestListings.length > 0 ? (
            <div className="mt-5 grid gap-3">
              {latestListings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/anunturi/${listing.slug}`}
                  className="flex items-center justify-between gap-4 rounded-[1rem] border border-border bg-background p-3 transition hover:border-primary/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-foreground">
                      {listing.title}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">
                      {listing.city}, {listing.county}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-black text-primary">
                    {formatListingPrice(listing)}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-[1rem] border border-dashed border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
              Nu ai anunțuri publicate încă. Când publici primul anunț, cele
              mai noi apar aici.
            </div>
          )}
        </article>

        {dashboardCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-soft"
            >
              <span className="grid size-11 place-items-center rounded-[1rem] bg-muted text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-black text-foreground">
                {card.title}
              </h2>
              {card.title === "Notificări" && unreadNotificationCount > 0 ? (
                <span className="mt-2 inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-black text-warm-foreground">
                  {unreadNotificationCount} necitite
                </span>
              ) : null}
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {card.description}
              </p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
