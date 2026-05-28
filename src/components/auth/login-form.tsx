"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AUTH_FIELD_LIMITS,
  AUTH_SUBMIT_COOLDOWN_MS,
  getAuthErrorMessage,
  isValidEmail,
  normalizeEmail,
} from "@/components/auth/auth-form-utils";
import {
  AuthDivider,
  SocialAuthButtons,
} from "@/components/auth/auth-legal";
import { createClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

type LoginErrors = Partial<{
  email: string;
  password: string;
  form: string;
}>;

export function LoginForm({
  redirectTo = "/cont",
  onCreateAccount,
}: {
  redirectTo?: string;
  onCreateAccount?: () => void;
}) {
  const router = useRouter();
  const formId = useId();
  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;
  const emailErrorId = `${emailId}-error`;
  const passwordErrorId = `${passwordId}-error`;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [pending, setPending] = useState(false);
  const submitGuardRef = useRef({
    inFlight: false,
    lastSubmitAt: 0,
  });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pending || submitGuardRef.current.inFlight) {
      return;
    }

    const normalizedEmail = normalizeEmail(email);
    const nextErrors = validateLogin({ email: normalizedEmail, password });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    const supabase = createClient();

    if (!supabase) {
      setErrors({
        form: "Autentificarea locală nu este configurată.",
      });
      return;
    }

    const now = Date.now();

    if (now - submitGuardRef.current.lastSubmitAt < AUTH_SUBMIT_COOLDOWN_MS) {
      setErrors({
        form: "Prea multe încercări într-un interval scurt. Reîncercați în câteva secunde.",
      });
      return;
    }

    submitGuardRef.current.lastSubmitAt = now;
    setPending(true);
    submitGuardRef.current.inFlight = true;

    let signInError: { message?: string } | null = null;

    try {
      const result = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      signInError = result.error;
    } catch {
      setErrors({
        form: "Autentificarea nu a putut fi finalizată. Încercați din nou în siguranță.",
      });
      setPending(false);
      submitGuardRef.current.inFlight = false;
      return;
    }

    if (signInError) {
      setErrors({ form: getAuthErrorMessage(signInError.message) });
      setPending(false);
      submitGuardRef.current.inFlight = false;
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  function clearFieldError(field: keyof LoginErrors) {
    if (!errors[field]) {
      return;
    }

    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  }

  return (
    <form onSubmit={onSubmit} className="authForm grid gap-2.5 min-[1800px]:gap-3">
      <Field
        id={emailId}
        label="Email"
        icon={Mail}
        error={errors.email}
        errorId={emailErrorId}
      >
        <input
          id={emailId}
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value.slice(0, AUTH_FIELD_LIMITS.email.max));
            clearFieldError("email");
          }}
          placeholder="email@exemplu.ro"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          inputMode="email"
          maxLength={AUTH_FIELD_LIMITS.email.max}
          spellCheck={false}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? emailErrorId : undefined}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#123F37] outline-none placeholder:text-[#A5AEAA]"
        />
      </Field>

      <Field
        id={passwordId}
        label="Parolă"
        icon={LockKeyhole}
        error={errors.password}
        errorId={passwordErrorId}
      >
        <input
          id={passwordId}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) => {
            setPassword(
              event.target.value.slice(0, AUTH_FIELD_LIMITS.password.max),
            );
            clearFieldError("password");
          }}
          placeholder="••••••••"
          autoComplete="current-password"
          maxLength={AUTH_FIELD_LIMITS.password.max}
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? passwordErrorId : undefined}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#123F37] outline-none placeholder:text-[#A5AEAA]"
        />
        <button
          type="button"
          aria-label={showPassword ? "Ascunde parola" : "Arată parola"}
          onClick={() => setShowPassword((current) => !current)}
          className="grid size-8 shrink-0 place-items-center rounded-full text-[#7D8984] transition hover:bg-[#F3F7F4] hover:text-[#0F4A43] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#2F6F65]/25"
        >
          {showPassword ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      </Field>

      <div className="-mt-2 flex justify-end">
        <Link
          href="/resetare-parola"
          className="text-sm font-semibold text-[#005F3F] transition hover:text-[#0F4A43] hover:underline"
        >
          Ai uitat parola?
        </Link>
      </div>

      {errors.form ? (
        <p className="rounded-[1rem] border border-destructive/20 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
          {errors.form}
        </p>
      ) : null}

      <Button
        disabled={pending}
        className="h-10 rounded-[0.65rem] bg-[#005F3F] text-[0.9rem] font-bold text-white shadow-[0_12px_28px_rgba(0,95,63,0.18)] hover:bg-[#0F4A43] disabled:bg-[#89B29E] disabled:text-white disabled:opacity-100 min-[1800px]:h-11 min-[1800px]:text-[0.95rem]"
      >
        {pending ? "Se conectează..." : "Conectează-te"}
      </Button>

      <AuthDivider />

      <SocialAuthButtons />

      {onCreateAccount ? null : (
        <p className="text-sm font-semibold text-muted-foreground">
          Nu ai cont?{" "}
          <Link href="/?auth=register" className="text-primary hover:underline">
            Creează cont
          </Link>
        </p>
      )}
    </form>
  );
}

function validateLogin(values: { email: string; password: string }) {
  const errors: LoginErrors = {};
  const email = normalizeEmail(values.email);

  if (!email) {
    errors.email = "Emailul este obligatoriu.";
  } else if (email.length > AUTH_FIELD_LIMITS.email.max) {
    errors.email = `Emailul poate avea maximum ${AUTH_FIELD_LIMITS.email.max} de caractere.`;
  } else if (!isValidEmail(email)) {
    errors.email = "Emailul nu este valid.";
  }

  if (!values.password) {
    errors.password = "Parola este obligatorie.";
  } else if (values.password.length > AUTH_FIELD_LIMITS.password.max) {
    errors.password = `Parola poate avea maximum ${AUTH_FIELD_LIMITS.password.max} de caractere.`;
  }

  return errors;
}

function Field({
  id,
  label,
  icon: Icon,
  error,
  errorId,
  children,
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  error?: string;
  errorId?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="authField grid gap-1.5">
      <label
        htmlFor={id}
        className="flex min-w-0 items-center justify-between gap-3 text-xs font-black text-[#052F28]"
      >
        <span className="shrink-0">{label}</span>
        {error ? (
          <span
            id={errorId}
            className="min-w-0 truncate text-right font-bold text-destructive"
          >
            {error}
          </span>
        ) : null}
      </label>
      <div
        className={cn(
          "authFieldControl flex h-10 items-center gap-2.5 rounded-[0.65rem] border border-[#D9DFDA] bg-white px-3 shadow-[inset_0_1px_2px_rgba(15,74,67,0.04)] transition focus-within:border-[#2F6F65] focus-within:ring-3 focus-within:ring-[#2F6F65]/15 min-[1800px]:h-11 min-[1800px]:gap-3",
          error && "border-destructive/40 focus-within:border-destructive/60",
        )}
      >
        <Icon className="size-5 shrink-0 text-[#8A928F]" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
