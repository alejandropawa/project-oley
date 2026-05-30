"use client";

import Link from "next/link";
import { useState } from "react";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAuthErrorMessage } from "@/components/auth/auth-form-utils";
import { createClient } from "@/lib/supabase/browser";

export function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Parola trebuie să aibă minimum 8 caractere.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Parolele nu coincid.");
      return;
    }

    const supabase = createClient();

    if (!supabase) {
      setError("Conectarea Supabase nu este configurată local.");
      return;
    }

    setPending(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });
    setPending(false);

    if (updateError) {
      setError(getAuthErrorMessage(updateError.message));
      return;
    }

    setSuccess("Parola a fost actualizată.");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-foreground">
          Parolă nouă
        </span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Minimum 8 caractere"
          autoComplete="new-password"
          className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-foreground">
          Confirmă parola nouă
        </span>
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Repetă parola"
          autoComplete="new-password"
          className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>

      {error ? (
        <p className="rounded-[1rem] border border-destructive/20 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
          {error}
        </p>
      ) : null}

      {success ? (
        <div className="rounded-[1rem] border border-brand-border bg-brand-soft p-3 text-sm font-semibold text-primary">
          <p>{success}</p>
          <Link href="/cont" className="mt-1 inline-block underline">
            Mergi la cont
          </Link>
        </div>
      ) : null}

      <Button
        disabled={pending}
        className="h-12 rounded-full bg-action font-semibold text-action-foreground hover:bg-action-hover"
      >
        <KeyRound className="size-4" aria-hidden="true" />
        {pending ? "Se actualizează..." : "Actualizează parola"}
      </Button>
    </form>
  );
}
