import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createProfileSlug } from "@/lib/profiles/slug";
import { trustBadgeLabels } from "@/lib/trust/labels";
import { calculateTrustScore, formatResponseHint } from "@/lib/trust/score";
import { isProfileComplete } from "@/lib/trust/profile-completion";
import type { Database, Enums, Tables, TablesInsert } from "@/types/database";

export type SellerTrustSummary = {
  userId: string;
  displayName: string;
  slug: string | null;
  avatarUrl: string | null;
  city: string | null;
  county: string | null;
  publicLocationLabel: string | null;
  memberSince: string | null;
  trustScore: number;
  averageRating: number | null;
  reviewsCount: number;
  activeListingsCount: number;
  responseHint: string;
  isVerifiedSeller: boolean;
  badges: Tables<"user_trust_badges">[];
};

export async function getTrustBadgesForUser(
  userId: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { badges: [], source: "unavailable" as const };
  }

  try {
    const { data, error } = await supabase
      .from("user_trust_badges")
      .select("*")
      .eq("user_id", userId)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order("awarded_at", { ascending: false });

    if (error) {
      console.error("Supabase trust badges query failed", error);
      return { badges: [], source: "unavailable" as const };
    }

    return { badges: data ?? [], source: "supabase" as const };
  } catch (error) {
    console.error("Supabase trust badges query failed", error);
    return { badges: [], source: "unavailable" as const };
  }
}

export async function awardTrustBadge(
  userId: string,
  badge: Enums<"trust_badge_code">,
  supabase: SupabaseClient<Database> | null,
  options: {
    awardedBy?: string | null;
    metadata?: TablesInsert<"user_trust_badges">["metadata"];
  } = {},
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" as const };
  }

  const label = trustBadgeLabels[badge];
  const { error } = await supabase.from("user_trust_badges").upsert(
    {
      user_id: userId,
      badge,
      label: label.label,
      description: label.description,
      awarded_by: options.awardedBy ?? null,
      metadata: options.metadata ?? {},
    },
    { onConflict: "user_id,badge" },
  );

  if (error) {
    console.error("Supabase trust badge award failed", error);
    return { error: "AWARD_BADGE_FAILED" as const };
  }

  return { error: null };
}

export async function removeTrustBadge(
  userId: string,
  badge: Enums<"trust_badge_code">,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" as const };
  }

  const { error } = await supabase
    .from("user_trust_badges")
    .delete()
    .eq("user_id", userId)
    .eq("badge", badge);

  return { error: error ? ("REMOVE_BADGE_FAILED" as const) : null };
}

export async function syncCurrentUserTrustProfile(
  user: User,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { profile: null, source: "unavailable" as const };
  }

  try {
    const { data: existing } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const displayName =
      existing?.display_name ??
      (typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : user.email?.split("@")[0]) ??
      "Utilizator TROKO";
    const emailVerifiedAt =
      user.email_confirmed_at ?? user.confirmed_at ?? existing?.email_verified_at ?? null;
    const profileCompletedAt =
      existing?.profile_completed_at ??
      (isProfileComplete(existing ?? null) ? new Date().toISOString() : null);
    const slug = existing?.slug ?? createProfileSlug(displayName, user.id);
    const activeListingsCount = await getActiveListingCount(user.id, supabase);
    const trustScore = calculateTrustScore({
      profile: existing
        ? {
            ...existing,
            email_verified_at: emailVerifiedAt,
            profile_completed_at: profileCompletedAt,
          }
        : null,
      activeListingsCount,
    });

    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          display_name: displayName,
          slug,
          email_verified_at: emailVerifiedAt,
          profile_completed_at: profileCompletedAt,
          trust_score: trustScore,
        },
        { onConflict: "id" },
      )
      .select("*")
      .single();

    if (error || !data) {
      console.error("Supabase trust profile sync failed", error);
      return { profile: existing ?? null, source: "unavailable" as const };
    }

    await awardTrustBadge(user.id, "new_member", supabase);

    if (emailVerifiedAt) {
      await awardTrustBadge(user.id, "email_verified", supabase);
    }

    if (profileCompletedAt) {
      await awardTrustBadge(user.id, "profile_complete", supabase);
    }

    if (data.phone_verified_at) {
      await awardTrustBadge(user.id, "phone_verified", supabase);
    }

    return { profile: data, source: "supabase" as const };
  } catch (error) {
    console.error("Supabase trust profile sync failed", error);
    return { profile: null, source: "unavailable" as const };
  }
}

export async function getSellerTrustSummary(
  userId: string | null | undefined,
  supabase: SupabaseClient<Database> | null,
): Promise<{ summary: SellerTrustSummary | null; source: "supabase" | "unavailable" }> {
  if (!userId || !supabase) {
    return { summary: null, source: "unavailable" };
  }

  try {
    const [{ data: profile, error }, badgeResult, activeListingsCount] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        getTrustBadgesForUser(userId, supabase),
        getActiveListingCount(userId, supabase),
      ]);

    if (error || !profile) {
      if (error) {
        console.error("Supabase seller trust summary failed", error);
      }
      return { summary: null, source: error ? "unavailable" : "supabase" };
    }

    return {
      summary: {
        userId,
        displayName: profile.display_name ?? "Utilizator TROKO",
        slug: profile.slug,
        avatarUrl: profile.avatar_url,
        city: profile.city,
        county: profile.county,
        publicLocationLabel: profile.public_location_label,
        memberSince: profile.created_at,
        trustScore: profile.trust_score,
        averageRating: profile.average_rating,
        reviewsCount: profile.reviews_count,
        activeListingsCount,
        responseHint: formatResponseHint(profile),
        isVerifiedSeller: profile.is_verified_seller,
        badges: badgeResult.badges,
      },
      source: "supabase",
    };
  } catch (error) {
    console.error("Supabase seller trust summary failed", error);
    return { summary: null, source: "unavailable" };
  }
}

export async function getActiveListingCount(
  userId: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return 0;
  }

  const { count } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "active");

  return count ?? 0;
}

