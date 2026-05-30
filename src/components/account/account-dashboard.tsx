import Image from "next/image";
import Link from "next/link";
import {
  BadgePercent,
  Bell,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileText,
  Heart,
  HelpCircle,
  Home,
  Lightbulb,
  MessageCircle,
  MoreVertical,
  Settings,
  Shield,
  TrendingUp,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { User } from "@supabase/supabase-js";

import { AccountSignOutButton } from "@/components/account/account-sign-out-button";
import styles from "@/components/account/account-dashboard.module.css";
import { getDisplayName, getInitials } from "@/lib/auth/user";
import { formatListingPrice } from "@/lib/listing-utils";
import { cn } from "@/lib/utils";
import type { Listing } from "@/lib/mock-data";
import type { Tables } from "@/types/database";

type AccountNavItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
  badge?: number;
  disabled?: boolean;
};

const accountNavItems: AccountNavItem[] = [
  { label: "Sumar", href: "/cont", icon: Home },
  { label: "Anunțurile mele", href: "/cont/anunturi", icon: FileText },
  { label: "Mesaje", href: "/mesaje", icon: MessageCircle },
  { label: "Favorite", href: "/cont/favorite", icon: Heart },
  { label: "Notificări", href: "/cont/notificari", icon: Bell },
  { label: "Date personale", href: "/cont/profil", icon: UserRound },
  { label: "Securitate", href: "/cont/incredere", icon: Shield },
  { label: "Promovări și pachete", href: "/cont/promovari", icon: BadgePercent },
  { label: "Setări", icon: Settings, disabled: true },
  { label: "Ajutor", icon: HelpCircle, disabled: true },
];

const successTips = [
  {
    title: "Adaugă imagini de calitate",
    description: "Fotografiile luminoase cresc încrederea cumpărătorilor.",
  },
  {
    title: "Scrie un titlu clar și relevant",
    description: "Include produsul, modelul sau zona încă din titlu.",
  },
  {
    title: "Completează toate detaliile",
    description: "Anunțurile complete sunt mai ușor de filtrat și comparat.",
  },
  {
    title: "Răspunde rapid la mesaje",
    description: "Un răspuns prompt crește șansa de finalizare.",
  },
];

const quickActions = [
  { label: "Editează datele personale", href: "/cont/profil", icon: UserRound },
  { label: "Gestionează securitatea", href: "/cont/incredere", icon: Shield },
  { label: "Setări de notificări", href: "/cont/notificari", icon: Bell },
  { label: "Centrul de ajutor", icon: HelpCircle, disabled: true },
  {
    label: "Promovări și pachete",
    href: "/cont/promovari",
    icon: BadgePercent,
  },
] satisfies AccountNavItem[];

