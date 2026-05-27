import type { Metadata } from "next";

import { CreateListingFlow } from "@/components/create-listing/create-listing-flow";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
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
    <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">
      <Header />
      <main className="bg-background">
        <section className="border-b border-border bg-background">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <Breadcrumbs
              items={[{ label: "Acasă", href: "/" }, { label: "Publică anunț" }]}
            />
            <div className="mt-8 max-w-3xl">
              <p className="text-sm font-bold uppercase text-primary">
                Publicare anunț
              </p>
              <h1 className="mt-2 text-4xl font-black leading-tight text-foreground sm:text-5xl">
                Creează un anunț clar în câteva minute
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Alege tipul anunțului, completează detaliile, adaugă fotografii
                local și verifică preview-ul înainte de publicare.
              </p>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            {!isAuthenticated ? (
              <div className="mb-5 rounded-[1.5rem] border border-[#D5E4DF] bg-[#E8F1EE] p-4 text-sm font-semibold leading-6 text-muted-foreground shadow-soft-sm">
                <span className="font-black text-foreground">
                  Poți pregăti anunțul acum.
                </span>{" "}
                Pentru publicare finală, va trebui să intri în cont.
              </div>
            ) : null}

            {!isSupabaseReady ? (
              <div className="mb-5 rounded-[1.5rem] border border-[#F3D88D] bg-[#FFF2CF] p-4 text-sm font-semibold leading-6 text-[#7A5718] shadow-soft-sm">
                Publicarea reală are nevoie de configurarea Supabase. Poți
                continua să pregătești anunțul și să verifici preview-ul.
              </div>
            ) : null}

            <CreateListingFlow
              isAuthenticated={isAuthenticated}
              isSupabaseReady={isSupabaseReady}
            />
          </div>
        </section>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
