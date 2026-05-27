import type { LucideIcon } from "lucide-react";

export function AdminStatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
      <span className="grid size-11 place-items-center rounded-[1rem] bg-muted text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-4 text-3xl font-black text-foreground">{value}</p>
      <h2 className="mt-1 text-sm font-bold text-muted-foreground">{title}</h2>
    </article>
  );
}