export function AccountDashboard({
  user,
  profile,
  profileSource,
  userListings,
  unreadNotificationCount = 0,
  unreadConversationCount = 0,
  favoriteCount = 0,
}: {
  user: User;
  profile: Tables<"profiles"> | null;
  profileSource: "supabase" | "unavailable";
  userListings: Listing[];
  unreadNotificationCount?: number;
  unreadConversationCount?: number;
  favoriteCount?: number;
}) {
  const displayName = profile?.display_name || getDisplayName(user);
  const email = user.email ?? "email indisponibil";
  const activeCount = userListings.filter(isActiveListing).length;
  const latestListings = userListings.slice(0, 4);
  const totalViews = userListings.reduce(
    (total, listing) =>
      total + getListingMetric(listing, ["views", "view_count", "views_total"]),
    0,
  );
  const navItems = accountNavItems.map((item) => {
    if (item.label === "Mesaje") {
      return { ...item, badge: unreadConversationCount };
    }

    if (item.label === "Notificări") {
      return { ...item, badge: unreadNotificationCount };
    }

    return item;
  });

  return (
    <div className={styles.dashboardGrid}>
      <aside className={styles.sidebar}>
        <AccountSidebar
          name={displayName}
          email={email}
          navItems={navItems}
        />
      </aside>

      <section className={cn(styles.mainColumn, "grid gap-5")}>
        <WelcomeCard name={displayName} />

        <section
          aria-label="Indicatori cont"
          className={styles.statsGrid}
        >
          <StatCard
            icon={FileText}
            value={activeCount}
            label="Anunțuri active"
            href="/cont/anunturi"
            action="Vezi toate"
          />
          <StatCard
            icon={Heart}
            value={favoriteCount}
            label="Favorite"
            href="/cont/favorite"
            action="Deschide"
          />
          <StatCard
            icon={MessageCircle}
            value={unreadConversationCount}
            label="Mesaje"
            href="/mesaje"
            action="Deschide"
          />
          <StatCard
            icon={Eye}
            value={totalViews}
            label="Vizualizări totale"
            href="/cont/anunturi"
            action="Vezi statistici"
          />
        </section>

        <MyListingsCard listings={latestListings} />

        <PromotionCard />
      </section>

      <aside className={cn(styles.rightRail, "grid gap-5")}>
        <SuccessTipsCard />
        <SecurityCard
          isProfileUnavailable={profileSource === "unavailable"}
          city={profile?.city ?? null}
        />
        <QuickActionsCard actions={quickActions} />
        <BusinessTeaserCard />
      </aside>
    </div>
  );
}

function AccountSidebar({
  name,
  email,
  navItems,
}: {
  name: string;
  email: string;
  navItems: AccountNavItem[];
}) {
  return (
    <section
      className={cn(
        styles.sidebarCard,
        "rounded-[1.25rem] border border-[#E4E8E1] bg-white p-4 shadow-[0_4px_12px_rgba(7,22,19,0.04)]",
      )}
    >
      <div className="flex items-center gap-3 border-b border-[#E4E8E1] pb-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#0B4A3E] text-base font-semibold text-white">
          {getInitials(name, email)}
        </span>
        <div className="min-w-0">
          <h2 className="text-[20px] font-semibold leading-7 text-[#132F2A]">
            Contul meu
          </h2>
          <p className="truncate text-[13px] font-medium leading-5 text-[#65736F]">
            {email}
          </p>
        </div>
      </div>

      <nav
        aria-label="Navigare cont"
        className={styles.sidebarNav}
      >
        {navItems.map((item) => (
          <AccountNavLink key={item.label} item={item} />
        ))}
        <AccountSignOutButton className={styles.signOutButton} />
      </nav>
    </section>
  );
}

