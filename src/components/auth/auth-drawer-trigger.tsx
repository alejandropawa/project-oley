"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { LogIn, UserRound } from "lucide-react";

import type { AuthMode } from "@/components/auth/auth-drawer-types";
import { Button } from "@/components/ui/button";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { cn } from "@/lib/utils";

const AuthDrawerContent = dynamic(
  () =>
    import("@/components/auth/auth-drawer-content").then(
      (mod) => mod.AuthDrawerContent,
    ),
  {
    loading: () => null,
    ssr: false,
  },
);

export function AuthDrawerTrigger({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedAuthMode = searchParams.get("auth");
  const urlMode: AuthMode | null =
    requestedAuthMode === "register"
      ? "register"
      : requestedAuthMode === "login"
        ? "login"
        : null;
  const rawRedirectTo = searchParams.get("redirectTo");
  const urlRedirectTo = rawRedirectTo
    ? getSafeRedirectPath(rawRedirectTo)
    : "/cont";
  const authRequestKey = urlMode
    ? `${urlMode}:${rawRedirectTo ?? ""}`
    : null;
  const [mode, setMode] = useState<AuthMode>("login");
  const [redirectTo, setRedirectTo] = useState("/cont");
  const [open, setOpen] = useState(false);
  const [dismissedAuthRequestKey, setDismissedAuthRequestKey] = useState<
    string | null
  >(null);
  const openFromUrl =
    Boolean(urlMode) && authRequestKey !== dismissedAuthRequestKey;
  const activeMode: AuthMode = openFromUrl && urlMode ? urlMode : mode;
  const activeRedirectTo = openFromUrl ? urlRedirectTo : redirectTo;
  const isOpen = open || openFromUrl;

  function clearAuthUrl() {
    if (!authRequestKey) {
      return;
    }

    setDismissedAuthRequestKey(authRequestKey);
    router.replace("/", { scroll: false });
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setRedirectTo(activeRedirectTo);
    setOpen(true);
    clearAuthUrl();
  }

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (nextOpen) {
          setMode("login");
          setRedirectTo("/cont");
          return;
        }

        clearAuthUrl();
      }}
    >
      <Button
        type="button"
        variant="ghost"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => {
          setMode("login");
          setRedirectTo("/cont");
          setOpen(true);
        }}
        className={cn(
          "group hidden h-10 rounded-full px-3 text-sm font-semibold text-brand-ink hover:bg-brand-soft hover:text-brand focus-visible:ring-ring/40 md:inline-flex min-[1800px]:h-11",
          className,
        )}
      >
        <span className="relative size-5" aria-hidden="true">
          <UserRound className="absolute inset-0 size-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-75 group-hover:opacity-0" />
          <LogIn className="absolute inset-0 size-5 translate-y-1 scale-75 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100" />
        </span>
        <span className="hidden lg:inline">Intră în cont</span>
      </Button>

      {isOpen ? (
        <AuthDrawerContent
          mode={activeMode}
          onModeChange={changeMode}
          redirectTo={activeRedirectTo}
        />
      ) : null}
    </Dialog.Root>
  );
}
