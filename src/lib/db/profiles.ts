import type { SupabaseClient } from "@supabase/supabase-js";

import { mapDbContactPreferenceToUi } from "@/lib/listings/mappers";
import { createProfileSlug } from "@/lib/profiles/slug";
import { isProfileComplete } from "@/lib/trust/profile-completion";
import type { Database, Enums, Tables } from "@/types/database";

export type CurrentProfileResult = {
  profile: Tables<"profiles"> | null;
  privateSettings: Tables<"profile_private_settings"> | null;
  source: "supabase" | "unavailable";
};

export type ProfileUpdateInput = {
  displayName: string;
  phone: string;
  city: string;
  county: string;
  contactPreference: Enums<"contact_preference">;
  bio?: string;
  publicLocationLabel?: string;
};

export async function getCurrentProfile(
  supabase: SupabaseClient<Database> | null,
): Promise<CurrentProfileResult> {
  if (!supabase) {
    return unavailableProfile();
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return unavailableProfile();
    }

    await ensureCurrentProfile(supabase);

    const [{ data: profile, error: profileError }, { data: privateSettings, error: settingsError }] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("profile_private_settings")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

    if (profileError || settingsError) {
      console.error("Supabase profile query failed", profileError ?? settingsError);
      return unavailableProfile();
    }

    return {
      profile,
      privateSettings,
      source: "supabase",
    };
  } catch (error) {
    console.error("Supabase profile query failed", error);
    return unavailableProfile();
  }
}

export async function ensureCurrentProfile(
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" };
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "NOT_AUTHENTICATED" };
    }

    const displayName =
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : user.email?.split("@")[0];

    const [{ error: profileError }, { error: settingsError }] =
      await Promise.all([
        supabase.from("profiles").upsert(
          {
            id: user.id,
            display_name: displayName ?? "Utilizator TROKO",
          },
          { onConflict: "id" },
        ),
        supabase.from("profile_private_settings").upsert(
          {
            user_id: user.id,
          },
          { onConflict: "user_id" },
        ),
      ]);

    if (profileError || settingsError) {
      console.error(
        "Supabase ensure profile failed",
        profileError ?? settingsError,
      );
      return { error: "PROFILE_SCHEMA_UNAVAILABLE" };
    }

    return { error: null };
  } catch (error) {
    console.error("Supabase ensure profile failed", error);
    return { error: "PROFILE_SCHEMA_UNAVAILABLE" };
  }
}

export async function updateCurrentProfile(
  input: ProfileUpdateInput,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" };
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "NOT_AUTHENTICATED" };
    }

    const displayName = input.displayName.trim();
    const phone = input.phone.trim();

    const [{ error: profileError }, { error: settingsError }] =
      await Promise.all([
        supabase.from("profiles").upsert(
          {
            id: user.id,
            display_name: displayName,
            city: input.city || null,
            county: input.county || null,
            bio: input.bio?.trim() || undefined,
            public_location_label: input.publicLocationLabel?.trim() || undefined,
          },
          { onConflict: "id" },
        ),
        supabase.from("profile_private_settings").upsert(
          {
            user_id: user.id,
            phone: phone || null,
            contact_preference: input.contactPreference,
          },
          { onConflict: "user_id" },
        ),
      ]);

    if (profileError || settingsError) {
      console.error(
        "Supabase profile update failed",
        profileError ?? settingsError,
      );
      return { error: "UPDATE_PROFILE_FAILED" };
    }

    await supabase.auth.updateUser({
      data: {
        full_name: displayName,
        phone,
        city: input.city,
        county: input.county,
        contact_preference: mapDbContactPreferenceToUi(input.contactPreference),
      },
    });

    return { error: null };
  } catch (error) {
    console.error("Supabase profile update failed", error);
    return { error: "UPDATE_PROFILE_FAILED" };
  }
}

export async function updateCurrentProfilePublicDetails(
  input: {
    displayName: string;
    city: string;
    county: string;
    bio: string;
    publicLocationLabel: string;
    phone?: string;
    contactPreference?: Enums<"contact_preference">;
  },
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" as const };
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "NOT_AUTHENTICATED" as const };
    }

    const { data: existing } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    const displayName = input.displayName.trim() || "Utilizator TROKO";
    const nextProfile = {
      ...(existing ?? {}),
      display_name: displayName,
      city: input.city.trim() || null,
      county: input.county.trim() || null,
      bio: input.bio.trim() || null,
      public_location_label: input.publicLocationLabel.trim() || null,
    } as Tables<"profiles">;
    const completed = isProfileComplete(nextProfile);

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        display_name: displayName,
        slug: existing?.slug ?? createProfileSlug(displayName, user.id),
        city: input.city.trim() || null,
        county: input.county.trim() || null,
        bio: input.bio.trim() || null,
        public_location_label: input.publicLocationLabel.trim() || null,
        profile_completed_at:
          existing?.profile_completed_at ??
          (completed ? new Date().toISOString() : null),
      },
      { onConflict: "id" },
    );

    if (profileError) {
      console.error("Supabase profile details update failed", profileError);
      return { error: "UPDATE_PROFILE_FAILED" as const };
    }

    if (input.phone !== undefined || input.contactPreference) {
      const { error: settingsError } = await supabase
        .from("profile_private_settings")
        .upsert(
          {
            user_id: user.id,
            phone: input.phone?.trim() || null,
            contact_preference: input.contactPreference ?? "chat",
          },
          { onConflict: "user_id" },
        );

      if (settingsError) {
        console.error("Supabase profile settings update failed", settingsError);
        return { error: "UPDATE_PROFILE_FAILED" as const };
      }
    }

    return { error: null };
  } catch (error) {
    console.error("Supabase profile details update failed", error);
    return { error: "UPDATE_PROFILE_FAILED" as const };
  }
}

function unavailableProfile(): CurrentProfileResult {
  return {
    profile: null,
    privateSettings: null,
    source: "unavailable",
  };
}
