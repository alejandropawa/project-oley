"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AUTH_FIELD_LIMITS,
  AUTH_PRIVACY_VERSION,
  AUTH_SUBMIT_COOLDOWN_MS,
  AUTH_TERMS_VERSION,
  getAuthErrorMessage,
  isValidEmail,
  normalizeEmail,
  normalizeName,
} from "@/components/auth/auth-form-utils";
import {
  AuthDivider,
  AUTH_LEGAL_LINKS,
  LegalLink,
  SocialAuthButtons,
} from "@/components/auth/auth-legal";
import { createClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

type RegisterErrors = Partial<{
  name: string;
  email: string;
  password: string;
  terms: string;
  form: string;
}>;

export function RegisterForm({ onLogin }: { onLogin?: () => void }) {
  const router = useRouter();
  const formId = useId();
  const nameId = `${formId}-name`;
  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;
  const nameErrorId = `${nameId}-error`;
  const emailErrorId = `${emailId}-error`;
  const passwordErrorId = `${passwordId}-error`;
  const termsId = `${formId}-terms`;
  const termsTextId = `${termsId}-text`;
  const termsErrorId = `${termsId}-error`;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [success, setSuccess] = useState("");
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

    setSuccess("");
    const normalizedName = normalizeName(name);
    const normalizedEmail = normalizeEmail(email);
    const nextErrors = validateRegister({
      name: normalizedName,
      email: normalizedEmail,
      password,
      terms,
    });

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
    const acceptedTermsAt = new Date().toISOString();
    // TODO: Ask professional/trader status in a separate profile or first-listing flow, not in this drawer.
    let signUpData: Awaited<ReturnType<typeof supabase.auth.signUp>>["data"] | null =
      null;
    let signUpError: { message?: string } | null = null;

    try {
      const result = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: normalizedName,
            acceptedTerms: true,
            acceptedTermsAt,
            termsVersion: AUTH_TERMS_VERSION,
            privacyVersion: AUTH_PRIVACY_VERSION,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/confirmare-cont`,
        },
      });
      signUpData = result.data;
      signUpError = result.error;
    } catch {
      setErrors({
        form: "Înregistrarea nu a putut fi finalizată. Încercați din nou în siguranță.",
      });
      return;
    } finally {
      setPending(false);
      submitGuardRef.current.inFlight = false;
    }

    if (signUpError) {
      setErrors({ form: getAuthErrorMessage(signUpError.message) });
      return;
    }

    setErrors({});

    if (signUpData?.session) {
      router.push("/confirmare-cont?status=success");
      router.refresh();
      return;
    }

    setSuccess("Contul a fost creat. Verificați emailul pentru confirmare.");
  }

  function clearFieldError(field: keyof RegisterErrors) {
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
        id={nameId}
        label="Nume"
        icon={UserRound}
        error={errors.name}
        errorId={nameErrorId}
      >
        <input
          id={nameId}
          value={name}
          onChange={(event) => {
            setName(event.target.value.slice(0, AUTH_FIELD_LIMITS.name.max));
            clearFieldError("name");
          }}
          placeholder="Ion Popescu"
          autoComplete="name"
          autoCapitalize="words"
          maxLength={AUTH_FIELD_LIMITS.name.max}
          minLength={AUTH_FIELD_LIMITS.name.min}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? nameErrorId : undefined}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#123F37] outline-none placeholder:text-[#A5AEAA]"
        />
      </Field>

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
          autoComplete="new-password"
          maxLength={AUTH_FIELD_LIMITS.password.max}
          minLength={AUTH_FIELD_LIMITS.password.min}
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

      <div
        className={cn(
          "flex items-start gap-3 rounded-[0.75rem] border border-[#D5E4DF] bg-[#F7FBF8] p-2.5",
          errors.terms && "border-destructive/40 bg-destructive/5",
        )}
        data-invalid={errors.terms ? true : undefined}
      >
        <input
          id={termsId}
          type="checkbox"
          required
          checked={terms}
          onChange={(event) => {
            setTerms(event.target.checked);

            if (event.target.checked && errors.terms) {
              setErrors((currentErrors) => ({
                ...currentErrors,
                terms: undefined,
              }));
            }
          }}
          aria-invalid={errors.terms ? true : undefined}
          aria-labelledby={termsTextId}
          aria-describedby={errors.terms ? termsErrorId : undefined}
          className="mt-1 size-4 rounded border-[#B8C9C4] accent-[#2F6F65] outline-none focus-visible:ring-3 focus-visible:ring-[#2F6F65]/30"
        />
        <div className="text-sm leading-5 text-[#52645F]">
          <p id={termsTextId}>
            Am citit și accept{" "}
            <LegalLink href={AUTH_LEGAL_LINKS.terms.href}>
              {AUTH_LEGAL_LINKS.terms.label}
            </LegalLink>{" "}
            și confirm că am luat la cunoștință{" "}
            <LegalLink href={AUTH_LEGAL_LINKS.privacy.href}>
              {AUTH_LEGAL_LINKS.privacy.label}
            </LegalLink>
            .
          </p>
        </div>
      </div>

      {errors.terms ? (
        <p id={termsErrorId} className="-mt-2 text-sm font-semibold text-destructive">
          {errors.terms}
        </p>
      ) : null}

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
        disabled={pending || !terms}
        className="h-10 rounded-[0.65rem] bg-[#005F3F] text-[0.9rem] font-bold text-white shadow-[0_12px_28px_rgba(0,95,63,0.18)] hover:bg-[#0F4A43] disabled:bg-[#89B29E] disabled:text-white disabled:opacity-100 min-[1800px]:h-11 min-[1800px]:text-[0.95rem]"
      >
        {pending ? "Se creează contul..." : "Înregistrează-te"}
      </Button>

      <AuthDivider />

      <SocialAuthButtons />

      {onLogin ? null : (
        <p className="text-sm font-semibold text-muted-foreground">
          Ai deja cont?{" "}
          <Link href="/?auth=login" className="text-primary hover:underline">
            Intră în cont
          </Link>
        </p>
      )}
    </form>
  );
}

function validateRegister(values: {
  name: string;
  email: string;
  password: string;
  terms: boolean;
}) {
  const errors: RegisterErrors = {};
  const name = normalizeName(values.name);
  const email = normalizeEmail(values.email);

  if (!name) {
    errors.name = "Numele este obligatoriu.";
  } else if (name.length < AUTH_FIELD_LIMITS.name.min) {
    errors.name = `Numele trebuie să includă minimum ${AUTH_FIELD_LIMITS.name.min} caractere.`;
  } else if (name.length > AUTH_FIELD_LIMITS.name.max) {
    errors.name = `Numele poate avea maximum ${AUTH_FIELD_LIMITS.name.max} de caractere.`;
  }

  if (!email) {
    errors.email = "Emailul este obligatoriu.";
  } else if (email.length > AUTH_FIELD_LIMITS.email.max) {
    errors.email = `Emailul poate avea maximum ${AUTH_FIELD_LIMITS.email.max} de caractere.`;
  } else if (!isValidEmail(email)) {
    errors.email = "Emailul nu este valid.";
  }

  if (!values.password) {
    errors.password = "Parola este obligatorie.";
  } else if (values.password.length < AUTH_FIELD_LIMITS.password.min) {
    errors.password = `Minimum ${AUTH_FIELD_LIMITS.password.min} caractere.`;
  } else if (values.password.length > AUTH_FIELD_LIMITS.password.max) {
    errors.password = `Parola poate avea maximum ${AUTH_FIELD_LIMITS.password.max} de caractere.`;
  }

  if (!values.terms) {
    errors.terms =
      "Acceptarea Termenilor și Condițiilor este necesară pentru crearea contului.";
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
