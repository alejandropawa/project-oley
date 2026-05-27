"use server";

import { revalidatePath } from "next/cache";

import { getCommonListingFields } from "@/lib/categories/attribute-definitions";
import { updateListingAttributeDetails } from "@/lib/db/listings";
import { getPublicLocationForListing } from "@/lib/locations/privacy";
import { normalizeRomanianSlug } from "@/lib/romanian-cities";
import { createClient } from "@/lib/supabase/server";
import type { ListingAttributes } from "@/lib/categories/attribute-definitions";
import type { ListingLocationPrecision } from "@/lib/locations/types";

export type ListingUpdateActionResult = {
  success: boolean;
  error?: string;
};

export async function updateListingAttributesAction(
  listingId: string,
  input: {
    attributes: ListingAttributes;
    city: string;
    county: string;
    latitude: number | null;
    longitude: number | null;
    locationPrecision: ListingLocationPrecision;
    locationLabel: string;
  },
): Promise<ListingUpdateActionResult> {
  const supabase = await createClient();

  if (!supabase) {
    return {
      success: false,
      error: "Editarea anunțurilor va fi disponibilă după configurarea Supabase.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Intră în cont pentru a edita anunțul." };
  }

  const commonFields = getCommonListingFields(input.attributes);
  const publicLocation = getPublicLocationForListing({
    id: listingId,
    city: input.city,
    county: input.county,
    latitude: input.latitude,
    longitude: input.longitude,
    precision: input.locationPrecision,
  });
  const result = await updateListingAttributeDetails(
    listingId,
    user.id,
    {
      attributes: input.attributes,
      brand: commonFields.brand,
      model: commonFields.model,
      year: commonFields.year,
      city: input.city,
      county: input.county,
      citySlug: normalizeRomanianSlug(input.city),
      countySlug: normalizeRomanianSlug(input.county),
      latitude: input.latitude,
      longitude: input.longitude,
      publicLatitude: publicLocation?.latitude ?? null,
      publicLongitude: publicLocation?.longitude ?? null,
      locationPrecision: input.locationPrecision,
      locationLabel: input.locationLabel,
    },
    supabase,
  );

  if (result.error) {
    return { success: false, error: "Nu am putut salva detaliile anunțului." };
  }

  revalidatePath("/cont/anunturi");
  revalidatePath(`/cont/anunturi/${listingId}/editeaza`);
  revalidatePath("/anunturi");

  return { success: true };
}
