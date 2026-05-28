import { NextResponse, type NextRequest } from "next/server";

import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const callbackError = requestUrl.searchParams.get("error");
  const next = getSafeRedirectPath(requestUrl.searchParams.get("next"));
  const isAccountConfirmation = next === "/confirmare-cont";
  let activationStatus: "success" | "failed" = "failed";

  if (code && !callbackError) {
    const supabase = await createClient();

    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      activationStatus = error ? "failed" : "success";
    }
  }

  const redirectUrl = new URL(
    isAccountConfirmation ? "/confirmare-cont" : next,
    requestUrl.origin,
  );

  if (isAccountConfirmation) {
    redirectUrl.searchParams.set("status", activationStatus);
  }

  return NextResponse.redirect(redirectUrl);
}
