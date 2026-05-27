import Link from "next/link";
import { Home, MessageCircle, Search, SquarePlus, UserRound } from "lucide-react";

const items = [
  { label: "Acasă", href: "/", icon: Home },
  { label: "Caută", href: "/anunturi", icon: Search },
  { label: "Publică", href: "/publica", icon: SquarePlus, featured: true },
  { label: "Mesaje", href: "/mesaje", icon: MessageCircle },
  { label: "Cont", href: "/cont", icon: UserRound },
];

export function MobileBottomNav() {
  return (
    <nav
      aria-label="Navigare mobilă"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/98 shadow-[0_-10px_28px_rgb(23_23_23_/_0.06)] md:hidden"
    >
      <div className="mx-auto grid h-[4.75rem] max-w-md grid-cols-5 px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl text-[0.7rem] font-semibold text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:text-primary"
            >
              <span
                className={
                  item.featured
                    ? "grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft-sm"
                    : "grid size-7 place-items-center"
                }
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
