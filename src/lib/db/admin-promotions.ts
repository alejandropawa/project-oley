import type { SupabaseClient } from "@supabase/supabase-js";

import { requireAdmin } from "@/lib/db/admin";
import { getPublicListingImageUrl } from "@/lib/db/storage";
import { mapDbListingToListing, type DbListingWithImages } from "@/lib/listings/mappers";
import type { Listing } from "@/lib/mock-data";
import type { Database, Enums, Tables, TablesInsert } from "@/types/database";

export type AdminPromotionFilters = {
  status?: string;
  packageId?: string;
  date?: string;
};

export type AdminPromotionOrder = Tables<"promotion_orders"> & {
  package: Tables<"promotion_packages"> | null;
  listing: Listing | null;
  userDisplayName: string;
};

export type AdminListingPromotion = Tables<"listing_promotions"> & {
  package: Tables<"promotion_packages"> | null;
  listing: Listing | null;
};

type DbAdminPromotionOrder = Tables<"promotion_orders"> & {
  promotion_packages?: Tables<"promotion_packages"> | null;
  listings?: DbListingWithImages | null;
};

type DbAdminListingPromotion = Tables<"listing_promotions"> & {
  promotion_packages?: Tables<"promotion_packages"> | null;
  listings?: DbListingWithImages | null;
};

export async function getPromotionOrdersForAdmin(
  filters: AdminPromotionFilters,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { orders: [], source: "unavailable" as const };
  }

  try {
    let query = supabase
      .from("promotion_orders")
      .select(
        "*, promotion_packages(*), listings(*, listing_images(storage_path, sort_order, alt_text))",
      )
      .order("created_at", { ascending: false });

    if (filters.status && isPromotionOrderStatus(filters.status)) {
      query = query.eq("status", filters.status);
    }

    if (filters.packageId) {
      query = query.eq("package_id", filters.packageId);
    }

    const createdAfter = getCreatedAfter(filters.date);

    if (createdAfter) {
      query = query.gte("created_at", createdAfter);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      console.error("Supabase admin promotion orders failed", error);
      return { orders: [], source: "unavailable" as const };
    }

    const rows = (data ?? []) as unknown as DbAdminPromotionOrder[];
    const userIds = Array.from(new Set(rows.map((row) => row.user_id)));
    const displayNames = await getDisplayNames(userIds, supabase);

    return {
      orders: rows.map((row) => mapAdminOrder(row, displayNames, supabase)),
      source: "supabase" as const,
    };
  } catch (error) {
    console.error("Supabase admin promotion orders failed", error);
    return { orders: [], source: "unavailable" as const };
  }
}

export async function getPromotionOrderById(
  orderId: string,
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { order: null, source: "unavailable" as const };
  }

  try {
    const { data, error } = await supabase
      .from("promotion_orders")
      .select(
        "*, promotion_packages(*), listings(*, listing_images(storage_path, sort_order, alt_text))",
      )
      .eq("id", orderId)
      .maybeSingle();

    if (error) {
      console.error("Supabase admin promotion order detail failed", error);
      return { order: null, source: "unavailable" as const };
    }

    if (!data) {
      return { order: null, source: "supabase" as const };
    }

    const row = data as unknown as DbAdminPromotionOrder;
    const displayNames = await getDisplayNames([row.user_id], supabase);

    return {
      order: mapAdminOrder(row, displayNames, supabase),
      source: "supabase" as const,
    };
  } catch (error) {
    console.error("Supabase admin promotion order detail failed", error);
    return { order: null, source: "unavailable" as const };
  }
}

export async function getActivePromotionsForAdmin(
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { promotions: [], source: "unavailable" as const };
  }

  try {
    const { data, error } = await supabase
      .from("listing_promotions")
      .select(
        "*, promotion_packages(*), listings(*, listing_images(storage_path, sort_order, alt_text))",
      )
      .in("status", ["active", "scheduled"])
      .order("ends_at", { ascending: true })
      .limit(100);

    if (error) {
      console.error("Supabase admin listing promotions failed", error);
      return { promotions: [], source: "unavailable" as const };
    }

    return {
      promotions: ((data ?? []) as unknown as DbAdminListingPromotion[]).map((row) =>
        mapAdminListingPromotion(row, supabase),
      ),
      source: "supabase" as const,
    };
  } catch (error) {
    console.error("Supabase admin listing promotions failed", error);
    return { promotions: [], source: "unavailable" as const };
  }
}

