import { TrustBadge } from "@/components/trust/trust-badge";
import type { Tables } from "@/types/database";

export function TrustBadges({ badges }: { badges: Tables<"user_trust_badges">[] }) {
  if (badges.length === 0) {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        Semnalele de incredere vor aparea aici pe masura ce profilul este
        completat.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.slice(0, 6).map((badge) => (
        <TrustBadge key={badge.id} badge={badge} />
      ))}
    </div>
  );
}

