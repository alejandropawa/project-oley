import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Enums, Tables } from "@/types/database";

export type AdminCheckResult = {
  user: User | null;
  isAdmin: boolean;
  source: "supabase" | "unavailable";
};

export type AdminStats = {
  openReports: number;
  inReviewReports: number;
  activeListings: number;
  archivedListings: number;
  conversationReports: number;
  userReports: number;
};

export type AdminUserSummary = {
  profile: Tables<"profiles">;
  listingCount: number;
  reportCount: number;
};

export type AdminListingFilters = {
  status?: string;
  category?: string;
  city?: string;
  reportedOnly?: boolean;
};

export type AdminListingSummary = {
  listing: Tables<"listings">;
  ownerName: string;
  reportCount: number;
};

export async function isCurrentUserAdmin(
  supabase: SupabaseClient<Database> | null,
): Promise<AdminCheckResult> {
  if (!supabase) {
    return { user: null, isAdmin: false, source: "unavailable" };
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { user: null, isAdmin: false, source: "supabase" };
    }

    const { data, error } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Supabase admin check failed", error);
      return { user, isAdmin: false, source: "unavailable" };
    }

    return { user, isAdmin: Boolean(data), source: "supabase" };
  } catch (error) {
    console.error("Supabase admin check failed", error);
    return { user: null, isAdmin: false, source: "unavailable" };
  }
}

export async function requireAdmin(supabase: SupabaseClient<Database> | null) {
  const result = await isCurrentUserAdmin(supabase);

  if (!result.user) {
    return { user: null, error: "NOT_AUTHENTICATED" as const };
  }

  if (result.source === "unavailable") {
    return { user: result.user, error: "ADMIN_UNAVAILABLE" as const };
  }

  if (!result.isAdmin) {
    return { user: result.user, error: "NOT_ADMIN" as const };
  }

  return { user: result.user, error: null };
}

export async function getAdminStats(
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { stats: emptyStats(), source: "unavailable" as const };
  }

  try {
    const [
      openReports,
      inReviewReports,
      activeListings,
      archivedListings,
      conversationReports,
      userReports,
    ] = await Promise.all([
      getCount(supabase, "reports", { status: "open" }),
      getCount(supabase, "reports", { status: "in_review" }),
      getCount(supabase, "listings", { status: "active" }),
      getCount(supabase, "listings", { status: "archived" }),
      getCount(supabase, "reports", { entity_type: "conversation" }),
      getCount(supabase, "reports", { entity_type: "user" }),
    ]);

    return {
      stats: {
        openReports,
        inReviewReports,
        activeListings,
        archivedListings,
        conversationReports,
        userReports,
      },
      source: "supabase" as const,
    };
  } catch (error) {
    console.error("Supabase admin stats failed", error);
    return { stats: emptyStats(), source: "unavailable" as const };
  }
}

export async function getAdminUsers(
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { users: [], source: "unavailable" as const };
  }

  try {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Supabase admin users failed", error);
      return { users: [], source: "unavailable" as const };
    }

    const profileRows = profiles ?? [];
    const userIds = profileRows.map((profile) => profile.id);
    const [listingCounts, reportCounts] = await Promise.all([
      getListingCountsByOwner(supabase, userIds),
      getReportCountsByReportedUser(supabase, userIds),
    ]);

    return {
      users: profileRows.map((profile) => ({
        profile,
        listingCount: listingCounts.get(profile.id) ?? 0,
        reportCount: reportCounts.get(profile.id) ?? 0,
      })),
      source: "supabase" as const,
    };
  } catch (error) {
    console.error("Supabase admin users failed", error);
    return { users: [], source: "unavailable" as const };
  }
}

export async function getAdminListings(
  filters: AdminListingFilters,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { listings: [], source: "unavailable" as const };
  }

  try {
    let query = supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters.status && isListingStatus(filters.status)) {
      query = query.eq("status", filters.status);
    }

    if (filters.category) {
      query = query.eq("category_slug", filters.category);
    }

    if (filters.city) {
      query = query.eq("city", filters.city);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      console.error("Supabase admin listings failed", error);
      return { listings: [], source: "unavailable" as const };
    }

    const listings = data ?? [];
    const ownerIds = Array.from(new Set(listings.map((listing) => listing.user_id)));
    const listingIds = listings.map((listing) => listing.id);
    const [owners, reportCounts] = await Promise.all([
      getOwnerNames(ownerIds, supabase),
      getReportCountsByListing(supabase, listingIds),
    ]);

    const rows = listings
      .map((listing) => ({
        listing,
        ownerName: owners.get(listing.user_id) ?? "Utilizator TROKO",
        reportCount: reportCounts.get(listing.id) ?? 0,
      }))
      .filter((row) => !filters.reportedOnly || row.reportCount > 0);

    return { listings: rows, source: "supabase" as const };
  } catch (error) {
    console.error("Supabase admin listings failed", error);
    return { listings: [], source: "unavailable" as const };
  }
}

async function getCount(
  supabase: SupabaseClient<Database>,
  table: "reports" | "listings",
  equals: Record<string, string>,
) {
  let query = supabase.from(table).select("*", {
    count: "exact",
    head: true,
  });

  for (const [key, value] of Object.entries(equals)) {
    query = query.eq(key, value);
  }

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count ?? 0;
}

async function getListingCountsByOwner(
  supabase: SupabaseClient<Database>,
  userIds: string[],
) {
  const counts = new Map<string, number>();

  await Promise.all(
    userIds.map(async (userId) => {
      const { count, error } = await supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (!error) {
        counts.set(userId, count ?? 0);
      }
    }),
  );

  return counts;
}

async function getReportCountsByReportedUser(
  supabase: SupabaseClient<Database>,
  userIds: string[],
) {
  const counts = new Map<string, number>();

  await Promise.all(
    userIds.map(async (userId) => {
      const { count, error } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("reported_user_id", userId);

      if (!error) {
        counts.set(userId, count ?? 0);
      }
    }),
  );

  return counts;
}

async function getReportCountsByListing(
  supabase: SupabaseClient<Database>,
  listingIds: string[],
) {
  const counts = new Map<string, number>();

  await Promise.all(
    listingIds.map(async (listingId) => {
      const { count, error } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("listing_id", listingId);

      if (!error) {
        counts.set(listingId, count ?? 0);
      }
    }),
  );

  return counts;
}

async function getOwnerNames(
  ownerIds: string[],
  supabase: SupabaseClient<Database>,
) {
  const owners = new Map<string, string>();

  if (ownerIds.length === 0) {
    return owners;
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", ownerIds);

  for (const profile of data ?? []) {
    owners.set(profile.id, profile.display_name ?? "Utilizator TROKO");
  }

  return owners;
}

function emptyStats(): AdminStats {
  return {
    openReports: 0,
    inReviewReports: 0,
    activeListings: 0,
    archivedListings: 0,
    conversationReports: 0,
    userReports: 0,
  };
}

function isListingStatus(value: string): value is Enums<"listing_status"> {
  return ["draft", "active", "reserved", "sold", "expired", "archived"].includes(
    value,
  );
}
