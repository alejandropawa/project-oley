import type { SupabaseClient } from "@supabase/supabase-js";

import { getPublicListingImageUrl } from "@/lib/db/storage";
import { getReviewsForUser, type PublicReview } from "@/lib/db/reviews";
import { getSellerTrustSummary, type SellerTrustSummary } from "@/lib/db/trust";
import {
  mapDbListingToListing,
  type DbListingWithImages,
} from "@/lib/listings/mappers";
import type { Listing } from "@/lib/mock-data";
import type { Database, Tables } from "@/types/database";

export type PublicProfile = {
  profile: Tables<"profiles">;
  trust: SellerTrustSummary | null;
  listings: Listing[];
  reviews: PublicReview[];
  activeListingsCount: number;
  source: "supabase";
};

export async function getPublicProfileBySlug(
  slug: string,
  supabase: SupabaseClient<Database> | null,
): Promise<{ publicProfile: PublicProfile | null; source: "supabase" | "unavailable" }> {
  if (!supabase) {
    return { publicProfile: null, source: "unavailable" };
  }

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("Supabase public profile query failed", error);
      return { publicProfile: null, source: "unavailable" };
    }

    if (!profile) {
      return { publicProfile: null, source: "supabase" };
    }

    const [listingsResult, trustResult, reviewsResult] = await Promise.all([
      getPublicProfileListings(profile.id, supabase),
      getSellerTrustSummary(profile.id, supabase),
      getReviewsForUser(profile.id, supabase),
    ]);

    return {
      publicProfile: {
        profile,
        trust: trustResult.summary,
        listings: listingsResult.listings,
        reviews: reviewsResult.reviews,
        activeListingsCount: listingsResult.listings.length,
        source: "supabase",
      },
      source: "supabase",
    };
  } catch (error) {
    console.error("Supabase public profile query failed", error);
    return { publicProfile: null, source: "unavailable" };
  }
}

export async function getPublicProfileByUserId(
  userId: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { profile: null, source: "unavailable" as const };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Supabase public profile by user id failed", error);
    return { profile: null, source: "unavailable" as const };
  }

  return { profile: data, source: "supabase" as const };
}

export async function getPublicProfileListings(
  userId: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { listings: [], source: "unavailable" as const };
  }

  try {
    const { data, error } = await supabase
      .from("listings")
      .select("*, listing_images(storage_path, sort_order, alt_text)")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(24);

    if (error) {
      console.error("Supabase public profile listings failed", error);
      return { listings: [], source: "unavailable" as const };
    }

    return {
      listings: (data ?? []).map((row) =>
        mapDbListingToListing(row as unknown as DbListingWithImages, (path) =>
          getPublicListingImageUrl(supabase, path),
        ),
      ),
      source: "supabase" as const,
    };
  } catch (error) {
    console.error("Supabase public profile listings failed", error);
    return { listings: [], source: "unavailable" as const };
  }
}

export async function getPublicProfilesForSitemap(
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { profiles: [], source: "unavailable" as const };
  }

  try {
    const [{ data, error }, activeListings] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, slug, updated_at, reviews_count")
        .not("slug", "is", null)
        .limit(500),
      supabase
        .from("listings")
        .select("user_id")
        .eq("status", "active")
        .limit(1000),
    ]);

    if (error) {
      console.error("Supabase profile sitemap query failed", error);
      return { profiles: [], source: "unavailable" as const };
    }

    if (activeListings.error) {
      console.error(
        "Supabase profile sitemap active listing query failed",
        activeListings.error,
      );
    }

    const activeOwnerIds = new Set(
      (activeListings.data ?? []).map((listing) => listing.user_id),
    );

    return {
      profiles: (data ?? []).filter(
        (profile) =>
          Boolean(profile.slug) &&
          (Number(profile.reviews_count ?? 0) > 0 ||
            activeOwnerIds.has(profile.id)),
      ),
      source: "supabase" as const,
    };
  } catch (error) {
    console.error("Supabase profile sitemap query failed", error);
    return { profiles: [], source: "unavailable" as const };
  }
}
