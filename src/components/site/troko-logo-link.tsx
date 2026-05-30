import Link from "next/link";

import { cn } from "@/lib/utils";

export const trokoLogoControlClassName =
  "trokoLogoMark inline-flex h-10 w-[6.75rem] shrink-0 items-center justify-center rounded-full border border-transparent text-[1.35rem] font-bold leading-none text-brand sm:w-[10rem] sm:text-[1.55rem] min-[1800px]:h-11 min-[1800px]:text-[1.7rem]";

export function TrokoLogoLink({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="TROKO.ro acasă"
      className={cn(trokoLogoControlClassName, className)}
    >
      TROKO<span className="trokoLogoSuffix text-warm">.ro</span>
    </Link>
  );
}
