import { Badge } from "@/components/ui/badge";
import { formatAdminDate } from "@/lib/reporting-utils";
import type { AdminUserSummary } from "@/lib/db/admin";

export function AdminUserRow({ user }: { user: AdminUserSummary }) {
  return (
    <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            {user.profile.is_business ? (
              <Badge className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-primary">
                Business
              </Badge>
            ) : null}
            {user.reportCount > 0 ? (
              <Badge className="rounded-full bg-[#FFF2CF] px-3 py-1 text-xs font-bold text-[#7A5718]">
                {user.reportCount} rapoarte
              </Badge>
            ) : null}
          </div>
          <h2 className="mt-3 text-xl font-black text-foreground">
            {user.profile.display_name ?? "Utilizator TROKO"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {user.profile.city ?? "Oraș indisponibil"}
            {user.profile.county ? `, ${user.profile.county}` : ""} · creat{" "}
            {formatAdminDate(user.profile.created_at)}
          </p>
        </div>
        <div className="rounded-[1rem] border border-border bg-background px-4 py-3 text-sm font-bold text-muted-foreground">
          {user.listingCount} anunțuri
        </div>
      </div>
    </article>
  );
}
