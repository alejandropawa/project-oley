import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  Archive,
  FileWarning,
  ListChecks,
  MessagesSquare,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminSetupState } from "@/components/admin/admin-setup-state";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { isCurrentUserAdmin, getAdminStats } from "@/lib/db/admin";
import { isSupabaseConfigured } from "@/lib/db/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    absolute: "Admin — TROKO",
  },
  description: "Dashboard administrare și moderare TROKO.",
};

const quickLinks = [
  { label: "Rapoarte", href: "/admin/rapoarte" },
  { label: "Anunțuri", href: "/admin/anunturi" },
  { label: "Promovări", href: "/admin/promovari" },
  { label: "Încredere", href: "/admin/incredere" },
  { label: "Utilizatori", href: "/admin/utilizatori" },
  { label: "Setări", href: "/admin/setari" },
];

export default async function AdminPage() {
  if (!isSupabaseConfigured()) {
    return (
      <AdminLayout
        title="Admin"
        description="Moderare, rapoarte și operațiuni interne TROKO."
      >
        <AdminSetupState />
      </AdminLayout>
    );
  }

  const supabase = await createClient();
  const admin = await isCurrentUserAdmin(supabase);

  if (!admin.user) {
    redirect("/?auth=login&redirectTo=/admin");
  }

  if (admin.source === "unavailable") {
    return (
      <AdminLayout
        title="Admin"
        description="Moderare, rapoarte și operațiuni interne TROKO."
      >
        <AdminSetupState />
      </AdminLayout>
    );
  }

  if (!admin.isAdmin) {
    notFound();
  }

  const { stats } = await getAdminStats(supabase);

  return (
    <AdminLayout
      title="Admin"
      description="Moderare, rapoarte și operațiuni interne TROKO."
    >
      <div className="grid gap-5">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AdminStatCard
            title="Rapoarte deschise"
            value={stats.openReports}
            icon={FileWarning}
          />
          <AdminStatCard
            title="Rapoarte în analiză"
            value={stats.inReviewReports}
            icon={ShieldCheck}
          />
          <AdminStatCard
            title="Anunțuri active"
            value={stats.activeListings}
            icon={ListChecks}
          />
          <AdminStatCard
            title="Anunțuri arhivate"
            value={stats.archivedListings}
            icon={Archive}
          />
          <AdminStatCard
            title="Conversații raportate"
            value={stats.conversationReports}
            icon={MessagesSquare}
          />
          <AdminStatCard
            title="Utilizatori raportați"
            value={stats.userReports}
            icon={UserRound}
          />
        </section>

        <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-soft-sm">
          <h2 className="text-2xl font-black text-foreground">
            Linkuri rapide
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[1.25rem] border border-border bg-background p-4 text-sm font-black text-foreground transition hover:border-primary/40 hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
