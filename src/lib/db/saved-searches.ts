import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json, TablesInsert, TablesUpdate } from "@/types/database";

export async function getSavedSearches(
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
      .from("saved_searches")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase saved searches query failed", error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error("Supabase saved searches query failed", error);
    return [];
  }
}

export async function createSavedSearch(
  input: {
    name: string;
    query?: string;
    filters?: Json;
  },
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { savedSearch: null, error: "SUPABASE_NOT_CONFIGURED" };
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { savedSearch: null, error: "NOT_AUTHENTICATED" };
    }

    const insert: TablesInsert<"saved_searches"> = {
      user_id: user.id,
      name: input.name.trim(),
      query: input.query?.trim() || null,
      filters: input.filters ?? {},
    };

    const { data, error } = await supabase
      .from("saved_searches")
      .insert(insert)
      .select("*")
      .single();

    return {
      savedSearch: data,
      error: error ? "CREATE_SAVED_SEARCH_FAILED" : null,
    };
  } catch (error) {
    console.error("Supabase saved search create failed", error);
    return { savedSearch: null, error: "CREATE_SAVED_SEARCH_FAILED" };
  }
}

export async function updateSavedSearch(
  id: string,
  input: TablesUpdate<"saved_searches">,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" };
  }

  const { error } = await supabase
    .from("saved_searches")
    .update(input)
    .eq("id", id);

  return { error: error ? "UPDATE_SAVED_SEARCH_FAILED" : null };
}

export async function deleteSavedSearch(
  id: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" };
  }

  const { error } = await supabase.from("saved_searches").delete().eq("id", id);

  return { error: error ? "DELETE_SAVED_SEARCH_FAILED" : null };
}
