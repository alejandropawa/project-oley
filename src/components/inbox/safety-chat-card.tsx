"use client";

import { ShieldAlert } from "lucide-react";

import { ReportButton } from "@/components/reports/report-button";
import { getAuthDrawerPath } from "@/lib/auth/redirect";

const safetyBullets = [
  "Nu trimite avansuri fără să verifici produsul sau vânzătorul.",
  "Evită linkurile externe trimise în conversație.",
  "TROKO nu îți va cere niciodată parola sau coduri de verificare.",
  "Raportează mesajele suspecte.",
];

export function SafetyChatCard({
  conversationId,
}: {
  conversationId: string;
}) {
  return (
    <aside className="rounded-[1.5rem] border border-brand-border bg-brand-soft p-5">
      <div className="flex gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-[1rem] bg-card text-primary">
          <ShieldAlert className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-semibold text-foreground">Discută în siguranță</h2>
          <ul className="mt-2 grid gap-1.5 text-sm leading-6 text-muted-foreground">
            {safetyBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="mt-4">
            <ReportButton
              entityType="conversation"
              entityId={conversationId}
              isAuthenticated
              loginHref={getAuthDrawerPath("login", `/mesaje/${conversationId}`)}
              buttonLabel="Raportează conversația"
              successMessage="Conversația a fost raportată."
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
