import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";

export const metadata: Metadata = {
  title: {
    absolute: "Actualizează parola — TROKO",
  },
  description: "Setează o parolă nouă pentru contul TROKO.",
};

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">
      <Header />
      <main className="bg-background px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <AuthCard
          title="Actualizează parola"
          subtitle="Alege o parolă nouă pentru contul tău TROKO."
        >
          <UpdatePasswordForm />
        </AuthCard>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
