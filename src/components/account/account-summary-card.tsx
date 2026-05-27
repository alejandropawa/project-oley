import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/auth/user";

export function AccountSummaryCard({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  return (
    <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-soft-sm">
      <div className="flex items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-primary text-xl font-black text-primary-foreground">
          {getInitials(name, email)}
        </span>
        <div className="min-w-0">
          <Badge className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-primary">
            Cont TROKO
          </Badge>
          <h1 className="mt-3 truncate text-2xl font-black text-foreground">
            {name}
          </h1>
          <p className="truncate text-sm font-medium text-muted-foreground">
            {email}
          </p>
        </div>
      </div>
    </section>
  );
}
