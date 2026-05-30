import type { Metadata } from "next";

import { CreateListingFlow } from "@/components/create-listing/create-listing-flow";
import { SitePageShell } from "@/components/site/page-shell";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getCurrentUser } from "@/lib/auth/user";
import { isSupabaseConfigured } from "@/lib/db/env";

export const metadata: Metadata = {
  title: {
    absolute: "Publică anunț pe TROKO",
  },
  description:
    "Creează rapid un anunț pentru vânzare, cumpărare, închiriere sau schimb.",
};

export default async function PublishListingPage() {
  const user = await getCurrentUser();
  const isAuthenticated = Boolean(user);
  const isSupabaseReady = isSupabaseConfigured();

  return (
    <SitePageShell>
      <main className="relative isolate overflow-hidden">
        <section className="mx-auto w-full max-w-[1440px] px-5 pb-8 pt-8 sm:px-8 lg:px-10">
          <Breadcrumbs
            items={[{ label: "Acasă", href: "/" }, { label: "Publică anunț" }]}
          />

          <div className="mt-5 max-w-3xl">
            <h1 className="text-4xl font-semibold leading-tight text-brand sm:text-5xl">
              Publică anunț
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-brand-ink">
              Creează un anunț clar, complet și pregătit pentru publicare.
            </p>
          </div>

          <div className="mt-8">
            <CreateListingFlow
              isAuthenticated={isAuthenticated}
              isSupabaseReady={isSupabaseReady}
            />
          </div>
        </section>
      </main>
    </SitePageShell>
  );
}
