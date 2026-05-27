import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export type TrokoUserMetadata = {
  full_name?: string;
  phone?: string;
  city?: string;
  county?: string;
  contact_preference?: "chat" | "phone" | "chat-phone";
};

export async function getCurrentUser() {
  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export function getDisplayName(user: User | null) {
  if (!user) {
    return "";
  }

  const metadata = user.user_metadata as TrokoUserMetadata;

  return metadata.full_name || user.email?.split("@")[0] || "Utilizator TROKO";
}

export function getInitials(name: string, email?: string) {
  const source = name.trim() || email || "T";
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
