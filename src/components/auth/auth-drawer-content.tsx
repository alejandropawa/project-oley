"use client";

import { Dialog } from "radix-ui";
import { X } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import type { AuthMode } from "@/components/auth/auth-drawer-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const authCopy: Record<AuthMode, { title: string; subtitle: string }> = {
  login: {
    title: "Intră în cont",
    subtitle:
      "Conectează-te pentru a salva anunțuri, publica mai rapid și discuta în siguranță.",
  },
  register: {
    title: "Creează cont TROKO",
    subtitle:
      "Un cont îți permite să publici anunțuri, să salvezi favorite și să discuți cu vânzătorii.",
  },
};

export function AuthDrawerContent({
  mode,
  onModeChange,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[90] bg-[#102F2A]/20 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <Dialog.Content className="fixed bottom-0 right-0 top-0 z-[100] flex h-dvh w-full max-w-[30rem] flex-col overflow-y-auto border-l border-[#E8E1D8] bg-[#FFFDF8] px-5 py-6 shadow-[0_24px_90px_rgba(15,70,61,0.22)] outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:px-7">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-normal text-[#2F6F65]">
              Cont TROKO
            </p>
            <Dialog.Title className="mt-2 font-serif text-3xl font-semibold leading-tight text-[#0F4A43] sm:text-4xl">
              {authCopy[mode].title}
            </Dialog.Title>
            <Dialog.Description className="mt-3 text-sm leading-6 text-[#52645F]">
              {authCopy[mode].subtitle}
            </Dialog.Description>
          </div>

          <Dialog.Close asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Închide"
              className="size-10 rounded-full text-[#123F37] hover:bg-[#E8F1EE]"
            >
              <X className="size-5" aria-hidden="true" />
            </Button>
          </Dialog.Close>
        </div>

        <div
          role="tablist"
          aria-label="Autentificare"
          className="mt-7 grid grid-cols-2 rounded-full border border-[#E8E1D8] bg-white/70 p-1 shadow-sm"
        >
          <AuthModeButton
            active={mode === "login"}
            onClick={() => onModeChange("login")}
          >
            Intră în cont
          </AuthModeButton>
          <AuthModeButton
            active={mode === "register"}
            onClick={() => onModeChange("register")}
          >
            Creează cont
          </AuthModeButton>
        </div>

        <div className="mt-7">
          {mode === "login" ? (
            <LoginForm
              redirectTo="/cont"
              onCreateAccount={() => onModeChange("register")}
            />
          ) : (
            <RegisterForm onLogin={() => onModeChange("login")} />
          )}
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

function AuthModeButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "h-10 rounded-full px-3 text-sm font-bold text-[#52645F] transition-colors duration-200",
        active
          ? "bg-[#0F4A43] text-white shadow-[0_10px_24px_rgba(15,70,61,0.18)]"
          : "hover:bg-[#E8F1EE] hover:text-[#0F4A43]",
      )}
    >
      {children}
    </button>
  );
}
