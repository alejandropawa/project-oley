import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

export const metadata: Metadata = {
  title: {
    absolute: "Intră în cont — TROKO",
  },
  description:
    "Conectează-te pentru a salva anunțuri, publica mai rapid și discuta în siguranță.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawRedirectTo = Array.isArray(params.redirectTo)
    ? params.redirectTo[0]
    : params.redirectTo;
  const redirectTo = getSafeRedirectPath(rawRedirectTo);

  return (
    <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">
      <Header />
      <main className="bg-background px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <AuthCard
          title="Intră în cont"
          subtitle="Conectează-te pentru a salva anunțuri, publica mai rapid și discuta în siguranță."
        >
          <LoginForm redirectTo={redirectTo} />
        </AuthCard>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
