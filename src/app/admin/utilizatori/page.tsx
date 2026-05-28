import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminSetupState } from "@/components/admin/admin-setup-state";
import { AdminUserRow } from "@/components/admin/admin-user-row";
import { getAdminUsers, isCurrentUserAdmin } from "@/lib/db/admin";
import { isSupabaseConfigured } from "@/lib/db/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    absolute: "Utilizatori — Admin TROKO",
  },
  description: "Utilizatori și profiluri publice TROKO.",
};

export default async function AdminUsersPage() {
  if (!isSupabaseConfigured()) {
    return (
      <AdminLayout title="Utilizatori" description="Profiluri publice TROKO.">
        <AdminSetupState />
      </AdminLayout>
    );
  }

  const supabase = await createClient();
  const admin = await isCurrentUserAdmin(supabase);

  if (!admin.user) {
    redirect("/?auth=login&redirectTo=/admin/utilizatori");
  }

  if (admin.source === "unavailable") {
    return (
      <AdminLayout title="Utilizatori" description="Profiluri publice TROKO.">
        <AdminSetupState />
      </AdminLayout>
    );
  }

  if (!admin.isAdmin) {
    notFound();
  }

  const users = await getAdminUsers(supabase);

  return (
    <AdminLayout
      title="Utilizatori"
      description="Vezi profiluri publice, număr de anunțuri și raportări."
    >
      {users.source === "unavailable" ? (
        <AdminSetupState title="Utilizatorii nu sunt disponibili încă." />
      ) : users.users.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-border bg-card p-8 text-center shadow-soft-sm">
          <h2 className="text-2xl font-black text-foreground">
            Nu există profiluri încă.
          </h2>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.users.map((user) => (
            <AdminUserRow key={user.profile.id} user={user} />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