function AccountNavLink({ item }: { item: AccountNavItem }) {
  const Icon = item.icon;
  const baseClassName =
    "group flex min-h-11 shrink-0 items-center gap-2.5 rounded-[0.875rem] border px-3 text-[14px] font-medium leading-5 outline-none transition focus-visible:ring-3 focus-visible:ring-[#0B4A3E]/20";
  const isActive = item.href === "/cont";

  if (item.disabled || !item.href) {
    return (
      <span
        aria-disabled="true"
        title="TODO: rută dedicată viitoare"
        className={cn(
          styles.navItem,
          baseClassName,
          "cursor-not-allowed border-transparent bg-[#FAFBF7]/72 text-[#8A9691]",
        )}
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <span className="whitespace-nowrap">{item.label}</span>
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        styles.navItem,
        baseClassName,
        isActive
          ? "border-[#CBD7CE] bg-[#E7F0EA] text-[#0B4A3E] shadow-[inset_0_0_0_1px_rgba(11,74,62,0.04)]"
          : "border-transparent bg-white text-[#102A27] hover:border-[#CBD7CE] hover:bg-[#FAFBF7]",
      )}
    >
      <Icon className="size-4 shrink-0 text-[#0B4A3E]" aria-hidden="true" />
      <span className="whitespace-nowrap">{item.label}</span>
      {item.badge ? (
        <span className="ml-auto rounded-full bg-[#0B4A3E] px-2 py-0.5 text-[11px] font-semibold leading-4 text-white">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

function WelcomeCard({ name }: { name: string }) {
  return (
    <section className="overflow-hidden rounded-[1.25rem] border border-[#E4E8E1] bg-white shadow-[0_4px_12px_rgba(7,22,19,0.04)]">
      <div className={cn(styles.welcomeInner, "p-5 sm:p-6 lg:p-7")}>
        <div className="max-w-2xl">
          <h1 className="text-[24px] font-semibold leading-8 text-[#132F2A] sm:text-[27px] sm:leading-9">
            {name ? `Bun venit, ${name}!` : "Bun venit!"}
          </h1>
          <p className="mt-2 text-[15px] font-normal leading-6 text-[#65736F]">
            Gestionează-ți contul și activitatea pe Troko.
          </p>
        </div>
        <HeroIllustration />
      </div>
    </section>
  );
}

function HeroIllustration() {
  return (
    <div
      aria-hidden="true"
      className={cn(
        styles.heroIllustration,
        "relative h-24 overflow-hidden rounded-[1rem] bg-[#F4F8F5]",
      )}
    >
      <div className="absolute inset-x-0 bottom-0 h-10 bg-[#DDE9E2]" />
      <div className="absolute bottom-5 left-1/2 h-12 w-20 -translate-x-1/2 rounded-t-[1.2rem] bg-white shadow-[0_8px_24px_rgba(7,22,19,0.08)]" />
      <div className="absolute bottom-12 left-1/2 h-9 w-9 -translate-x-1/2 rotate-45 rounded-[0.35rem] bg-[#C4D8CD]" />
      <div className="absolute bottom-6 left-[calc(50%-3rem)] h-9 w-3 rounded-full bg-[#B4CDBE]" />
      <div className="absolute bottom-6 right-[calc(50%-3rem)] h-9 w-3 rounded-full bg-[#B4CDBE]" />
      <div className="absolute bottom-7 left-1/2 h-5 w-4 -translate-x-1/2 rounded-t-full bg-[#DDE9E2]" />
      <div className="absolute bottom-8 left-[calc(50%-1.65rem)] size-3 rounded-[0.2rem] bg-[#E7F0EA]" />
      <div className="absolute bottom-8 right-[calc(50%-1.65rem)] size-3 rounded-[0.2rem] bg-[#E7F0EA]" />
      <div className="absolute bottom-2 left-6 h-12 w-5 rounded-full bg-[#B8D0C1]" />
      <div className="absolute bottom-2 right-6 h-16 w-6 rounded-full bg-[#C7D9CE]" />
      <div className="absolute bottom-0 left-8 h-5 w-1 rounded-full bg-[#8FAE9C]" />
      <div className="absolute bottom-0 right-9 h-6 w-1 rounded-full bg-[#8FAE9C]" />
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  href,
  action,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
  href: string;
  action: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[8.25rem] flex-col rounded-[1.125rem] border border-[#E4E8E1] bg-white p-4 shadow-[0_4px_12px_rgba(7,22,19,0.04)] outline-none transition hover:border-[#CBD7CE] hover:shadow-[0_12px_32px_rgba(7,22,19,0.08)] focus-visible:ring-3 focus-visible:ring-[#0B4A3E]/20"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-[0.875rem] bg-[#E7F0EA] text-[#0B4A3E]">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[24px] font-semibold leading-8 text-[#132F2A]">
            {formatNumber(value)}
          </p>
          <p className="mt-0.5 text-[13px] font-medium leading-5 text-[#65736F]">
            {label}
          </p>
        </div>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[13px] font-semibold leading-5 text-[#0B4A3E]">
        {action}
        <ChevronRight
          className="size-4 transition group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}

function MyListingsCard({ listings }: { listings: Listing[] }) {
  return (
    <section className="overflow-hidden rounded-[1.25rem] border border-[#E4E8E1] bg-white shadow-[0_4px_12px_rgba(7,22,19,0.04)]">
      <div className="flex flex-col gap-3 border-b border-[#E4E8E1] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h2 className="text-[20px] font-semibold leading-7 text-[#132F2A]">
            Anunțurile mele
          </h2>
          <p className="mt-1 text-[13px] font-normal leading-5 text-[#65736F]">
            Ultimele anunțuri publicate în contul tău.
          </p>
        </div>
        <Link
          href="/cont/anunturi"
          className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-[0.875rem] border border-[#D9E1DA] bg-white px-4 text-[14px] font-semibold text-[#0B4A3E] outline-none transition hover:border-[#CBD7CE] hover:bg-[#FAFBF7] focus-visible:ring-3 focus-visible:ring-[#0B4A3E]/20"
        >
          Vezi toate anunțurile
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      {listings.length > 0 ? (
        <div className="divide-y divide-[#E4E8E1]">
          {listings.map((listing) => (
            <ListingRow key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="m-4 rounded-[1.125rem] border border-dashed border-[#CBD7CE] bg-[#FAFBF7] p-5">
          <p className="text-[15px] font-semibold leading-6 text-[#102A27]">
            Nu ai anunțuri publicate încă.
          </p>
          <p className="mt-1 text-[14px] font-normal leading-6 text-[#65736F]">
            Când publici primul anunț, îl vei putea urmări rapid de aici.
          </p>
          <Link
            href="/publica"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-[0.875rem] bg-[#0B4A3E] px-4 text-[14px] font-semibold text-white outline-none transition hover:bg-[#083B32] focus-visible:ring-3 focus-visible:ring-[#0B4A3E]/20"
          >
            Publică un anunț
          </Link>
        </div>
      )}
    </section>
  );
}

function ListingRow({ listing }: { listing: Listing }) {
  const firstImage = listing.imageUrls?.[0];
  const status = getListingStatus(listing.status);
  const views = getListingMetric(listing, ["views", "view_count", "views_total"]);
  const messages = getListingMetric(listing, ["messages", "message_count"]);

  return (
    <article
      className={cn(
        styles.listingRow,
        "bg-white p-4 transition hover:bg-[#FAFBF7] sm:p-5",
      )}
    >
      <Link
        href={`/anunturi/${listing.slug}`}
        className={cn(styles.listingLink, "group")}
      >
        <div
          className="relative size-20 overflow-hidden rounded-[0.75rem] bg-[#E7F0EA] sm:size-[4.75rem] sm:aspect-[4/3]"
          style={firstImage ? undefined : { background: listing.visualStyle }}
        >
          {firstImage ? (
            <Image
              src={firstImage}
              alt={`Fotografie pentru ${listing.title}`}
              fill
              sizes="(max-width: 640px) 100vw, 76px"
              className="object-cover"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-[#0B4A3E]">
              <FileText className="size-6" aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="min-w-0 text-[15px] font-semibold leading-5 text-[#102A27] group-hover:text-[#0B4A3E]">
              {listing.title}
            </h3>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium leading-5 text-[#65736F]">
            <span className="font-semibold text-[#102A27]">
              {formatListingPrice(listing)}
            </span>
            <span aria-hidden="true">•</span>
            <span
              className={cn(
                "inline-flex rounded-full border px-2 py-0.5 text-[12px] font-semibold leading-4",
                status.className,
              )}
            >
              {status.label}
            </span>
            <span aria-hidden="true">•</span>
            <span>{formatDate(listing.createdAt)}</span>
          </div>
        </div>

      </Link>

      <MetricCell value={views} label="vizualizări" />
      <MetricCell value={messages} label="mesaje" />

      <button
        type="button"
        aria-label={`Deschide meniul pentru ${listing.title}`}
        className="grid size-10 place-items-center rounded-full border border-[#D9E1DA] bg-white text-[#65736F] outline-none transition hover:border-[#CBD7CE] hover:text-[#0B4A3E] focus-visible:ring-3 focus-visible:ring-[#0B4A3E]/20 sm:justify-self-end"
      >
        <MoreVertical className="size-4" aria-hidden="true" />
      </button>
    </article>
  );
}

function MetricCell({ value, label }: { value: number; label: string }) {
  return (
    <div className={styles.metricCell}>
      <p className="text-[14px] font-semibold leading-5 text-[#102A27]">
        {formatNumber(value)}
      </p>
      <p className="mt-0.5 text-[12px] font-medium leading-4 text-[#65736F]">
        {label}
      </p>
    </div>
  );
}

function PromotionCard() {
  return (
    <section className="rounded-[1.25rem] border border-[#E4E8E1] bg-[#FFFCF5] p-5 shadow-[0_4px_12px_rgba(7,22,19,0.04)] sm:p-6">
      <div className={styles.promoInner}>
        <div className="flex max-w-2xl gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-[0.875rem] bg-[#EAF4ED] text-[#0B4A3E]">
            <Shield className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-[18px] font-semibold leading-7 text-[#132F2A]">
              Vrei mai multă vizibilitate?
            </h2>
            <p className="mt-1 text-[14px] font-normal leading-6 text-[#65736F]">
              Promovează-ți anunțurile și ajungi mai rapid la cumpărători
              interesați.
            </p>
          </div>
          {/* Future: individual listing promotions can support 7, 14, and 30 day durations. */}
        </div>
        <Link
          href="/cont/promovari"
          className={cn(
            styles.promoButton,
            "inline-flex h-11 min-w-[12rem] items-center justify-center whitespace-nowrap rounded-[0.875rem] bg-[#0B4A3E] px-5 text-[14px] font-semibold text-white outline-none transition hover:bg-[#083B32] focus-visible:ring-3 focus-visible:ring-[#0B4A3E]/20",
          )}
        >
          Promovează un anunț
        </Link>
      </div>
    </section>
  );
}

function SuccessTipsCard() {
  return (
    <RailCard
      title="Sfaturi pentru succes"
      actionHref="/publica"
      actionLabel="Vezi ghidul complet"
      icon={Lightbulb}
    >
      <div className="grid gap-4">
        {successTips.map((tip) => (
          <div key={tip.title} className="flex gap-3">
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-[#E7F0EA] text-[#0B4A3E] shadow-[inset_0_0_0_1px_rgba(11,74,62,0.05)]">
              <CheckCircle2 className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-[14px] font-semibold leading-5 text-[#102A27]">
                {tip.title}
              </h3>
              <p className="mt-1 text-[13px] font-normal leading-5 text-[#65736F]">
                {tip.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </RailCard>
  );
}

function SecurityCard({
  isProfileUnavailable,
  city,
}: {
  isProfileUnavailable: boolean;
  city: string | null;
}) {
  return (
    <RailCard title="Securitatea contului" icon={Shield}>
      <div>
        <p className="text-[15px] font-semibold leading-6 text-[#102A27]">
          Contul tău este securizat.
        </p>
        <p className="mt-1 text-[13px] font-normal leading-5 text-[#65736F]">
          {isProfileUnavailable
            ? "Verifică setările de securitate ale contului tău."
            : city
              ? `Profil asociat cu ${city}. Verifică periodic setările de securitate.`
              : "Verifică setările de securitate ale contului tău."}
        </p>
        <Link
          href="/cont/incredere"
          className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-[0.875rem] border border-[#D9E1DA] bg-white px-4 text-[14px] font-semibold text-[#102A27] outline-none transition hover:border-[#CBD7CE] hover:bg-[#FAFBF7] focus-visible:ring-3 focus-visible:ring-[#0B4A3E]/20"
        >
          Gestionează securitatea
        </Link>
      </div>
    </RailCard>
  );
}

function QuickActionsCard({ actions }: { actions: AccountNavItem[] }) {
  return (
    <RailCard title="Acțiuni rapide">
      <div className="grid gap-1">
        {actions.map((action) => {
          const Icon = action.icon;
          const className =
            "flex min-h-11 items-center gap-2.5 rounded-[0.875rem] px-2.5 text-[14px] font-medium leading-5 outline-none transition focus-visible:ring-3 focus-visible:ring-[#0B4A3E]/20";

          if (action.disabled || !action.href) {
            return (
              <span
                key={action.label}
                aria-disabled="true"
                title="TODO: rută dedicată viitoare"
                className={cn(className, "cursor-not-allowed text-[#8A9691]")}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 flex-1">{action.label}</span>
                <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
              </span>
            );
          }

          return (
            <Link
              key={action.label}
              href={action.href}
              className={cn(className, "text-[#102A27] hover:bg-[#FAFBF7]")}
            >
              <Icon className="size-4 shrink-0 text-[#0B4A3E]" aria-hidden="true" />
              <span className="min-w-0 flex-1">{action.label}</span>
              <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </RailCard>
  );
}

function BusinessTeaserCard() {
  return (
    <section className="rounded-[1.25rem] border border-[#E4E8E1] bg-white p-5 shadow-[0_4px_12px_rgba(7,22,19,0.04)]">
      <span className="grid size-10 place-items-center rounded-[0.875rem] bg-[#E7F0EA] text-[#0B4A3E]">
        <TrendingUp className="size-5" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-[20px] font-semibold leading-7 text-[#132F2A]">
        Ai mai multe anunțuri?
      </h2>
      <p className="mt-2 text-[14px] font-normal leading-6 text-[#65736F]">
        Explorează pachetele pentru business-uri și agenții.
      </p>
      {/* Future: accountType can support particular / business / real_estate_agency. */}
      {/* Future product logic: new users start as particular; business packages should live in a separate flow. */}
      <Link
        href="/cont/promovari"
        className="mt-4 inline-flex h-10 items-center justify-center rounded-[0.875rem] border border-[#D9E1DA] bg-white px-4 text-[14px] font-semibold text-[#102A27] outline-none transition hover:border-[#CBD7CE] hover:bg-[#FAFBF7] focus-visible:ring-3 focus-visible:ring-[#0B4A3E]/20"
      >
        Vezi pachetele
      </Link>
    </section>
  );
}

function RailCard({
  title,
  children,
  actionHref,
  actionLabel,
  icon: Icon,
}: {
  title: string;
  children: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
  icon?: LucideIcon;
}) {
  return (
    <section className="rounded-[1.25rem] border border-[#E4E8E1] bg-white p-5 shadow-[0_4px_12px_rgba(7,22,19,0.04)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {Icon ? (
            <span className="grid size-9 shrink-0 place-items-center rounded-[0.75rem] bg-[#E7F0EA] text-[#0B4A3E]">
              <Icon className="size-5" aria-hidden="true" />
            </span>
          ) : null}
          <h2 className="text-[18px] font-semibold leading-7 text-[#132F2A]">
            {title}
          </h2>
        </div>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="shrink-0 text-[13px] font-semibold leading-5 text-[#0B4A3E] outline-none hover:text-[#083B32] focus-visible:ring-3 focus-visible:ring-[#0B4A3E]/20"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function isActiveListing(listing: Listing) {
  return listing.status === "active" || !listing.status;
}

function getListingStatus(status: string | undefined) {
  if (!status || status === "active") {
    return {
      label: "Activ",
      className: "border-[#CBD7CE] bg-[#EAF4ED] text-[#0B4A3E]",
    };
  }

  if (["expired", "archived", "sold", "rejected"].includes(status)) {
    return {
      label: "Expirat",
      className: "border-[#F1C7C2] bg-[#FDECEC] text-[#B42318]",
    };
  }

  return {
    label: "În așteptare",
    className: "border-[#F5D99B] bg-[#FFF7E6] text-[#7A4F00]",
  };
}

function getListingMetric(listing: Listing, keys: string[]) {
  for (const key of keys) {
    const value = listing.attributes?.[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return 0;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ro-RO").format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
