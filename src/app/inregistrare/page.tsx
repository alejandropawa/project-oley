import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";

export const metadata: Metadata = {
  title: {
    absolute: "Creează cont — TROKO",
  },
  description:
    "Un cont îți permite să publici anunțuri, să salvezi favorite și să discuți cu vânzătorii.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">
      <Header />
      <main className="bg-background px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <AuthCard
          title="Creează cont TROKO"
          subtitle="Un cont îți permite să publici anunțuri, să salvezi favorite și să discuți cu vânzătorii."
        >
          <RegisterForm />
        </AuthCard>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
