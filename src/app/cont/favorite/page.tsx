import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SitePageShell } from "@/components/site/page-shell";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/user";
import { getFavoriteListingIds } from "@/lib/db/favorites";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    absolute: "Favorite — TROKO",
  },
  description: "Anunțurile salvate în contul TROKO.",
};

export default async function AccountFavoritesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/?auth=login&redirectTo=/cont/favorite");
  }

  const supabase = await createClient();
  const favoriteIds = await getFavoriteListingIds(supabase);

  return (
    <AccountSimpleFrame
      title="Favorite"
      description="Anunțurile salvate vor apărea aici pe măsură ce conectăm butoanele de favorite."
    >
      <p className="text-sm font-semibold text-muted-foreground">
        Ai {favoriteIds.length} favorite salvate.
      </p>
      <Button
        asChild
        className="mt-5 h-11 rounded-full bg-primary px-5 font-bold text-primary-foreground"
      >
        <Link href="/anunturi">Explorează anunțuri</Link>
      </Button>
    </AccountSimpleFrame>
  );
}

function AccountSimpleFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
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
                { label: title },
              ]}
            />
            <h1 className="mt-8 text-3xl font-black text-foreground sm:text-4xl min-[1800px]:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              {description}
            </p>
          </div>
        </section>
        <section className="py-8 sm:py-12">
          <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10">
            <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-soft-sm">
              {children}
            </div>
          </div>
        </section>
      </main>
    </SitePageShell>
  );
}
