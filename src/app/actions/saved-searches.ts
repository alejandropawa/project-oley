"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createSavedSearch,
  getSavedSearches,
} from "@/lib/db/saved-searches";
import { createClient } from "@/lib/supabase/server";

export async function saveSearchAction(formData: FormData) {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/cont/cautari-salvate?setup=1");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/?auth=login&redirectTo=/anunturi");
  }

  const rawFilters = String(formData.get("filters") ?? "{}");
  const query = String(formData.get("query") ?? "");
  const name = String(formData.get("name") ?? "").trim() || "Căutare salvată";
  const filters = parseFilters(rawFilters);
  const existing = await getSavedSearches(supabase);
  const normalizedFilters = stableStringify(filters);
  const duplicate = existing.some(
    (savedSearch) =>
      (savedSearch.query ?? "") === query &&
      stableStringify(savedSearch.filters) === normalizedFilters,
  );

  if (!duplicate) {
    await createSavedSearch(
      {
        name,
        query,
        filters,
      },
      supabase,
    );
  }

  revalidatePath("/cont/cautari-salvate");
  redirect("/cont/cautari-salvate?saved=1");
}

function parseFilters(value: string) {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function stableStringify(value: unknown) {
  return JSON.stringify(sortObject(value));
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObject);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => [key, sortObject(item)]),
  );
}
