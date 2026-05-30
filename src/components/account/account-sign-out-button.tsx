"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

import { createClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

export function AccountSignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    if (pending) {
      return;
    }

    setPending(true);
    const supabase = createClient();

    if (supabase) {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setPending(false);
        return;
      }
    }

    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      className={cn(
        "group flex min-h-11 shrink-0 items-center gap-2.5 rounded-[0.875rem] border border-transparent bg-white px-3 text-[14px] font-medium leading-5 text-[#102A27] outline-none transition hover:border-[#CBD7CE] hover:bg-[#FAFBF7] focus-visible:ring-3 focus-visible:ring-[#0B4A3E]/20 disabled:cursor-wait disabled:text-[#8A9691]",
        className,
      )}
    >
      <LogOut className="size-4 shrink-0 text-[#0B4A3E]" aria-hidden="true" />
      <span className="whitespace-nowrap">
        {pending ? "Se deconectează..." : "Ieșire din cont"}
      </span>
    </button>
  );
}
