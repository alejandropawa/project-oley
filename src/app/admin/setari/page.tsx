import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminSetupState } from "@/components/admin/admin-setup-state";
import { isCurrentUserAdmin } from "@/lib/db/admin";
import { isSupabaseConfigured } from "@/lib/db/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    absolute: "Setări admin — TROKO",
  },
  description: "Setări și acces admin TROKO.",
};

export default async function AdminSettingsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <AdminLayout title="Setări admin" description="Configurare acces admin.">
        <AdminSetupState />
      </AdminLayout>
    );
  }

  const supabase = await createClient();
  const admin = await isCurrentUserAdmin(supabase);

  if (!admin.user) {
    redirect("/login?redirectTo=/admin/setari");
  }

  if (admin.source === "unavailable") {
    return (
      <AdminLayout title="Setări admin" description="Configurare acces admin.">
        <AdminSetupState />
      </AdminLayout>
    );
  }

  if (!admin.isAdmin) {
    notFound();
  }

  return (
    <AdminLayout title="Setări admin" description="Configurare acces admin.">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <section className="rounded-[1.75rem] border border-border bg-card p-6 shadow-soft-sm">
          <h2 className="text-2xl font-black text-foreground">
            Admin curent
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Ești autentificat ca admin TROKO. Pentru siguranță, datele private
            ale utilizatorilor, precum telefonul, nu sunt afișate în această
            versiune.
          </p>
          <div className="mt-5 rounded-[1rem] border border-border bg-background p-4">
            <p className="text-xs font-bold uppercase text-muted-foreground">
              User ID
            </p>
            <p className="mt-1 break-all text-sm font-black text-foreground">
              {admin.user.id}
            </p>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-[#F3D88D] bg-[#FFF2CF] p-6 shadow-soft-sm">
          <h2 className="text-2xl font-black text-foreground">
            Primul admin
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#7A5718]">
            Pentru primul admin, adaugă manual user_id-ul în tabela
            admin_users din Supabase. Nu există flux public de creare admin.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-[1rem] bg-card p-4 text-xs font-bold text-foreground">
            {`insert into public.admin_users (user_id)
values ('YOUR_AUTH_USER_ID');`}
          </pre>
        </section>
      </div>
    </AdminLayout>
  );
}
