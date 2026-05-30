import { CheckCircle2, Circle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { TrustChecklistItem } from "@/lib/trust/profile-completion";

export function TrustChecklist({ items }: { items: TrustChecklistItem[] }) {
  return (
    <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft-sm">
      <h2 className="text-lg font-semibold text-foreground">
        Semnale de incredere
      </h2>
      <div className="mt-4 grid gap-3">
        {items.map((item) => {
          const Icon = item.complete ? CheckCircle2 : Circle;

          return (
            <div
              key={item.key}
              className="flex gap-3 rounded-[1rem] border border-border bg-background p-3"
            >
              <Icon
                className={cn(
                  "mt-0.5 size-5 shrink-0",
                  item.complete ? "text-primary" : "text-muted-foreground",
                )}
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {item.label}
                  <span className="sr-only">
                    {item.complete ? " complet" : " incomplet"}
                  </span>
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

