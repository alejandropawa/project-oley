import type { SupabaseClient } from "@supabase/supabase-js";

import { isSupabaseConfigured } from "@/lib/db/env";
import { searchMockListings } from "@/lib/search/mock-provider";
import { searchPostgresListings } from "@/lib/search/postgres-provider";
import type { SearchListingsParams } from "@/lib/search/types";
import type { Database } from "@/types/database";

export async function searchListings(
  params: SearchListingsParams,
  supabase: SupabaseClient<Database> | null,
) {
  // The public contract lives here so a later Typesense/Meilisearch adapter can
  // replace the provider without changing pages or filter components.
  if (!isSupabaseConfigured() || !supabase) {
    return searchMockListings(params);
  }

  const result = await searchPostgresListings(params, supabase);

  if (result.source === "unavailable") {
    return searchMockListings(params);
  }

  return result;
}
