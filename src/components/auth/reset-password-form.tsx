"use client";

import { useState } from "react";
import { MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAuthErrorMessage, isValidEmail } from "@/components/auth/auth-form-utils";
import { createClient } from "@/lib/supabase/browser";

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!isValidEmail(email)) {
      setError("Introdu un email valid.");
      return;
    }

    const supabase = createClient();

    if (!supabase) {
      setError("Conectarea Supabase nu este configurată local.");
      return;
    }

    setPending(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/actualizeaza-parola`,
      },
    );
    setPending(false);

    if (resetError) {
      setError(getAuthErrorMessage(resetError.message));
      return;
    }

    setSuccess(
      "Ți-am trimis un email cu instrucțiuni pentru resetarea parolei.",
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-bold text-foreground">
          Email
        </span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="email@exemplu.ro"
          autoComplete="email"
          className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>

      {error ? (
        <p className="rounded-[1rem] border border-destructive/20 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-[1rem] border border-[#D5E4DF] bg-[#E8F1EE] p-3 text-sm font-semibold text-primary">
          {success}
        </p>
      ) : null}

      <Button
        disabled={pending}
        className="h-12 rounded-full bg-primary font-bold text-primary-foreground"
      >
        <MailCheck className="size-4" aria-hidden="true" />
        {pending ? "Se trimite..." : "Trimite email de resetare"}
      </Button>
    </form>
  );
}
