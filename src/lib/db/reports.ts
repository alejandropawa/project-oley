import type { SupabaseClient } from "@supabase/supabase-js";

import {
  isReportEntityType,
  isReportReason,
  isReportStatus,
} from "@/lib/reporting-utils";
import type { Database, Enums, Tables, TablesInsert } from "@/types/database";

export type ReportFilters = {
  status?: string;
  entityType?: string;
  reason?: string;
};

export type CreateReportInput = {
  entityType: Enums<"report_entity_type">;
  entityId: string;
  reason: Enums<"report_reason">;
  description?: string;
};

export type ReportSummary = {
  report: Tables<"reports">;
  reporterName: string;
  targetTitle: string;
  targetSubtitle: string;
};

export type ReportDetail = ReportSummary & {
  target: {
    title: string;
    description: string;
    metadata: Array<{ label: string; value: string }>;
    href?: string;
    listingId?: string;
  };
};

export async function createListingReport(
  input: Omit<CreateReportInput, "entityType">,
  supabase: SupabaseClient<Database> | null,
) {
  return createReport({ ...input, entityType: "listing" }, supabase);
}

export async function createConversationReport(
  input: Omit<CreateReportInput, "entityType">,
  supabase: SupabaseClient<Database> | null,
) {
  return createReport({ ...input, entityType: "conversation" }, supabase);
}

export async function createMessageReport(
  input: Omit<CreateReportInput, "entityType">,
  supabase: SupabaseClient<Database> | null,
) {
  return createReport({ ...input, entityType: "message" }, supabase);
}

export async function createUserReport(
  input: Omit<CreateReportInput, "entityType">,
  supabase: SupabaseClient<Database> | null,
) {
  return createReport({ ...input, entityType: "user" }, supabase);
}

export async function createReport(
  input: CreateReportInput,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { reportId: null, error: "SUPABASE_NOT_CONFIGURED" };
  }

  if (!isReportReason(input.reason)) {
    return { reportId: null, error: "INVALID_REASON" };
  }

  const description = input.description?.trim() ?? "";

  if (description.length > 2000) {
    return { reportId: null, error: "DESCRIPTION_TOO_LONG" };
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { reportId: null, error: "NOT_AUTHENTICATED" };
    }

    const target = await getValidatedTarget(input, user.id, supabase);

    if (target.error) {
      return { reportId: null, error: target.error };
    }

    const duplicate = await findOpenDuplicateReport(
      user.id,
      input.entityType,
      target.targetColumn,
      input.entityId,
      supabase,
    );

    if (duplicate) {
      return { reportId: duplicate.id, error: null };
    }

    const insert: TablesInsert<"reports"> = {
      reporter_id: user.id,
      entity_type: input.entityType,
      reason: input.reason,
      description: description || null,
      listing_id: input.entityType === "listing" ? input.entityId : null,
      conversation_id:
        input.entityType === "conversation" ? input.entityId : null,
      message_id: input.entityType === "message" ? input.entityId : null,
      reported_user_id: input.entityType === "user" ? input.entityId : null,
    };

    const { data, error } = await supabase
      .from("reports")
      .insert(insert)
      .select("id")
      .single();

    if (error || !data) {
      console.error("Supabase report insert failed", error);
      return { reportId: null, error: "CREATE_REPORT_FAILED" };
    }

    return { reportId: data.id, error: null };
  } catch (error) {
    console.error("Supabase report insert failed", error);
    return { reportId: null, error: "CREATE_REPORT_FAILED" };
  }
}

export async function getReports(
  filters: ReportFilters,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { reports: [], source: "unavailable" as const };
  }

  try {
    let query = supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters.status && isReportStatus(filters.status)) {
      query = query.eq("status", filters.status);
    }

    if (filters.entityType && isReportEntityType(filters.entityType)) {
      query = query.eq("entity_type", filters.entityType);
    }

    if (filters.reason && isReportReason(filters.reason)) {
      query = query.eq("reason", filters.reason);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      console.error("Supabase reports query failed", error);
      return { reports: [], source: "unavailable" as const };
    }

    return {
      reports: await hydrateReports(data ?? [], supabase),
      source: "supabase" as const,
    };
  } catch (error) {
    console.error("Supabase reports query failed", error);
    return { reports: [], source: "unavailable" as const };
  }
}

