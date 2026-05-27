import type { Tables } from "@/types/database";

export function calculateTrustScore({
  profile,
  activeListingsCount,
}: {
  profile: Tables<"profiles"> | null;
  activeListingsCount: number;
}) {
  let score = 0;

  if (profile?.email_verified_at) {
    score += 20;
  }

  if (profile?.phone_verified_at) {
    score += 25;
  }

  if (profile?.profile_completed_at) {
    score += 20;
  }

  if (activeListingsCount > 0) {
    score += 10;
  }

  if ((profile?.average_rating ?? 0) >= 4.5 && (profile?.reviews_count ?? 0) >= 3) {
    score += 15;
  }

  if (
    (profile?.response_rate ?? 0) >= 80 &&
    profile?.average_response_minutes !== null &&
    profile?.average_response_minutes !== undefined &&
    profile.average_response_minutes <= 180
  ) {
    score += 10;
  }

  return Math.min(score, 100);
}

export function formatResponseHint(profile: Tables<"profiles"> | null) {
  if (
    profile?.response_rate &&
    profile.response_rate >= 80 &&
    profile.average_response_minutes !== null &&
    profile.average_response_minutes !== undefined
  ) {
    if (profile.average_response_minutes <= 60) {
      return "Raspunde de obicei intr-o ora";
    }

    if (profile.average_response_minutes <= 180) {
      return "Raspunde de obicei in cateva ore";
    }
  }

  return "Raspunde prin Chat TROKO";
}

