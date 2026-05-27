"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/db/admin";
import {
  awardTrustBadge,
  removeTrustBadge,
} from "@/lib/db/trust";
import {
  approveVerificationRequest,
  rejectVerificationRequest,
} from "@/lib/db/verification";
import { updateReviewStatusForAdmin } from "@/lib/db/reviews";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";

export type AdminTrustActionResult = {
  success: boolean;
  error?: string;
};

export async function approveVerificationRequestAction(
  requestId: string,
): Promise<AdminTrustActionResult> {
  const supabase = await createClient();
  const result = await approveVerificationRequest(requestId, supabase);

  if (result.error) {
    return { success: false, error: getAdminTrustError(result.error) };
  }

  revalidateAdminTrust();
  return { success: true };
}

export async function rejectVerificationRequestAction(
  requestId: string,
  note: string,
): Promise<AdminTrustActionResult> {
  const supabase = await createClient();
  const result = await rejectVerificationRequest(requestId, note, supabase);

  if (result.error) {
    return { success: false, error: getAdminTrustError(result.error) };
  }

  revalidateAdminTrust();
  return { success: true };
}

export async function updateReviewStatusForAdminAction(input: {
  reviewId: string;
  status: Enums<"review_status">;
  adminNote?: string | null;
}): Promise<AdminTrustActionResult> {
  const supabase = await createClient();
  const admin = await requireAdmin(supabase);

  if (admin.error) {
    return { success: false, error: getAdminTrustError(admin.error) };
  }

  const result = await updateReviewStatusForAdmin(
    input.reviewId,
    input.status,
    input.adminNote ?? null,
    supabase,
  );

  if (result.error) {
    return { success: false, error: getAdminTrustError(result.error) };
  }

  revalidateAdminTrust();
  return { success: true };
}

export async function awardTrustedSellerBadgeAction(
  userId: string,
): Promise<AdminTrustActionResult> {
  const supabase = await createClient();
  const admin = await requireAdmin(supabase);

  if (admin.error || !admin.user) {
    return { success: false, error: getAdminTrustError(admin.error ?? "NOT_ADMIN") };
  }

  const result = await awardTrustBadge(userId, "trusted_seller", supabase, {
    awardedBy: admin.user.id,
  });

  if (result.error) {
    return { success: false, error: getAdminTrustError(result.error) };
  }

  await supabase
    ?.from("profiles")
    .update({ is_verified_seller: true })
    .eq("id", userId);

  revalidateAdminTrust();
  return { success: true };
}

export async function removeTrustedSellerBadgeAction(
  userId: string,
): Promise<AdminTrustActionResult> {
  const supabase = await createClient();
  const admin = await requireAdmin(supabase);

  if (admin.error) {
    return { success: false, error: getAdminTrustError(admin.error) };
  }

  const result = await removeTrustBadge(userId, "trusted_seller", supabase);

  if (result.error) {
    return { success: false, error: getAdminTrustError(result.error) };
  }

  await supabase
    ?.from("profiles")
    .update({ is_verified_seller: false })
    .eq("id", userId);

  revalidateAdminTrust();
  return { success: true };
}

function revalidateAdminTrust() {
  revalidatePath("/admin/incredere");
  revalidatePath("/cont/incredere");
  revalidatePath("/cont/review-uri");
}

function getAdminTrustError(error: string | null) {
  if (error === "NOT_AUTHENTICATED") {
    return "Intra in cont pentru administrare.";
  }

  if (error === "NOT_ADMIN") {
    return "Nu ai acces admin.";
  }

  if (error === "ADMIN_UNAVAILABLE" || error === "SUPABASE_NOT_CONFIGURED") {
    return "Adminul este disponibil dupa configurarea Supabase.";
  }

  return "Nu am putut actualiza zona de incredere.";
}