export async function getReportById(
  id: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { report: null, source: "unavailable" as const };
  }

  try {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Supabase report detail failed", error);
      return { report: null, source: "unavailable" as const };
    }

    if (!data) {
      return { report: null, source: "supabase" as const };
    }

    const [summary] = await hydrateReports([data], supabase);

    if (!summary) {
      return { report: null, source: "supabase" as const };
    }

    return {
      report: {
        ...summary,
        target: await getReportTargetDetail(data, supabase),
      },
      source: "supabase" as const,
    };
  } catch (error) {
    console.error("Supabase report detail failed", error);
    return { report: null, source: "unavailable" as const };
  }
}

export async function updateReportStatus(
  id: string,
  status: Enums<"report_status">,
  adminId: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" };
  }

  const { error } = await supabase
    .from("reports")
    .update({
      status,
      assigned_admin_id: adminId,
      resolved_at:
        status === "resolved" || status === "dismissed"
          ? new Date().toISOString()
          : null,
    })
    .eq("id", id);

  return { error: error ? "UPDATE_REPORT_FAILED" : null };
}

export async function assignReportToCurrentAdmin(
  id: string,
  adminId: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" };
  }

  const { error } = await supabase
    .from("reports")
    .update({ assigned_admin_id: adminId })
    .eq("id", id);

  return { error: error ? "ASSIGN_REPORT_FAILED" : null };
}

