import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { EditListingAttributesForm } from "@/components/listings/edit-listing-attributes-form";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/user";
import { getUserListingById } from "@/lib/db/listings";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    absolute: "Editează anunțul — TROKO",
  },
  description: "Editează detaliile avansate ale anunțului TROKO.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, user] = await Promise.all([params, getCurrentUser()]);

  if (!user) {
    redirect(`/login?redirectTo=/cont/anunturi/${id}/editeaza`);
  }

  const supabase = await createClient();
  const listing = await getUserListingById(id, user.id, supabase);

  if (!listing) {
    notFound();
  }

  return (
    <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">
      <Header />
      <main className="bg-background">
        <section className="border-b border-border bg-background">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <Breadcrumbs
              items={[
                { label: "Acasă", href: "/" },
                { label: "Contul meu", href: "/cont" },
                { label: "Anunțurile mele", href: "/cont/anunturi" },
                { label: "Editează" },
              ]}
            />
            <h1 className="mt-8 text-4xl font-black text-foreground sm:text-5xl">
              Editează detaliile
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Prima versiune de editare acoperă atributele avansate folosite în
              filtre. Titlul, descrierea și media rămân pentru etapa următoare.
            </p>
          </div>
        </section>
        <section className="py-8 sm:py-12">
          <div className="mx-auto grid w-full max-w-4xl gap-5 px-4 sm:px-6 lg:px-8">
            <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
              <h2 className="text-xl font-black text-foreground">
                {listing.title}
              </h2>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">
                {listing.city}, {listing.county}
              </p>
              <Button
                asChild
                variant="outline"
                className="mt-4 h-10 rounded-full border-border bg-background px-4 text-sm font-bold"
              >
                <Link href={`/anunturi/${listing.slug}`}>Vezi anunțul</Link>
              </Button>
            </div>

            <EditListingAttributesForm listing={listing} />
          </div>
        </section>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
