import type { SupabaseClient } from "@supabase/supabase-js";

import { requireAdmin } from "@/lib/db/admin";
import { notifyUser } from "@/lib/db/notifications";
import { awardTrustBadge } from "@/lib/db/trust";
import type { Database, Enums, Json, TablesInsert } from "@/types/database";

export type VerificationType = "phone" | "business" | "seller";

export async function getCurrentUserVerificationStatus(
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { requests: [], source: "unavailable" as const };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { requests: [], source: "supabase" as const };
  }

  try {
    const { data, error } = await supabase
      .from("profile_verification_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase verification requests failed", error);
      return { requests: [], source: "unavailable" as const };
    }

    return { requests: data ?? [], source: "supabase" as const };
  } catch (error) {
    console.error("Supabase verification requests failed", error);
    return { requests: [], source: "unavailable" as const };
  }
}

export async function createPhoneVerificationRequest(
  input: { phone: string; note?: string },
  supabase: SupabaseClient<Database> | null,
) {
  return createVerificationRequest(
    {
      type: "phone",
      submittedData: {
        phone: input.phone.trim(),
        note: input.note?.trim() ?? "",
      },
    },
    supabase,
  );
}

export async function createSellerVerificationRequest(
  input: { type: VerificationType; submittedData?: Json },
  supabase: SupabaseClient<Database> | null,
) {
  return createVerificationRequest(input, supabase);
}

export async function getVerificationRequestsForAdmin(
  filters: { status?: Enums<"verification_status"> | "all" } = {},
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { requests: [], source: "unavailable" as const };
  }

  try {
    let query = supabase
      .from("profile_verification_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase admin verification requests failed", error);
      return { requests: [], source: "unavailable" as const };
    }

    return { requests: data ?? [], source: "supabase" as const };
  } catch (error) {
    console.error("Supabase admin verification requests failed", error);
    return { requests: [], source: "unavailable" as const };
  }
}

export async function approveVerificationRequest(
  id: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" as const };
  }

  const admin = await requireAdmin(supabase);

  if (admin.error || !admin.user) {
    return { error: admin.error ?? "NOT_ADMIN" };
  }

  const { data: request, error: requestError } = await supabase
    .from("profile_verification_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (requestError || !request) {
    return { error: "REQUEST_NOT_FOUND" as const };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("profile_verification_requests")
    .update({
      status: "verified",
      reviewed_by: admin.user.id,
      reviewed_at: now,
    })
    .eq("id", id);

  if (error) {
    console.error("Supabase verification approval failed", error);
    return { error: "UPDATE_REQUEST_FAILED" as const };
  }

  if (request.type === "phone") {
    await supabase
      .from("profiles")
      .update({ phone_verified_at: now })
      .eq("id", request.user_id);
    await awardTrustBadge(request.user_id, "phone_verified", supabase, {
      awardedBy: admin.user.id,
    });
  }

  if (request.type === "seller" || request.type === "business") {
    await supabase
      .from("profiles")
      .update({ is_verified_seller: true })
      .eq("id", request.user_id);
    await awardTrustBadge(request.user_id, "trusted_seller", supabase, {
      awardedBy: admin.user.id,
    });
  }

  await notifyUser(
    {
      userId: request.user_id,
      type: "verification_approved",
      title: "Verificarea a fost aprobata",
      body:
        request.type === "phone"
          ? "Telefonul tau a fost verificat manual de echipa TROKO."
          : "Cererea ta de verificare a fost aprobata.",
      actionUrl: "/cont/incredere",
    },
    supabase,
  );

  return { error: null };
}

export async function rejectVerificationRequest(
  id: string,
  note: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" as const };
  }

  const admin = await requireAdmin(supabase);

  if (admin.error || !admin.user) {
    return { error: admin.error ?? "NOT_ADMIN" };
  }

  const { data: request, error: requestError } = await supabase
    .from("profile_verification_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (requestError || !request) {
    return { error: "REQUEST_NOT_FOUND" as const };
  }

  const { error } = await supabase
    .from("profile_verification_requests")
    .update({
      status: "rejected",
      admin_note: note.trim() || null,
      reviewed_by: admin.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Supabase verification rejection failed", error);
    return { error: "UPDATE_REQUEST_FAILED" as const };
  }

  await notifyUser(
    {
      userId: request.user_id,
      type: "verification_rejected",
      title: "Verificarea a fost respinsa",
      body: note.trim()
        ? `Echipa TROKO a lasat o nota: ${note.trim()}`
        : "Cererea ta de verificare a fost respinsa.",
      actionUrl: "/cont/incredere",
    },
    supabase,
  );

  return { error: null };
}

async function createVerificationRequest(
  input: {
    type: VerificationType;
    submittedData?: Json;
  },
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { request: null, error: "SUPABASE_NOT_CONFIGURED" as const };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { request: null, error: "NOT_AUTHENTICATED" as const };
  }

  if (input.type === "phone") {
    const data =
      input.submittedData &&
      typeof input.submittedData === "object" &&
      !Array.isArray(input.submittedData)
        ? input.submittedData
        : {};
    const phone = typeof data.phone === "string" ? data.phone.trim() : "";

    if (phone.length < 7) {
      return { request: null, error: "INVALID_PHONE" as const };
    }
  }

  const existing = await supabase
    .from("profile_verification_requests")
    .select("id")
    .eq("user_id", user.id)
    .eq("type", input.type)
    .eq("status", "pending")
    .maybeSingle();

  if (existing.data) {
    return { request: null, error: "REQUEST_ALREADY_PENDING" as const };
  }

  const insert: TablesInsert<"profile_verification_requests"> = {
    user_id: user.id,
    type: input.type,
    submitted_data: input.submittedData ?? {},
  };

  const { data, error } = await supabase
    .from("profile_verification_requests")
    .insert(insert)
    .select("*")
    .single();

  if (error || !data) {
    console.error("Supabase verification request insert failed", error);
    return { request: null, error: "CREATE_REQUEST_FAILED" as const };
  }

  return { request: data, error: null };
}
