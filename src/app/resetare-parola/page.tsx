import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import {
  SiteContent,
  SiteMain,
  SitePageShell,
} from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: {
    absolute: "Resetează parola — TROKO",
  },
  description: "Primește instrucțiuni pentru resetarea parolei TROKO.",
};

export default function ResetPasswordPage() {
  return (
    <SitePageShell>
      <SiteMain>
        <SiteContent className="py-10 sm:py-14">
          <AuthCard
            title="Resetează parola"
            subtitle="Introdu emailul contului și îți trimitem instrucțiuni pentru resetare."
          >
            <ResetPasswordForm />
          </AuthCard>
        </SiteContent>
      </SiteMain>
    </SitePageShell>
  );
}
