"use client";

import { Dialog } from "radix-ui";
import { X } from "lucide-react";

import {
  AuthFooterQuote,
  AuthIllustration,
  AuthLogo,
} from "@/components/auth/auth-legal";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import type { AuthMode } from "@/components/auth/auth-drawer-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const authCopy: Record<AuthMode, { title: string; subtitle: string }> = {
  login: {
    title: "Bine ai revenit!",
    subtitle: "Conectează-te în contul tău și continuă să postezi anunțuri.",
  },
  register: {
    title: "Creează-ți cont",
    subtitle: "Alătură-te comunității Troko și începe să postezi anunțuri.",
  },
};

export function AuthDrawerContent({
  mode,
  onModeChange,
  redirectTo = "/cont",
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  redirectTo?: string;
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[90] bg-[#061915]/68 backdrop-blur-[1px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <Dialog.Content className="authDialog fixed left-1/2 top-1/2 z-[100] flex max-h-[calc(100dvh-0.5rem)] w-[calc(100%-1.5rem)] max-w-[33.5rem] -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-[1.15rem] border border-white/80 bg-[#FFFEFC] px-5 py-3.5 shadow-[0_28px_90px_rgba(2,24,20,0.34)] outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:px-6 2xl:max-w-[35rem] min-[1800px]:max-w-[37rem]">
        <div className="authDialogHeader sticky top-0 z-10 -mx-5 -mt-3.5 shrink-0 bg-[#FFFEFC]/96 px-5 pb-3.5 pt-3.5 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="flex items-center justify-between gap-5">
            <AuthLogo />

            <Dialog.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Închide"
                className="size-9 rounded-full text-[#052F28] hover:bg-[#E8F1EE]"
              >
                <X className="size-5" aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>

          <div
            role="tablist"
            aria-label="Autentificare"
            className="mt-4 grid grid-cols-2 overflow-hidden rounded-[0.7rem] border border-[#D9DFDA] bg-white shadow-sm"
          >
            <AuthModeButton
              active={mode === "login"}
              onClick={() => onModeChange("login")}
            >
              Autentificare
            </AuthModeButton>
            <AuthModeButton
              active={mode === "register"}
              onClick={() => onModeChange("register")}
            >
              Înregistrare
            </AuthModeButton>
          </div>
        </div>

        <AuthIllustration />

        <div className="mx-auto mt-2 max-w-full shrink-0 text-center">
          <Dialog.Title className="authDialogTitle text-[1.35rem] font-black leading-tight text-[#0F4A43] lg:text-[1.45rem] min-[1800px]:text-[1.65rem]">
            {authCopy[mode].title}
          </Dialog.Title>
          <Dialog.Description className="authDialogDescription mt-1.5 text-[0.9rem] leading-5 text-[#243D37] sm:whitespace-nowrap lg:text-[0.95rem]">
            {authCopy[mode].subtitle}
          </Dialog.Description>
        </div>

        <div className="authDialogForm mt-4 shrink-0">
          {mode === "login" ? (
            <LoginForm
              redirectTo={redirectTo}
              onCreateAccount={() => onModeChange("register")}
            />
          ) : (
            <RegisterForm onLogin={() => onModeChange("login")} />
          )}
        </div>

        {/* TODO: Keep cookie consent and cookie policy handling outside the auth drawer. */}
        <div className="authFooterSlot mt-auto pt-4">
          <AuthFooterQuote />
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
        "h-10 px-3 text-sm font-bold text-[#123F37] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#2F6F65]/25",
        active
          ? "bg-[#005F3F] text-white shadow-[0_10px_24px_rgba(0,95,63,0.18)]"
          : "bg-white hover:bg-[#F3F7F4]",
      )}
    >
      {children}
    </button>
  );
}
