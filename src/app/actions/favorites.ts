"use server";

import { revalidatePath } from "next/cache";

import { toggleFavorite } from "@/lib/db/favorites";
import { notifyUser } from "@/lib/db/notifications";
import { createClient } from "@/lib/supabase/server";

export type FavoriteActionResult = {
  success: boolean;
  favorited?: boolean;
  error?: string;
};

export async function toggleFavoriteAction(
  listingId: string,
): Promise<FavoriteActionResult> {
  const supabase = await createClient();

  if (!supabase) {
    return {
      success: false,
      error: "Favoritele vor fi disponibile după configurarea Supabase.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Intră în cont pentru a salva anunțuri." };
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("id, user_id, title, slug")
    .eq("id", listingId)
    .maybeSingle();

  const result = await toggleFavorite(listingId, supabase);

  if (result.error) {
    return { success: false, error: getFavoriteError(result.error) };
  }

  if (result.favorited && listing && listing.user_id !== user.id) {
    await notifyUser(
      {
        userId: listing.user_id,
        type: "listing_favorited",
        title: "Anunțul tău a fost salvat la favorite",
        body: listing.title,
        actionUrl: `/anunturi/${listing.slug}`,
        data: { listing_id: listing.id },
        emailData: { listingTitle: listing.title },
      },
      supabase,
    );
  }

  revalidatePath("/cont/favorite");
  revalidatePath("/notificari");

  return { success: true, favorited: result.favorited };
}

function getFavoriteError(error: string) {
  if (error === "NOT_AUTHENTICATED") {
    return "Intră în cont pentru a salva anunțuri.";
  }

  if (error === "SUPABASE_NOT_CONFIGURED") {
    return "Favoritele vor fi disponibile după configurarea Supabase.";
  }

  return "Nu am putut actualiza favoritele.";
}
