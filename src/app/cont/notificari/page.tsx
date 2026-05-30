import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { NotificationPreferencesForm } from "@/components/notifications/notification-preferences-form";
import { SitePageShell } from "@/components/site/page-shell";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getCurrentUser } from "@/lib/auth/user";
import { isSupabaseConfigured } from "@/lib/db/env";
import {
  defaultNotificationPreferences,
  ensureCurrentUserNotificationPreferences,
} from "@/lib/db/notification-preferences";
import { noIndexRobots } from "@/lib/seo/metadata";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    absolute: "Setări notificări — TROKO",
  },
  description: "Preferințele de notificare ale contului TROKO.",
  robots: noIndexRobots,
};

export default async function AccountNotificationSettingsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <NotificationSettingsFrame>
        <SetupState />
      </NotificationSettingsFrame>
    );
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/?auth=login&redirectTo=/cont/notificari");
  }

  const supabase = await createClient();
  const result = await ensureCurrentUserNotificationPreferences(supabase);
  const preferences = result.preferences ?? defaultNotificationPreferences(user.id);

  return (
    <NotificationSettingsFrame>
      <NotificationPreferencesForm preferences={preferences} />
    </NotificationSettingsFrame>
  );
}

function NotificationSettingsFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SitePageShell>
      <main className="relative isolate overflow-hidden">
        <section className="border-b border-border bg-background">
          <div className="mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
            <Breadcrumbs
              items={[
                { label: "Acasă", href: "/" },
                { label: "Contul meu", href: "/cont" },
                { label: "Setări notificări" },
              ]}
            />
            <h1 className="mt-8 text-3xl font-semibold text-foreground sm:text-4xl min-[1800px]:text-5xl">
              Setări notificări
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Alege ce notificări primești în aplicație și prin email. Emailul
              este trimis doar când providerul este configurat.
            </p>
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
        Preferințele de notificare vor fi disponibile după configurarea Supabase.
      </h2>
      <p className="mt-2 text-sm leading-6 text-warm-foreground">
        Aplică migrarea de notificări pentru a salva preferințele reale ale
        contului.
      </p>
    </div>
  );
}
