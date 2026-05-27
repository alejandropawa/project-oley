import type { SupabaseClient } from "@supabase/supabase-js";

import { sanitizeFileName } from "@/lib/listings/slug";
import type { Database } from "@/types/database";

export const LISTING_IMAGES_BUCKET = "listing-images";
export const MAX_LISTING_IMAGE_SIZE = 8 * 1024 * 1024;

export async function uploadListingImage({
  supabase,
  userId,
  listingId,
  file,
  index,
}: {
  supabase: SupabaseClient<Database>;
  userId: string;
  listingId: string;
  file: File;
  index: number;
}) {
  if (!file.type.startsWith("image/")) {
    throw new Error("INVALID_IMAGE_TYPE");
  }

  if (file.size > MAX_LISTING_IMAGE_SIZE) {
    throw new Error("IMAGE_TOO_LARGE");
  }

  const storagePath = `${userId}/${listingId}/${index}-${sanitizeFileName(
    file.name,
  )}`;
  const { error } = await supabase.storage
    .from(LISTING_IMAGES_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return storagePath;
}

export function getPublicListingImageUrl(
  supabase: SupabaseClient<Database>,
  storagePath: string,
) {
  const { data } = supabase.storage
    .from(LISTING_IMAGES_BUCKET)
    .getPublicUrl(storagePath);

  return data.publicUrl;
}

export async function deleteListingImage(
  supabase: SupabaseClient<Database>,
  storagePath: string,
) {
  const { error } = await supabase.storage
    .from(LISTING_IMAGES_BUCKET)
    .remove([storagePath]);

  if (error) {
    throw error;
  }
}
