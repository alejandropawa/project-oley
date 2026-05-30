import Link from "next/link";
import {
  FileWarning,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const adminLinks = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Rapoarte", href: "/admin/rapoarte", icon: FileWarning },
  { label: "Anunțuri", href: "/admin/anunturi", icon: ListChecks },
  { label: "Promovări", href: "/admin/promovari", icon: Megaphone },
  { label: "Incredere", href: "/admin/incredere", icon: ShieldCheck },
  { label: "Utilizatori", href: "/admin/utilizatori", icon: UserRound },
  { label: "Setări", href: "/admin/setari", icon: Settings },
];

export function AdminNav() {
  return (
    <nav
      aria-label="Navigare admin"
      className="flex gap-2 overflow-x-auto rounded-[1.25rem] border border-border bg-card p-2 shadow-soft-sm"
    >
      {adminLinks.map((link) => {
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-primary"
          >
            <Icon className="size-4" aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
