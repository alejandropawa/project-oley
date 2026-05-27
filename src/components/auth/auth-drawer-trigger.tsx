"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Dialog } from "radix-ui";
import { LogIn, UserRound } from "lucide-react";

import type { AuthMode } from "@/components/auth/auth-drawer-types";
import { Button } from "@/components/ui/button";
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
  const [mode, setMode] = useState<AuthMode>("login");
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (nextOpen) {
          setMode("login");
        }
      }}
    >
      <Dialog.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "group hidden h-11 rounded-full px-3 text-sm font-semibold text-[#123F37] hover:bg-[#FFFDF8]/70 hover:text-[#0F4A43] md:inline-flex",
            className,
          )}
        >
          <span className="relative size-5" aria-hidden="true">
            <UserRound className="absolute inset-0 size-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-75 group-hover:opacity-0" />
            <LogIn className="absolute inset-0 size-5 translate-y-1 scale-75 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100" />
          </span>
          <span className="hidden lg:inline">Intră în cont</span>
        </Button>
      </Dialog.Trigger>

      {open ? <AuthDrawerContent mode={mode} onModeChange={setMode} /> : null}
    </Dialog.Root>
  );
}