export async function approvePromotionOrder(
  orderId: string,
  supabase: SupabaseClient<Database> | null,
) {
  const admin = await requireAdmin(supabase);

  if (admin.error || !admin.user || !supabase) {
    return { promotionId: null, error: admin.error ?? "ADMIN_UNAVAILABLE" };
  }

  const detail = await getPromotionOrderById(orderId, supabase);

  if (detail.source === "unavailable" || !detail.order) {
    return { promotionId: null, error: "ORDER_NOT_FOUND" };
  }

  const order = detail.order;

  if (order.status !== "pending_review") {
    return { promotionId: null, error: "ORDER_NOT_PENDING" };
  }

  if (!order.package || !order.listing || order.listing.status !== "active") {
    return { promotionId: null, error: "ORDER_NOT_APPROVABLE" };
  }

  const now = new Date();
  const endsAt = new Date(now);
  endsAt.setDate(endsAt.getDate() + order.package.duration_days);

  const promotionInsert: TablesInsert<"listing_promotions"> = {
    listing_id: order.listing_id,
    user_id: order.user_id,
    package_id: order.package_id,
    order_id: order.id,
    type: order.package.type,
    status: "active",
    starts_at: now.toISOString(),
    ends_at: endsAt.toISOString(),
  };

  const { data: promotion, error: promotionError } = await supabase
    .from("listing_promotions")
    .insert(promotionInsert)
    .select("id")
    .single();

  if (promotionError || !promotion) {
    console.error("Supabase create listing promotion failed", promotionError);
    return { promotionId: null, error: "CREATE_PROMOTION_FAILED" };
  }

  const { error: orderError } = await supabase
    .from("promotion_orders")
    .update({
      status: "approved",
      reviewed_by: admin.user.id,
      reviewed_at: now.toISOString(),
    })
    .eq("id", order.id);

  if (orderError) {
    console.error("Supabase approve promotion order failed", orderError);
    return { promotionId: promotion.id, error: "APPROVE_ORDER_FAILED" };
  }

  return {
    promotionId: promotion.id,
    listingSlug: order.listing.slug,
    userId: order.user_id,
    listingTitle: order.listing.title,
    packageName: order.package.name,
    endsAt: endsAt.toISOString(),
    error: null,
  };
}

export async function rejectPromotionOrder(
  orderId: string,
  adminNote: string,
  supabase: SupabaseClient<Database> | null,
) {
  const admin = await requireAdmin(supabase);

  if (admin.error || !admin.user || !supabase) {
    return { error: admin.error ?? "ADMIN_UNAVAILABLE" };
  }

  const cleanNote = adminNote.trim();

  if (!cleanNote) {
    return { error: "ADMIN_NOTE_REQUIRED" };
  }

  if (cleanNote.length > 2000) {
    return { error: "ADMIN_NOTE_TOO_LONG" };
  }

  const detail = await getPromotionOrderById(orderId, supabase);
  const order = detail.order;

  const { error } = await supabase
    .from("promotion_orders")
    .update({
      status: "rejected",
      admin_note: cleanNote,
      reviewed_by: admin.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("status", "pending_review");

  if (error) {
    console.error("Supabase reject promotion order failed", error);
    return { error: "REJECT_ORDER_FAILED" };
  }

  return {
    error: null,
    userId: order?.user_id,
    listingTitle: order?.listing?.title,
    adminNote: cleanNote,
  };
}

export async function expireListingPromotion(
  promotionId: string,
  supabase: SupabaseClient<Database> | null,
) {
  const admin = await requireAdmin(supabase);

  if (admin.error || !supabase) {
    return { error: admin.error ?? "ADMIN_UNAVAILABLE" };
  }

  const { error } = await supabase
    .from("listing_promotions")
    .update({ status: "expired" })
    .eq("id", promotionId);

  return { error: error ? "EXPIRE_PROMOTION_FAILED" : null };
}

export async function expireOldPromotions(
  supabase: SupabaseClient<Database> | null,
) {
  if (!supabase) {
    return { error: "SUPABASE_NOT_CONFIGURED" as const };
  }

  const { error } = await supabase
    .from("listing_promotions")
    .update({ status: "expired" })
    .eq("status", "active")
    .lt("ends_at", new Date().toISOString());

  return { error: error ? ("EXPIRE_PROMOTIONS_FAILED" as const) : null };
}

function mapAdminOrder(
  row: DbAdminPromotionOrder,
  displayNames: Map<string, string>,
  supabase: SupabaseClient<Database>,
): AdminPromotionOrder {
  return {
    ...row,
    package: row.promotion_packages ?? null,
    listing: row.listings
      ? mapDbListingToListing(row.listings, (path) =>
          getPublicListingImageUrl(supabase, path),
        )
      : null,
    userDisplayName: displayNames.get(row.user_id) ?? "Utilizator TROKO",
  };
}

function mapAdminListingPromotion(
  row: DbAdminListingPromotion,
  supabase: SupabaseClient<Database>,
): AdminListingPromotion {
  return {
    ...row,
    package: row.promotion_packages ?? null,
    listing: row.listings
      ? mapDbListingToListing(row.listings, (path) =>
          getPublicListingImageUrl(supabase, path),
        )
      : null,
  };
}

async function getDisplayNames(
  userIds: string[],
  supabase: SupabaseClient<Database>,
) {
  const names = new Map<string, string>();

  if (userIds.length === 0) {
    return names;
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", userIds);

  for (const profile of data ?? []) {
    names.set(profile.id, profile.display_name ?? "Utilizator TROKO");
  }

  return names;
}

function isPromotionOrderStatus(
  value: string,
): value is Enums<"promotion_order_status"> {
  return [
    "draft",
    "pending_review",
    "approved",
    "rejected",
    "cancelled",
  ].includes(value);
}

function getCreatedAfter(dateFilter?: string) {
  if (!dateFilter) {
    return null;
  }

  const date = new Date();

  if (dateFilter === "today") {
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  }

  if (dateFilter === "7d") {
    date.setDate(date.getDate() - 7);
    return date.toISOString();
  }

  if (dateFilter === "30d") {
    date.setDate(date.getDate() - 30);
    return date.toISOString();
  }

  return null;
}
