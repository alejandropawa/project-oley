import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";

export const metadata: Metadata = {
  title: {
    absolute: "Resetează parola — TROKO",
  },
  description: "Primește instrucțiuni pentru resetarea parolei TROKO.",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen overflow-x-hidden pb-20 md:pb-0">
      <Header />
      <main className="bg-background px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <AuthCard
          title="Resetează parola"
          subtitle="Introdu emailul contului și îți trimitem instrucțiuni pentru resetare."
        >
          <ResetPasswordForm />
        </AuthCard>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
