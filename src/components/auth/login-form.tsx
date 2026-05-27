"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAuthErrorMessage, isValidEmail } from "@/components/auth/auth-form-utils";
import { createClient } from "@/lib/supabase/browser";

export function LoginForm({
  redirectTo = "/cont",
  onCreateAccount,
}: {
  redirectTo?: string;
  onCreateAccount?: () => void;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Introdu un email valid.");
      return;
    }

    if (!password) {
      setError("Introdu parola.");
      return;
    }

    const supabase = createClient();

    if (!supabase) {
      setError("Conectarea Supabase nu este configurată local.");
      return;
    }

    setPending(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setPending(false);

    if (signInError) {
      setError(getAuthErrorMessage(signInError.message));
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <Field label="Email">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="email@exemplu.ro"
          autoComplete="email"
          className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </Field>

      <Field label="Parolă">
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Parola contului"
          autoComplete="current-password"
          className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </Field>

      {error ? (
        <p className="rounded-[1rem] border border-destructive/20 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
          {error}
        </p>
      ) : null}

      <Button
        disabled={pending}
        className="h-12 rounded-full bg-primary font-bold text-primary-foreground"
      >
        <LogIn className="size-4" aria-hidden="true" />
        {pending ? "Se conectează..." : "Intră în cont"}
      </Button>

      <div className="flex flex-col gap-2 text-sm font-semibold text-muted-foreground sm:flex-row sm:justify-between">
        {onCreateAccount ? (
          <button
            type="button"
            onClick={onCreateAccount}
            className="text-left hover:text-foreground"
          >
            Creează cont
          </button>
        ) : (
          <Link href="/inregistrare" className="hover:text-foreground">
            Creează cont
          </Link>
        )}
        <Link href="/resetare-parola" className="hover:text-foreground">
          Ai uitat parola?
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
