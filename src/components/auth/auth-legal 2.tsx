import Link from "next/link";
import { HeartHandshake, Leaf } from "lucide-react";

import { Button } from "@/components/ui/button";

export const AUTH_LEGAL_LINKS = {
  // TODO: Replace these temporary routes with finalized legal pages reviewed by counsel.
  terms: {
    href: "/termeni-si-conditii",
    label: "Termenii și Condițiile",
  },
  privacy: {
    href: "/politica-de-confidentialitate",
    label: "Politica de confidențialitate",
  },
} as const;

export function LegalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="font-bold text-brand underline-offset-4 transition-colors hover:text-brand hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25"
    >
      {children}
    </Link>
  );
}

export function AuthLogo() {
  return (
    <Link
      href="/"
      aria-label="TROKO.ro acasă"
      className="shrink-0 text-[1.55rem] font-black leading-none text-brand"
    >
      TROKO<span className="text-warm">.ro</span>
    </Link>
  );
}

export function AuthIllustration() {
  return (
    <div className="mx-auto mt-3 h-20 w-full max-w-[22rem] shrink-0 overflow-hidden">
      <SharedAuthIllustration />
    </div>
  );
}

export function AuthDivider() {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm text-[#7D8984]">
      <span className="h-px bg-[#D9DFDA]" />
      sau
      <span className="h-px bg-[#D9DFDA]" />
    </div>
  );
}

export function AuthFooterQuote() {
  return (
    <div className="relative mt-4 shrink-0 overflow-hidden rounded-[0.8rem] bg-[#F2F3DF] px-4 py-3 text-brand">
      <div className="relative z-10 flex items-center gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#DDEBD8] text-brand">
          <HeartHandshake className="size-5 fill-[#0F4A43]/15" aria-hidden="true" />
        </span>
        <p className="text-sm font-medium leading-5 sm:whitespace-nowrap">
          Construim o comunitate mai bună, anunț cu anunț.
        </p>
      </div>
      <Leaf
        className="absolute bottom-1.5 right-3 size-11 rotate-12 text-[#8AAE79] opacity-90"
        aria-hidden="true"
      />
    </div>
  );
}

export function SocialAuthButtons() {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2"
      aria-label="Autentificare socială"
    >
      <Button
        type="button"
        variant="outline"
        aria-disabled="true"
        className="h-10 cursor-default rounded-[0.65rem] border-[#D9DFDA] bg-white text-sm font-bold text-brand-ink shadow-sm hover:bg-white"
      >
        <GoogleLogo />
        Continuă cu Google
      </Button>
      <Button
        type="button"
        variant="outline"
        aria-disabled="true"
        className="h-10 cursor-default rounded-[0.65rem] border-[#D9DFDA] bg-white text-sm font-bold text-brand-ink shadow-sm hover:bg-white"
      >
        <FacebookLogo />
        Continuă cu Facebook
      </Button>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9c.87-2.6 3.3-4.52 6.16-4.52Z"
      />
    </svg>
  );
}

function FacebookLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="11" fill="#1877F2" />
      <path
        fill="#fff"
        d="M15.76 15.18 16.25 12h-3.05v-2.06c0-.87.43-1.72 1.8-1.72h1.39V5.51S15.13 5.3 13.93 5.3c-2.51 0-4.15 1.52-4.15 4.27V12H7v3.18h2.78v7.68a11.2 11.2 0 0 0 3.42 0v-7.68h2.56Z"
      />
    </svg>
  );
}

function SharedAuthIllustration() {
  return (
    <svg
      viewBox="0 0 360 120"
      aria-hidden="true"
      className="h-full w-full"
      focusable="false"
    >
      <circle cx="286" cy="74" r="34" fill="#F2F3DF" opacity="0.72" />
      <circle cx="168" cy="64" r="50" fill="#F8F5E9" opacity="0.86" />
      <path
        d="M25 103c30-8 72-10 126-8 75 3 134 6 184 0"
        fill="none"
        stroke="#E0E5D5"
        strokeLinecap="round"
        strokeWidth="6"
      />
      <path
        d="M69 55c4-11 22-12 28-1 5-4 14-2 18 4"
        fill="none"
        stroke="#DFE6D4"
        strokeLinecap="round"
        strokeWidth="8"
      />
      <path
        d="M244 35c5-15 27-16 34-2 6-5 19-2 24 6"
        fill="none"
        stroke="#E6E3CF"
        strokeLinecap="round"
        strokeWidth="9"
      />
      <path
        d="M50 91c27-31 62-39 100-24 27 11 47 3 73-14 34-21 69-8 88 31"
        fill="none"
        stroke="#C9D7CC"
        strokeLinecap="round"
        strokeWidth="12"
      />
      <path
        d="M72 95c26-19 54-24 85-12 23 9 46 8 71-4 28-14 55-7 79 16"
        fill="none"
        stroke="#E7EBD8"
        strokeLinecap="round"
        strokeWidth="14"
      />
      <path d="M145 59h76v39h-76z" fill="#D9E8CF" />
      <path d="M134 59 183 22l49 37" fill="none" stroke="#2F6F65" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6" />
      <path d="M169 68h22v30h-22z" fill="#2F6F65" />
      <circle cx="187" cy="83" r="2.4" fill="#F2F3DF" />
      <path d="M205 69h16v29h-16z" fill="#91B67E" opacity="0.8" />
      <path d="M63 100c-12-20-1-36 12-17 3-25 22-25 18 2 15-15 25-3 12 15" fill="#98BC88" opacity="0.82" />
      <path d="M285 100c-13-21-3-35 11-18 4-26 24-26 19 2 15-14 26-2 13 16" fill="#98BC88" opacity="0.82" />
    </svg>
  );
}
