"use client";

import Link from "next/link";
import { Dialog } from "radix-ui";
import { ShieldCheck, X } from "lucide-react";

import { AuthLogo } from "@/components/auth/auth-legal";
import { Button } from "@/components/ui/button";

export function PublishListingDialogShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open modal>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-[#061915]/68 backdrop-blur-[1px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby="publish-listing-description"
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          className="fixed left-1/2 top-1/2 z-[100] flex max-h-[calc(100dvh-0.5rem)] w-[calc(100%-1rem)] max-w-[74rem] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[1.15rem] border border-white/80 bg-[#FFFEFC] shadow-[0_28px_90px_rgba(2,24,20,0.34)] outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:w-[calc(100%-1.5rem)] min-[1800px]:max-w-[82rem]"
        >
          <div className="shrink-0 border-b border-[#D9DFDA] bg-[#FFFEFC]/96 px-4 py-3.5 backdrop-blur sm:px-5">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
              <AuthLogo />

              <div className="min-w-0 text-center">
                <Dialog.Title className="truncate text-sm font-black text-[#0F4A43] sm:text-base">
                  Creează un anunț nou
                </Dialog.Title>
                <Dialog.Description
                  id="publish-listing-description"
                  className="hidden text-xs font-semibold text-[#52645F] sm:block"
                >
                  Completează pașii, verifică preview-ul și publică atunci când
                  ești pregătit.
                </Dialog.Description>
              </div>

              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label="Închide"
                className="size-9 rounded-full text-[#052F28] hover:bg-[#E8F1EE]"
              >
                <Link href="/">
                  <X className="size-5" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden px-2 pb-2 pt-2 sm:px-3 sm:pb-3 lg:px-4 lg:pb-4">
            {children}
          </div>

          <div className="hidden shrink-0 border-t border-[#D9DFDA] bg-[#F2F3DF]/70 px-5 py-2.5 text-xs font-semibold text-[#0F4A43] sm:flex sm:items-center sm:justify-center sm:gap-2">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Anunțurile sunt verificate înainte de publicare.
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
