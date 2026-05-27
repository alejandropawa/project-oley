import Link from "next/link";
import { List, Map } from "lucide-react";

import { buildSearchHref } from "@/lib/search/url";
import { cn } from "@/lib/utils";
import type { SearchListingsParams } from "@/lib/search/types";

export function ViewToggle({
  params,
  path = "/anunturi",
}: {
  params: SearchListingsParams;
  path?: string;
}) {
  const items = [
    { value: "list" as const, label: "Listă", icon: List },
    { value: "map" as const, label: "Hartă", icon: Map },
  ];

  return (
    <div className="inline-flex rounded-full border border-border bg-background p-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = params.view === item.value;

        return (
          <Link
            key={item.value}
            href={buildSearchHref(params, { view: item.value }, path)}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-bold transition",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-primary",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="size-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
