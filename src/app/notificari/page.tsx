import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MarkAllReadButton } from "@/components/notifications/mark-all-read-button";
import { NotificationEmptyState } from "@/components/notifications/notification-empty-state";
import { NotificationList } from "@/components/notifications/notification-list";
import { SitePageShell } from "@/components/site/page-shell";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/user";
import { isSupabaseConfigured } from "@/lib/db/env";
import { getCurrentUserNotifications } from "@/lib/db/notifications";
import { noIndexRobots } from "@/lib/seo/metadata";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    absolute: "Notificări — TROKO",
  },
  description: "Notificările contului TROKO.",
  robots: noIndexRobots,
};

type NotificationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const params = await searchParams;
  const unreadOnly = first(params.tab) === "necitite";

  if (!isSupabaseConfigured()) {
    return (
      <NotificationsFrame>
        <SetupState />
      </NotificationsFrame>
    );
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/?auth=login&redirectTo=/notificari");
  }

  const supabase = await createClient();
  const result = await getCurrentUserNotifications(
    { limit: 80, unreadOnly },
    supabase,
  );

  return (
    <NotificationsFrame>
      <div className="grid gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <nav
            aria-label="Filtre notificări"
            className="flex gap-2 rounded-full border border-border bg-card p-1 shadow-soft-sm"
          >
            <Link
              href="/notificari"
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                !unreadOnly
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Toate
            </Link>
            <Link
              href="/notificari?tab=necitite"
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                unreadOnly
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Necitite
            </Link>
          </nav>
          <MarkAllReadButton disabled={result.notifications.length === 0} />
        </div>

        {result.source === "unavailable" ? (
          <SetupState />
        ) : result.notifications.length > 0 ? (
          <NotificationList notifications={result.notifications} />
        ) : (
          <NotificationEmptyState
            title={
              unreadOnly
                ? "Nu ai notificări necitite"
                : "Nu ai notificări încă"
            }
          />
        )}
      </div>
    </NotificationsFrame>
  );
}

function NotificationsFrame({ children }: { children: React.ReactNode }) {
  return (
    <SitePageShell>
      <main className="relative isolate overflow-hidden">
        <section className="border-b border-border bg-background">
          <div className="mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
            <Breadcrumbs
              items={[{ label: "Acasă", href: "/" }, { label: "Notificări" }]}
            />
            <h1 className="mt-8 text-3xl font-semibold text-foreground sm:text-4xl min-[1800px]:text-5xl">
              Notificări
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Mesaje importante despre anunțuri, conversații, promovări și
              siguranța contului.
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-5 h-11 rounded-full border-border bg-card px-5 font-semibold"
            >
              <Link href="/cont/notificari">Setări notificări</Link>
            </Button>
          </div>
        </section>
        <section className="py-8 sm:py-12">
          <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10">
            {children}
          </div>
        </section>
      </main>
    </SitePageShell>
  );
}

function SetupState() {
  return (
    <div className="rounded-[1.75rem] border border-warm/45 bg-secondary p-6 shadow-soft-sm">
      <h2 className="text-2xl font-semibold text-foreground">
        Notificările vor fi disponibile după configurarea Supabase.
      </h2>
      <p className="mt-2 text-sm leading-6 text-warm-foreground">
        Aplică migrarea de notificări și autentifică-te pentru a vedea
        notificările reale ale contului.
      </p>
    </div>
  );
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
