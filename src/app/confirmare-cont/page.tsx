import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";

import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: {
    absolute: "Confirmare cont — TROKO",
  },
  description: "Statusul activării contului TROKO.",
};

export default async function AccountConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawStatus = Array.isArray(params.status) ? params.status[0] : params.status;
  const isSuccess = rawStatus === "success";

  return (
    <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">
      <Header />
      <main className="bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <section className="mx-auto w-full max-w-xl rounded-[1.75rem] border border-border bg-card p-6 text-center shadow-soft sm:p-8">
          <div
            className="mx-auto grid size-14 place-items-center rounded-full bg-brand-soft text-brand"
            aria-hidden="true"
          >
            {isSuccess ? (
              <CheckCircle2 className="size-7" />
            ) : (
              <XCircle className="size-7 text-destructive" />
            )}
          </div>

          <p className="mt-5 text-sm font-bold uppercase text-primary">
            Confirmare cont
          </p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-foreground sm:text-4xl">
            {isSuccess
              ? "Contul a fost activat cu succes."
              : "Activarea contului nu a reușit."}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground">
            {isSuccess
              ? "Poți reveni pe pagina principală și te poți autentifica în contul tău TROKO."
              : "Linkul poate fi expirat sau deja folosit. Revino pe pagina principală și încearcă autentificarea sau creează contul din nou."}
          </p>

          <Button
            asChild
            className="mt-7 h-12 rounded-full bg-action px-6 font-bold text-action-foreground hover:bg-action-hover"
          >
            <Link href="/?auth=login">Mergi la homepage și intră în cont</Link>
          </Button>
        </section>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
