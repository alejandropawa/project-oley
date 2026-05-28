import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import {
  SiteContent,
  SiteMain,
  SitePageShell,
} from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: {
    absolute: "Actualizează parola — TROKO",
  },
  description: "Setează o parolă nouă pentru contul TROKO.",
};

export default function UpdatePasswordPage() {
  return (
    <SitePageShell>
      <SiteMain>
        <SiteContent className="py-10 sm:py-14">
          <AuthCard
            title="Actualizează parola"
            subtitle="Alege o parolă nouă pentru contul tău TROKO."
          >
            <UpdatePasswordForm />
          </AuthCard>
        </SiteContent>
      </SiteMain>
    </SitePageShell>
  );
}
