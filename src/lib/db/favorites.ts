import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export async function getFavoriteListingIds(
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return [];
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Supabase favorites query failed", error);
      return [];
    }

    return (data ?? []).map((favorite) => favorite.listing_id);
  } catch (error) {
    console.error("Supabase favorites query failed", error);
    return [];
  }
}

export async function isListingFavorited(
  listingId: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return false;
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", listingId)
      .maybeSingle();

    if (error) {
      console.error("Supabase favorite lookup failed", error);
      return false;
    }

    return Boolean(data);
  } catch (error) {
    console.error("Supabase favorite lookup failed", error);
    return false;
  }
}

export async function toggleFavorite(
  listingId: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { favorited: false, error: "SUPABASE_NOT_CONFIGURED" };
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { favorited: false, error: "NOT_AUTHENTICATED" };
    }

    const { data: existing, error: lookupError } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", listingId)
      .maybeSingle();

    if (lookupError) {
      console.error("Supabase favorite lookup failed", lookupError);
      return { favorited: false, error: "FAVORITE_FAILED" };
    }

    if (existing) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", existing.id);

      return { favorited: false, error: error ? "FAVORITE_FAILED" : null };
    }

    const { error } = await supabase.from("favorites").insert({
      user_id: user.id,
      listing_id: listingId,
    });

    return { favorited: !error, error: error ? "FAVORITE_FAILED" : null };
  } catch (error) {
    console.error("Supabase favorite toggle failed", error);
    return { favorited: false, error: "FAVORITE_FAILED" };
  }
}