async function getValidatedTarget(
  input: CreateReportInput,
  userId: string,
  supabase: SupabaseClient<Database>,
): Promise<{ targetColumn: keyof Tables<"reports">; error: string | null }> {
  if (input.entityType === "listing") {
    const { data, error } = await supabase
      .from("listings")
      .select("id, user_id, status")
      .eq("id", input.entityId)
      .maybeSingle();

    if (error || !data) {
      return { targetColumn: "listing_id", error: "TARGET_NOT_FOUND" };
    }

    if (data.user_id === userId) {
      return { targetColumn: "listing_id", error: "CANNOT_REPORT_OWN_LISTING" };
    }

    return { targetColumn: "listing_id", error: null };
  }

  if (input.entityType === "conversation") {
    const { data, error } = await supabase
      .from("conversations")
      .select("id, buyer_id, seller_id")
      .eq("id", input.entityId)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .maybeSingle();

    return {
      targetColumn: "conversation_id",
      error: error || !data ? "TARGET_NOT_FOUND" : null,
    };
  }

  if (input.entityType === "message") {
    const { data, error } = await supabase
      .from("messages")
      .select("id, sender_id, conversation_id")
      .eq("id", input.entityId)
      .maybeSingle();

    if (error || !data) {
      return { targetColumn: "message_id", error: "TARGET_NOT_FOUND" };
    }

    if (data.sender_id === userId) {
      return { targetColumn: "message_id", error: "CANNOT_REPORT_OWN_MESSAGE" };
    }

    const { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", data.conversation_id)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .maybeSingle();

    return {
      targetColumn: "message_id",
      error: conversation ? null : "TARGET_NOT_FOUND",
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", input.entityId)
    .maybeSingle();

  if (input.entityId === userId) {
    return { targetColumn: "reported_user_id", error: "CANNOT_REPORT_SELF" };
  }

  return {
    targetColumn: "reported_user_id",
    error: error || !data ? "TARGET_NOT_FOUND" : null,
  };
}

async function findOpenDuplicateReport(
  reporterId: string,
  entityType: Enums<"report_entity_type">,
  targetColumn: keyof Tables<"reports">,
  entityId: string,
  supabase: SupabaseClient<Database>,
) {
  const { data, error } = await supabase
    .from("reports")
    .select("id")
    .eq("reporter_id", reporterId)
    .eq("entity_type", entityType)
    .eq(targetColumn, entityId)
    .in("status", ["open", "in_review"])
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

async function hydrateReports(
  reports: Tables<"reports">[],
  supabase: SupabaseClient<Database>,
): Promise<ReportSummary[]> {
  if (reports.length === 0) {
    return [];
  }

  const reporterIds = Array.from(new Set(reports.map((report) => report.reporter_id)));
  const profiles = await getProfileMap(reporterIds, supabase);

  return Promise.all(
    reports.map(async (report) => {
      const target = await getReportTargetSummary(report, supabase);

      return {
        report,
        reporterName:
          profiles.get(report.reporter_id)?.display_name ?? "Utilizator TROKO",
        targetTitle: target.title,
        targetSubtitle: target.subtitle,
      };
    }),
  );
}

async function getProfileMap(
  userIds: string[],
  supabase: SupabaseClient<Database>,
) {
  const map = new Map<string, Pick<Tables<"profiles">, "display_name">>();

  if (userIds.length === 0) {
    return map;
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", userIds);

  for (const profile of data ?? []) {
    map.set(profile.id, profile);
  }

  return map;
}

async function getReportTargetSummary(
  report: Tables<"reports">,
  supabase: SupabaseClient<Database>,
) {
  if (report.entity_type === "listing" && report.listing_id) {
    const { data } = await supabase
      .from("listings")
      .select("title, city, status")
      .eq("id", report.listing_id)
      .maybeSingle();

    return {
      title: data?.title ?? "Anunț indisponibil",
      subtitle: data ? `${data.city} · ${data.status}` : "Fără detalii",
    };
  }

  if (report.entity_type === "conversation" && report.conversation_id) {
    const { data } = await supabase
      .from("conversations")
      .select("last_message_preview, status")
      .eq("id", report.conversation_id)
      .maybeSingle();

    return {
      title: "Conversație raportată",
      subtitle: data?.last_message_preview || data?.status || "Fără mesaje",
    };
  }

  if (report.entity_type === "message" && report.message_id) {
    const { data } = await supabase
      .from("messages")
      .select("body")
      .eq("id", report.message_id)
      .maybeSingle();

    return {
      title: "Mesaj raportat",
      subtitle: data?.body ? data.body.slice(0, 120) : "Fără conținut",
    };
  }

  if (report.entity_type === "user" && report.reported_user_id) {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, city")
      .eq("id", report.reported_user_id)
      .maybeSingle();

    return {
      title: data?.display_name ?? "Utilizator TROKO",
      subtitle: data?.city ?? "Profil raportat",
    };
  }

  return { title: "Țintă indisponibilă", subtitle: "Fără detalii" };
}

async function getReportTargetDetail(
  report: Tables<"reports">,
  supabase: SupabaseClient<Database>,
): Promise<ReportDetail["target"]> {
  if (report.entity_type === "listing" && report.listing_id) {
    const { data } = await supabase
      .from("listings")
      .select("id, title, slug, price_cents, currency, city, county, status, user_id")
      .eq("id", report.listing_id)
      .maybeSingle();

    if (!data) {
      return unavailableTarget("Anunț indisponibil");
    }

    return {
      title: data.title,
      description: `${data.city}, ${data.county}`,
      href: `/anunturi/${data.slug}`,
      listingId: data.id,
      metadata: [
        { label: "Status", value: data.status },
        {
          label: "Preț",
          value:
            data.price_cents === null
              ? "Nedisponibil"
              : `${Math.round(data.price_cents / 100)} ${data.currency}`,
        },
        { label: "Vânzător", value: data.user_id.slice(0, 8) },
      ],
    };
  }

  if (report.entity_type === "conversation" && report.conversation_id) {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", report.conversation_id)
      .maybeSingle();

    if (!data) {
      return unavailableTarget("Conversație indisponibilă");
    }

    return {
      title: "Conversație raportată",
      description: data.last_message_preview ?? "Fără mesaje încă.",
      listingId: data.listing_id,
      metadata: [
        { label: "Status", value: data.status },
        { label: "Cumpărător", value: data.buyer_id.slice(0, 8) },
        { label: "Vânzător", value: data.seller_id.slice(0, 8) },
      ],
    };
  }

  if (report.entity_type === "message" && report.message_id) {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("id", report.message_id)
      .maybeSingle();

    if (!data) {
      return unavailableTarget("Mesaj indisponibil");
    }

    return {
      title: "Mesaj raportat",
      description: data.body,
      metadata: [
        { label: "Expeditor", value: data.sender_id.slice(0, 8) },
        { label: "Conversație", value: data.conversation_id.slice(0, 8) },
      ],
    };
  }

  if (report.entity_type === "user" && report.reported_user_id) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", report.reported_user_id)
      .maybeSingle();

    if (!data) {
      return unavailableTarget("Utilizator indisponibil");
    }

    return {
      title: data.display_name ?? "Utilizator TROKO",
      description: data.city ? `${data.city}, ${data.county ?? ""}` : "Profil TROKO",
      metadata: [
        { label: "Business", value: data.is_business ? "Da" : "Nu" },
        { label: "Creat", value: data.created_at },
      ],
    };
  }

  return unavailableTarget("Țintă indisponibilă");
}

function unavailableTarget(title: string): ReportDetail["target"] {
  return {
    title,
    description: "Nu am putut încărca detaliile.",
    metadata: [],
  };
}
