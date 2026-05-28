import { MapPin, Star } from "lucide-react";

import { TrustBadges } from "@/components/trust/trust-badges";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/auth/user";
import { formatTrustDate } from "@/lib/trust/labels";
import type { PublicProfile } from "@/lib/db/public-profiles";

export function PublicProfileHeader({
  publicProfile,
}: {
  publicProfile: PublicProfile;
}) {
  const profile = publicProfile.profile;
  const trust = publicProfile.trust;
  const displayName = profile.display_name ?? "Utilizator TROKO";

  return (
    <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-soft-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="grid size-20 shrink-0 place-items-center rounded-full bg-primary text-2xl font-black text-primary-foreground">
          {getInitials(displayName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-black leading-tight text-foreground">
              {displayName}
            </h1>
            {profile.is_verified_seller ? (
              <Badge className="rounded-full bg-brand-soft px-3 py-1 text-xs font-black text-primary">
                Profil verificat partial
              </Badge>
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 text-primary" aria-hidden="true" />
              {profile.public_location_label || profile.city || "Romania"}
            </span>
            <span>Membru din {formatTrustDate(profile.created_at)}</span>
            <span>{publicProfile.activeListingsCount} anunturi active</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-sm font-black text-primary">
              <Star className="size-4 fill-current" aria-hidden="true" />
              {profile.average_rating
                ? `${profile.average_rating.toFixed(1)}/5`
                : "Fara rating"}
            </span>
            <span className="rounded-full bg-background px-3 py-1 text-sm font-black text-muted-foreground">
              {profile.reviews_count} review-uri
            </span>
            <span className="rounded-full bg-background px-3 py-1 text-sm font-black text-muted-foreground">
              Scor {profile.trust_score}/100
            </span>
          </div>
          {profile.bio ? (
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
              {profile.bio}
            </p>
          ) : null}
          <div className="mt-4">
            <TrustBadges badges={trust?.badges ?? []} />
          </div>
        </div>
      </div>
    </section>
  );
}

