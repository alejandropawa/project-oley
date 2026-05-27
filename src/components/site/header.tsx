import Link from "next/link";
import { Plus, UserRound } from "lucide-react";

import { AuthDrawerTrigger } from "@/components/auth/auth-drawer-trigger";
import { NotificationBell } from "@/components/notifications/notification-bell";
import {
  primaryActionButtonClassName,
  primaryActionIconClassName,
} from "@/components/ui/action-styles";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/user";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Anunțuri", href: "/anunturi" },
  { label: "Categorii", href: "/categorii" },
  { label: "Orașe", href: "/orase" },
  { label: "Despre noi", href: "/despre" },
  { label: "Contact", href: "/contact" },
];

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="siteHeader sticky top-0 z-50 bg-transparent">
      <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          aria-label="TROKO.ro acasă"
          className="shrink-0 text-2xl font-black leading-none text-[#0F4A43] sm:text-3xl"
        >
          TROKO<span className="text-[#E9B44C]">.ro</span>
        </Link>

        <nav
          aria-label="Navigare principală"
          className="hidden items-center gap-8 xl:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-[#123F37] transition-colors hover:text-[#2F6F65]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
          {user ? (
            <NotificationBell />
          ) : null}

          {user ? (
            <Button
              asChild
              variant="ghost"
              className="hidden h-11 rounded-full px-3 text-sm font-semibold text-[#123F37] hover:bg-[#FFFDF8]/70 hover:text-[#0F4A43] md:inline-flex"
            >
              <Link href="/cont">
                <UserRound className="size-5" aria-hidden="true" />
                <span className="hidden lg:inline">Contul meu</span>
              </Link>
            </Button>
          ) : (
            <AuthDrawerTrigger />
          )}

          <Button
            asChild
            className={cn(
              primaryActionButtonClassName,
              "h-11 px-4 text-sm font-bold sm:px-5",
            )}
          >
            <Link href="/publica">
              <Plus
                className={cn("size-4", primaryActionIconClassName)}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">Adaugă anunț</span>
              <span className="sm:hidden">Adaugă</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
