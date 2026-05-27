import Link from "next/link";
import { Star, UserRoundCheck } from "lucide-react";

import { TrustBadges } from "@/components/trust/trust-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTrustDate } from "@/lib/trust/labels";
import type { SellerTrustSummary as SellerTrustSummaryType } from "@/lib/db/trust";

export function SellerTrustSummary({
  summary,
  fallbackName,
}: {
  summary: SellerTrustSummaryType | null;
  fallbackName: string;
}) {
  if (!summary) {
    return (
      <div>
        <p className="text-sm leading-6 text-muted-foreground">
          Semnalele de incredere pentru acest profil vor fi disponibile dupa
          configurarea Supabase.
        </p>
      </div>
    );
  }

  const profileHref = summary.slug ? `/profil/${summary.slug}` : null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-black text-foreground">
          {summary.displayName || fallbackName}
        </h2>
        {summary.isVerifiedSeller ? (
          <Badge className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-primary">
            <UserRoundCheck className="size-3" aria-hidden="true" />
            verificat partial
          </Badge>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {summary.publicLocationLabel || summary.city || "Romania"} · membru din{" "}
        {formatTrustDate(summary.memberSince)}
      </p>
      <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
        <Star className="size-4 fill-current" aria-hidden="true" />
        {summary.averageRating
          ? `${summary.averageRating.toFixed(1)}/5 din ${summary.reviewsCount} review-uri`
          : "Fara review-uri inca"}
      </p>
      <p className="mt-2 text-sm font-semibold text-muted-foreground">
        {summary.responseHint} · {summary.activeListingsCount} anunturi active
      </p>
      <div className="mt-3">
        <TrustBadges badges={summary.badges} />
      </div>
      {profileHref ? (
        <Button
          asChild
          variant="ghost"
          className="mt-4 h-10 rounded-full px-4 font-bold text-primary"
        >
          <Link href={profileHref}>Vezi profilul</Link>
        </Button>
      ) : null}
    </div>
  );
}

