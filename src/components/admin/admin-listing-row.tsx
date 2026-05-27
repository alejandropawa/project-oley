import Link from "next/link";

import { ListingModerationButton } from "@/components/admin/admin-action-button";
import { Badge } from "@/components/ui/badge";
import { formatAdminDate } from "@/lib/reporting-utils";
import type { AdminListingSummary } from "@/lib/db/admin";

export function AdminListingRow({ row }: { row: AdminListingSummary }) {
  const listing = row.listing;

  return (
    <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-primary">
              {listing.status}
            </Badge>
            {row.reportCount > 0 ? (
              <Badge className="rounded-full bg-[#FFF2CF] px-3 py-1 text-xs font-bold text-[#7A5718]">
                {row.reportCount} rapoarte
              </Badge>
            ) : null}
          </div>
          <h2 className="mt-3 text-xl font-black text-foreground">
            {listing.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {row.ownerName} · {listing.category_slug} · {listing.type} ·{" "}
            {listing.city}, {listing.county} · {formatAdminDate(listing.created_at)}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-4 lg:grid-cols-1">
          <Link
            href={`/anunturi/${listing.slug}`}
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-4 text-sm font-bold text-foreground"
          >
            Vezi
          </Link>
          <ListingModerationButton listingId={listing.id} action="archive">
            Arhivează
          </ListingModerationButton>
          <ListingModerationButton listingId={listing.id} action="reactivate">
            Reactivează
          </ListingModerationButton>
          <ListingModerationButton listingId={listing.id} action="expire">
            Expiră
          </ListingModerationButton>
        </div>
      </div>
    </article>
  );
}
