import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { CreateListingFlow } from "@/components/create-listing/create-listing-flow";
import { SitePageShell } from "@/components/site/page-shell";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getCurrentUser } from "@/lib/auth/user";
import { isSupabaseConfigured } from "@/lib/db/env";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-guide-inter",
});

export const metadata: Metadata = {
  title: {
    absolute: "Publică anunț pe TROKO",
  },
  description:
    "Creează rapid un anunț pentru vânzare, cumpărare, închiriere sau schimb.",
};

type PublishListingSearchParams = Promise<{
  editor?: string | string[];
}>;

export default async function PublishListingPage({
  searchParams,
}: {
  searchParams: PublishListingSearchParams;
}) {
  const user = await getCurrentUser();
  const isAuthenticated = Boolean(user);
  const isSupabaseReady = isSupabaseConfigured();
  const params = await searchParams;
  const editorParam = Array.isArray(params.editor)
    ? params.editor[0]
    : params.editor;

  return (
    <SitePageShell>
      <main
        className={cn(
          inter.className,
          inter.variable,
          "relative isolate overflow-hidden",
        )}
        style={{
          WebkitFontSmoothing: "antialiased",
          textRendering: "optimizeLegibility",
        }}
      >
        <section className="mx-auto w-full max-w-[1440px] px-5 pb-8 pt-8 sm:px-8 lg:px-10">
          <Breadcrumbs
            items={[{ label: "Acasă", href: "/" }, { label: "Publică anunț" }]}
          />

          <div className="mt-5 max-w-3xl">
            <h1 className="font-serif text-4xl font-semibold leading-none text-brand sm:text-5xl min-[1800px]:text-6xl">
              Publică anunț
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-brand-ink">
              Creează un anunț clar, complet și pregătit pentru publicare.
            </p>
          </div>

          <div className="mt-8">
            <CreateListingFlow
              initialShowGuide={editorParam !== "1"}
              isAuthenticated={isAuthenticated}
              isSupabaseReady={isSupabaseReady}
            />
          </div>
        </section>
      </main>
    </SitePageShell>
  );
}
