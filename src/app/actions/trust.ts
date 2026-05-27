"use server";

import { revalidatePath } from "next/cache";

import { awardTrustBadge, syncCurrentUserTrustProfile } from "@/lib/db/trust";
import { updateCurrentProfilePublicDetails } from "@/lib/db/profiles";
import { createClient } from "@/lib/supabase/server";

export type TrustActionResult = {
  success: boolean;
  error?: string;
};

export async function saveOnboardingProfileAction(
  input: {
    displayName: string;
    city: string;
    county: string;
    bio: string;
    publicLocationLabel: string;
    phone?: string;
    contactPreference?: "chat" | "phone" | "both";
  },
): Promise<TrustActionResult> {
  const supabase = await createClient();
  const result = await updateCurrentProfilePublicDetails(input, supabase);

  if (result.error) {
    return { success: false, error: getTrustError(result.error) };
  }

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await awardTrustBadge(user.id, "profile_complete", supabase);
      await syncCurrentUserTrustProfile(user, supabase);
    }
  }

  revalidateTrustPaths();
  return { success: true };
}

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
  revalidatePath("/onboarding");
}

function getTrustError(error: string) {
  if (error === "NOT_AUTHENTICATED") {
    return "Intra in cont pentru a continua.";
  }

  if (error === "SUPABASE_NOT_CONFIGURED") {
    return "Aceasta actiune are nevoie de configurarea Supabase.";
  }

  return "Nu am putut salva profilul. Incearca din nou.";
}
