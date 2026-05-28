"use server";

import { revalidatePath } from "next/cache";

import { syncCurrentUserTrustProfile } from "@/lib/db/trust";
import { createClient } from "@/lib/supabase/server";

export type TrustActionResult = {
  success: boolean;
  error?: string;
};

export async function refreshTrustProfileAction(): Promise<TrustActionResult> {
  const supabase = await createClient();

  if (!supabase) {
    return {
      success: false,
      error: "Semnalele de incredere vor fi disponibile dupa configurarea Supabase.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Intra in cont pentru a actualiza profilul." };
  }

  await syncCurrentUserTrustProfile(user, supabase);
  revalidateTrustPaths();
  return { success: true };
}

function revalidateTrustPaths() {
  revalidatePath("/cont");
  revalidatePath("/cont/profil");
  revalidatePath("/cont/incredere");
}
