export type SendProviderEmailInput = {
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
};

export type SendProviderEmailResult =
  | { status: "sent"; providerMessageId: string | null }
  | { status: "skipped"; reason: string }
  | { status: "failed"; error: string };

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function getEmailFrom() {
  return process.env.EMAIL_FROM?.trim() || "TROKO <no-reply@troko.ro>";
}

export async function sendProviderEmail(
  input: SendProviderEmailInput,
): Promise<SendProviderEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.info("TROKO email sending skipped: RESEND_API_KEY is not configured.");
    }

    return { status: "skipped", reason: "Email provider not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: input.from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });

    const payload = (await response.json().catch(() => null)) as {
      id?: string;
      message?: string;
    } | null;

    if (!response.ok) {
      console.error("Resend email failed", payload?.message ?? response.statusText);
      return {
        status: "failed",
        error: payload?.message ?? "Resend request failed",
      };
    }

    return { status: "sent", providerMessageId: payload?.id ?? null };
  } catch (error) {
    console.error("Resend email failed", error);
    return { status: "failed", error: "Email provider request failed" };
  }
}
