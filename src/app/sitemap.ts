import type { MetadataRoute } from "next";

import { getActiveListingsForSitemap } from "@/lib/db/listings";
import { getPublicProfilesForSitemap } from "@/lib/db/public-profiles";
import { categories, listings } from "@/lib/mock-data";
import { romanianCities } from "@/lib/romanian-cities";
import { absoluteUrl } from "@/lib/seo/site";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    entry("/", now, "daily", 1),
    entry("/anunturi", now, "daily", 0.9),
    entry("/categorii", now, "weekly", 0.85),
    entry("/orase", now, "weekly", 0.85),
    entry("/publica", now, "monthly", 0.7),
    entry("/promovare", now, "monthly", 0.72),
  ];

  const categoryEntries = categories.map((category) =>
    entry(`/categorii/${category.slug}`, now, "weekly", 0.8),
  );
  const cityEntries = romanianCities.map((city) =>
    entry(`/orase/${city.slug}`, now, "weekly", 0.78),
  );
  const categoryCityEntries = categories.flatMap((category) =>
    romanianCities.map((city) =>
      entry(`/categorii/${category.slug}/${city.slug}`, now, "weekly", 0.68),
    ),
  );

  const supabase = await createClient();
  const [dbListings, dbProfiles] = await Promise.all([
    getActiveListingsForSitemap(supabase),
    getPublicProfilesForSitemap(supabase),
  ]);
  const listingEntries =
    dbListings.source === "supabase"
      ? dbListings.listings.map((listing) =>
          entry(
            `/anunturi/${listing.slug}`,
            new Date(listing.updated_at ?? listing.created_at),
            "daily",
            0.75,
          ),
        )
      : process.env.NODE_ENV !== "production"
        ? listings.map((listing) =>
            entry(`/anunturi/${listing.slug}`, new Date(listing.createdAt), "daily", 0.6),
          )
        : [];

  const profileEntries =
    dbProfiles.source === "supabase"
      ? dbProfiles.profiles.map((profile) =>
          entry(
            `/profil/${profile.slug}`,
            new Date(profile.updated_at),
            "weekly",
            0.58,
          ),
        )
      : [];

  return [
    ...staticEntries,
    ...categoryEntries,
    ...cityEntries,
    ...categoryCityEntries,
    ...listingEntries,
    ...profileEntries,
  ];
}

function entry(
  path: string,
  lastModified: Date,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
  };
}
