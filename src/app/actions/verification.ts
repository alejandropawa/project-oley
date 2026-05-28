"use server";

import { revalidatePath } from "next/cache";

import { createPhoneVerificationRequest } from "@/lib/db/verification";
import { createClient } from "@/lib/supabase/server";

export type VerificationActionResult = {
  success: boolean;
  error?: string;
};

export async function createPhoneVerificationRequestAction(input: {
  phone: string;
  note?: string;
}): Promise<VerificationActionResult> {
  const supabase = await createClient();
  const result = await createPhoneVerificationRequest(input, supabase);

  if (result.error) {
    return { success: false, error: getVerificationError(result.error) };
  }

  revalidatePath("/cont/incredere");
  return { success: true };
}

function getVerificationError(error: string) {
  if (error === "NOT_AUTHENTICATED") {
    return "Intra in cont pentru a cere verificarea.";
  }

  if (error === "SUPABASE_NOT_CONFIGURED") {
    return "Verificarile vor fi disponibile dupa configurarea Supabase.";
  }

  if (error === "INVALID_PHONE") {
    return "Introdu un numar de telefon valid.";
  }

  if (error === "REQUEST_ALREADY_PENDING") {
    return "Ai deja o cerere de verificare in analiza.";
  }

  return "Nu am putut trimite cererea de verificare.";
}
