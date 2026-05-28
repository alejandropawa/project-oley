import Link from "next/link";
import { Heart, MessageCircle, Plus, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AuthDrawerTrigger } from "@/components/auth/auth-drawer-trigger";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { TrokoLogoLink } from "@/components/site/troko-logo-link";
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

const headerPrimaryControlClassName =
  "h-10 rounded-full px-4 text-sm sm:px-5 min-[1800px]:h-11";
const headerIconControlClassName =
  "grid size-10 shrink-0 place-items-center rounded-full text-brand-ink transition hover:bg-brand-soft hover:text-brand focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 min-[1800px]:size-11";
const headerIconSvgClassName = "size-4 stroke-[2]";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="siteHeader sticky top-0 z-50 bg-transparent">
      <div className="mx-auto flex h-16 w-full max-w-[var(--site-header-max)] items-center justify-between gap-4 px-3 sm:px-7 lg:h-18 lg:px-8 min-[1800px]:h-20">
        <TrokoLogoLink />

        <nav
          aria-label="Navigare principală"
          className="hidden items-center gap-6 lg:flex xl:gap-8"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-brand-ink transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
          {user ? (
            <>
              <HeaderIconLink
                href="/mesaje"
                label="Mesaje"
                icon={MessageCircle}
              />
              <HeaderIconLink
                href="/cont/favorite"
                label="Favorite"
                icon={Heart}
              />
              <NotificationBell />
              <Button
                asChild
                variant="ghost"
                className="headerAccountButton group size-10 rounded-full p-0 text-sm font-semibold text-brand-ink hover:bg-brand-soft hover:text-brand focus-visible:ring-ring/40 lg:h-10 lg:w-auto lg:px-3 min-[1800px]:size-11 lg:min-[1800px]:h-11 lg:min-[1800px]:w-auto"
              >
                <Link href="/cont" aria-label="Contul meu">
                  <UserRound
                    className={headerIconSvgClassName}
                    aria-hidden="true"
                  />
                  <span className="headerAccountLabel hidden lg:inline">
                    Contul meu
                  </span>
                </Link>
              </Button>
            </>
          ) : (
            <AuthDrawerTrigger />
          )}

          <Button
            asChild
            className={cn(
              primaryActionButtonClassName,
              headerPrimaryControlClassName,
              "font-bold",
            )}
          >
            <Link href="/publica" aria-label="Adaugă anunț">
              <Plus
                className={cn("size-4", primaryActionIconClassName)}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">Adaugă anunț</span>
              <span className="hidden min-[420px]:inline sm:hidden">Adaugă</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function HeaderIconLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={headerIconControlClassName}
    >
      <Icon className={headerIconSvgClassName} aria-hidden="true" />
    </Link>
  );
}
