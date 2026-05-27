const PLACEHOLDERS = new Set([
  "",
  "your-project-url",
  "your-anon-key",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
]);

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

  if (PLACEHOLDERS.has(url) || PLACEHOLDERS.has(anonKey)) {
    return false;
  }

  if (!url.startsWith("https://") || !url.includes(".supabase.co")) {
    return false;
  }

  return anonKey.length > 20;
}
