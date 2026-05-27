import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { EmptyInboxState } from "@/components/inbox/empty-inbox-state";
import { InboxLayout } from "@/components/inbox/inbox-layout";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getCurrentUser } from "@/lib/auth/user";
import { isSupabaseConfigured } from "@/lib/db/env";
import { getInboxSummary } from "@/lib/db/inbox";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    absolute: "Mesaje — TROKO",
  },
  description: "Inbox TROKO pentru conversațiile despre anunțuri.",
};

export default async function InboxPage() {
  const configured = isSupabaseConfigured();

  if (!configured) {
    return (
      <InboxPageFrame>
        <EmptyInboxState
          title="Mesageria va fi disponibilă după configurarea Supabase."
          description="Aplică migrarea pentru conversații și adaugă variabilele publice Supabase pentru a activa inboxul."
          showCta={false}
        />
      </InboxPageFrame>
    );
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/mesaje");
  }

  const supabase = await createClient();
  const inbox = await getInboxSummary(user.id, supabase);

  if (inbox.source === "unavailable") {
    return (
      <InboxPageFrame>
        <EmptyInboxState
          title="Mesageria va fi disponibilă după configurarea Supabase."
          description="Nu am putut încărca tabelele de conversații. Aplică migrarea nouă în Supabase și reîncearcă."
          showCta={false}
        />
      </InboxPageFrame>
    );
  }

  if (inbox.conversations.length === 0) {
    return (
      <InboxPageFrame>
        <EmptyInboxState />
      </InboxPageFrame>
    );
  }

  return (
    <InboxPageFrame>
      <InboxLayout conversations={inbox.conversations}>
        <div className="hidden rounded-[1.75rem] border border-border bg-card p-8 text-center shadow-soft-sm lg:block">
          <h2 className="text-2xl font-black text-foreground">
            Alege o conversație
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Deschide un mesaj din listă pentru a continua discuția în siguranță.
          </p>
        </div>
      </InboxLayout>
    </InboxPageFrame>
  );
}

function InboxPageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">
      <Header />
      <main className="bg-background">
        <section className="border-b border-border bg-background">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <Breadcrumbs
              items={[{ label: "Acasă", href: "/" }, { label: "Mesaje" }]}
            />
            <div className="mt-8 max-w-3xl">
              <p className="text-sm font-bold uppercase text-primary">
                Inbox TROKO
              </p>
              <h1 className="mt-2 text-4xl font-black leading-tight text-foreground sm:text-5xl">
                Mesaje
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Discuții private despre anunțuri, păstrate simplu și ușor de
                urmărit.
              </p>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </section>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
