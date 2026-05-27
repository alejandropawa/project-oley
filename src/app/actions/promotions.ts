"use server";

import { revalidatePath } from "next/cache";

import { notifyUser } from "@/lib/db/notifications";
import { createPromotionOrder } from "@/lib/db/promotions";
import { createClient } from "@/lib/supabase/server";

export type PromotionActionResult = {
  success: boolean;
  error?: string;
  orderId?: string;
  listingSlug?: string;
};

export async function createPromotionOrderAction({
  listingId,
  packageId,
  note,
}: {
  listingId: string;
  packageId: string;
  note?: string;
}): Promise<PromotionActionResult> {
  const supabase = await createClient();
  const result = await createPromotionOrder(
    {
      listingId,
      packageId,
      note,
    },
    supabase,
  );

  if (result.error) {
    return { success: false, error: getPromotionError(result.error) };
  }

  if (result.userId) {
    await notifyUser(
      {
        userId: result.userId,
        type: "promotion_order_created",
        title: "Solicitarea de promovare a fost trimisă",
        body: result.listingTitle
          ? `Am primit solicitarea pentru ${result.listingTitle}.`
          : "Am primit solicitarea ta de promovare.",
        actionUrl: "/cont/promovari",
        data: {
          order_id: result.orderId,
          listing_slug: result.listingSlug,
        },
        emailData: {
          listingTitle: result.listingTitle,
        },
      },
      supabase,
    );
  }

  revalidatePath("/cont/anunturi");
  revalidatePath("/cont/promovari");
  revalidatePath("/admin/promovari");
  revalidatePath("/notificari");

  return {
    success: true,
    orderId: result.orderId ?? undefined,
    listingSlug: result.listingSlug,
  };
}

function getPromotionError(error: string) {
  if (error === "SUPABASE_NOT_CONFIGURED") {
    return "Promovările reale vor fi disponibile după configurarea Supabase.";
  }

  if (error === "NOT_AUTHENTICATED") {
    return "Intră în cont pentru a trimite solicitarea.";
  }

  if (error === "LISTING_NOT_FOUND") {
    return "Nu am găsit anunțul sau nu îți aparține.";
  }

  if (error === "LISTING_NOT_ACTIVE") {
    return "Doar anunțurile active pot fi promovate.";
  }

  if (error === "PACKAGE_NOT_FOUND") {
    return "Pachetul ales nu mai este disponibil.";
  }

  if (error === "NOTE_TOO_LONG") {
    return "Nota poate avea maximum 1200 de caractere.";
  }

  return "Nu am putut trimite solicitarea de promovare.";
}
