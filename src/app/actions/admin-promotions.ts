"use server";

import { revalidatePath } from "next/cache";

import {
  approvePromotionOrder,
  expireListingPromotion,
  rejectPromotionOrder,
} from "@/lib/db/admin-promotions";
import { notifyUser } from "@/lib/db/notifications";
import { formatPromotionDate } from "@/lib/promotions/labels";
import { createClient } from "@/lib/supabase/server";

export type AdminPromotionActionResult = {
  success: boolean;
  error?: string;
};

export async function approvePromotionOrderAction({
  orderId,
}: {
  orderId: string;
}): Promise<AdminPromotionActionResult> {
  const supabase = await createClient();
  const result = await approvePromotionOrder(orderId, supabase);

  if (result.error) {
    return { success: false, error: getAdminPromotionError(result.error) };
  }

  if (result.userId) {
    await notifyUser(
      {
        userId: result.userId,
        type: "promotion_order_approved",
        title: "Promovarea anunțului tău a fost aprobată",
        body: result.listingTitle
          ? `${result.listingTitle} este acum promovat.`
          : "Promovarea anunțului tău este activă.",
        actionUrl: "/cont/promovari",
        data: {
          promotion_id: result.promotionId,
          listing_slug: result.listingSlug,
        },
        emailData: {
          listingTitle: result.listingTitle,
          packageName: result.packageName,
          endsAt: result.endsAt ? formatPromotionDate(result.endsAt) : undefined,
        },
      },
      supabase,
    );
  }

  revalidatePromotionPaths(result.listingSlug);
  return { success: true };
}

export async function rejectPromotionOrderAction({
  orderId,
  adminNote,
}: {
  orderId: string;
  adminNote: string;
}): Promise<AdminPromotionActionResult> {
  const supabase = await createClient();
  const result = await rejectPromotionOrder(orderId, adminNote, supabase);

  if (result.error) {
    return { success: false, error: getAdminPromotionError(result.error) };
  }

  if (result.userId) {
    await notifyUser(
      {
        userId: result.userId,
        type: "promotion_order_rejected",
        title: "Solicitarea de promovare a fost respinsă",
        body: result.listingTitle
          ? `Solicitarea pentru ${result.listingTitle} a fost respinsă.`
          : "Solicitarea ta de promovare a fost respinsă.",
        actionUrl: "/cont/promovari",
        data: {
          order_id: orderId,
        },
        emailData: {
          listingTitle: result.listingTitle,
          adminNote: result.adminNote,
        },
      },
      supabase,
    );
  }

  revalidatePromotionPaths();
  return { success: true };
}

export async function expireListingPromotionAction({
  promotionId,
}: {
  promotionId: string;
}): Promise<AdminPromotionActionResult> {
  const supabase = await createClient();
  const result = await expireListingPromotion(promotionId, supabase);

  if (result.error) {
    return { success: false, error: getAdminPromotionError(result.error) };
  }

  revalidatePromotionPaths();
  return { success: true };
}

function revalidatePromotionPaths(listingSlug?: string) {
  revalidatePath("/admin/promovari");
  revalidatePath("/cont/promovari");
  revalidatePath("/cont/anunturi");
  revalidatePath("/notificari");
  revalidatePath("/anunturi");
  revalidatePath("/categorii");
  revalidatePath("/orase");

  if (listingSlug) {
    revalidatePath(`/anunturi/${listingSlug}`);
  }
}

function getAdminPromotionError(error: string) {
  if (error === "NOT_AUTHENTICATED") {
    return "Intră în cont pentru a continua.";
  }

  if (error === "NOT_ADMIN") {
    return "Nu ai acces la zona de administrare.";
  }

  if (error === "ADMIN_UNAVAILABLE") {
    return "Admin dashboard-ul va fi disponibil după configurarea Supabase.";
  }

  if (error === "ORDER_NOT_PENDING") {
    return "Solicitarea nu mai este în analiză.";
  }

  if (error === "ADMIN_NOTE_REQUIRED") {
    return "Scrie o notă internă pentru respingere.";
  }

  if (error === "ADMIN_NOTE_TOO_LONG") {
    return "Nota poate avea maximum 2000 de caractere.";
  }

  return "Nu am putut actualiza promovarea.";
}
