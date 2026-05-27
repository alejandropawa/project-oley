"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAuthErrorMessage, isValidEmail } from "@/components/auth/auth-form-utils";
import { createClient } from "@/lib/supabase/browser";

type RegisterErrors = Partial<{
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: string;
  form: string;
}>;

export function RegisterForm({ onLogin }: { onLogin?: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess("");
    const nextErrors = validateRegister({
      name,
      email,
      password,
      confirmPassword,
      terms,
    });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const supabase = createClient();

    if (!supabase) {
      setErrors({ form: "Conectarea Supabase nu este configurată local." });
      return;
    }

    setPending(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name.trim(),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
    setPending(false);

    if (error) {
      setErrors({ form: getAuthErrorMessage(error.message) });
      return;
    }

    setErrors({});

    if (data.session) {
      router.push("/onboarding");
      router.refresh();
      return;
    }

    setSuccess("Cont creat. Verifică emailul pentru confirmare.");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <Field label="Nume afișat" error={errors.name}>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="ex. Andrei Pop"
          autoComplete="name"
          className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </Field>

      <Field label="Email" error={errors.email}>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="email@exemplu.ro"
          autoComplete="email"
          className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </Field>

      <Field label="Parolă" error={errors.password}>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Minimum 8 caractere"
          autoComplete="new-password"
          className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </Field>

      <Field label="Confirmă parola" error={errors.confirmPassword}>
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Repetă parola"
          autoComplete="new-password"
          className="h-12 w-full rounded-[1rem] border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </Field>

      <label className="flex items-start gap-3 rounded-[1rem] border border-border bg-background p-3">
        <input
          type="checkbox"
          checked={terms}
          onChange={(event) => setTerms(event.target.checked)}
          className="mt-1 size-4 accent-[#2F6F65]"
        />
        <span>
          <span className="block text-sm font-bold text-foreground">
            Accept termenii TROKO
          </span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            Sunt de acord cu folosirea contului pentru publicare, favorite și
            mesagerie.
          </span>
          {errors.terms ? (
            <span className="mt-1.5 block text-sm font-semibold text-destructive">
              {errors.terms}
            </span>
          ) : null}
        </span>
      </label>

      {errors.form ? (
        <p className="rounded-[1rem] border border-destructive/20 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
          {errors.form}
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
        <UserPlus className="size-4" aria-hidden="true" />
        {pending ? "Se creează contul..." : "Creează cont"}
      </Button>

      <p className="text-sm font-semibold text-muted-foreground">
        Ai deja cont?{" "}
        {onLogin ? (
          <button
            type="button"
            onClick={onLogin}
            className="text-primary hover:underline"
          >
            Intră în cont
          </button>
        ) : (
          <Link href="/login" className="text-primary hover:underline">
            Intră în cont
          </Link>
        )}
      </p>
    </form>
  );
}

function validateRegister(values: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}) {
  const errors: RegisterErrors = {};

  if (values.name.trim().length < 2) {
    errors.name = "Numele trebuie să aibă cel puțin 2 caractere.";
  }

  if (!isValidEmail(values.email)) {
    errors.email = "Introdu un email valid.";
  }

  if (values.password.length < 8) {
    errors.password = "Parola trebuie să aibă cel puțin 8 caractere.";
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Parolele nu coincid.";
  }

  if (!values.terms) {
    errors.terms = "Trebuie să accepți termenii.";
  }

  return errors;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-foreground">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-sm font-semibold text-destructive">
          {error}
        </span>
      ) : null}
    </label>
  );
}
