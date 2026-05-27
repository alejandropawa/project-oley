import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/types/database";

export function TrustBadge({ badge }: { badge: Tables<"user_trust_badges"> }) {
  return (
    <Badge className="inline-flex rounded-full bg-[#E8F1EE] px-3 py-1 text-xs font-black text-primary">
      <ShieldCheck className="size-3.5" aria-hidden="true" />
      {badge.label}
    </Badge>
  );
}

