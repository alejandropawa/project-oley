import type { Tables } from "@/types/database";

export type TrustChecklistItem = {
  key: string;
  label: string;
  complete: boolean;
  description: string;
};

export function isProfileComplete(profile: Tables<"profiles"> | null) {
  return Boolean(
    profile?.display_name?.trim() &&
      profile.city?.trim() &&
      profile.county?.trim() &&
      profile.bio?.trim(),
  );
}

export function getTrustChecklist({
  profile,
  activeListingsCount,
}: {
  profile: Tables<"profiles"> | null;
  activeListingsCount: number;
}): TrustChecklistItem[] {
  return [
    {
      key: "email",
      label: "Email confirmat",
      complete: Boolean(profile?.email_verified_at),
      description: "Confirma adresa de email pentru recuperare si siguranta.",
    },
    {
      key: "phone",
      label: "Telefon verificat",
      complete: Boolean(profile?.phone_verified_at),
      description: "Verificarea telefonului este momentan manuala.",
    },
    {
      key: "profile",
      label: "Profil complet",
      complete: Boolean(profile?.profile_completed_at) || isProfileComplete(profile),
      description: "Completeaza numele, orasul, judetul si o scurta descriere.",
    },
    {
      key: "listings",
      label: "Anunturi active",
      complete: activeListingsCount > 0,
      description: "Anunturile active ajuta comunitatea sa inteleaga ce vinzi.",
    },
    {
      key: "reviews",
      label: "Review-uri primite",
      complete: (profile?.reviews_count ?? 0) > 0,
      description: "Review-urile apar dupa interactiuni reale in TROKO.",
    },
    {
      key: "response",
      label: "Raspuns rapid",
      complete: Boolean(
        profile?.response_rate &&
          profile.response_rate >= 80 &&
          profile.average_response_minutes !== null &&
          profile.average_response_minutes <= 180,
      ),
      description: "Indicator pregatit pentru masurarea raspunsurilor in chat.",
    },
  ];
}

