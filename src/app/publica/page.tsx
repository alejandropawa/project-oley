import type { Metadata } from "next";

import { CreateListingFlow } from "@/components/create-listing/create-listing-flow";
import { PublishListingDialogShell } from "@/components/create-listing/publish-listing-dialog-shell";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
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
    <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">
      <Header />
      <main className="bg-transparent">
        <section className="min-h-[calc(100svh-4rem)] px-5 py-8 text-center sm:px-7 lg:min-h-[calc(100svh-4.5rem)] lg:py-12">
          <div className="mx-auto flex min-h-[22rem] w-full max-w-3xl flex-col items-center justify-center">
            <p className="text-xs font-black uppercase tracking-normal text-primary sm:text-sm">
              Publicare TROKO
            </p>
            <h1 className="mt-3 text-balance font-serif text-[2.15rem] font-semibold leading-[1.05] text-brand sm:text-[2.75rem]">
              Pregătește anunțul într-un flow ghidat.
            </h1>
            <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-brand-muted">
              Editorul se deschide într-un panou dedicat ca să poți completa
              pașii fără distrageri.
            </p>
          </div>

          <PublishListingDialogShell>
            <CreateListingFlow
              isAuthenticated={isAuthenticated}
              isSupabaseReady={isSupabaseReady}
              surface="dialog"
            />
          </PublishListingDialogShell>
        </section>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
