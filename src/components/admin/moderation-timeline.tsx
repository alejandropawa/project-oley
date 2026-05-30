import {
  formatAdminDate,
  moderationActionLabels,
} from "@/lib/reporting-utils";
import type { Tables } from "@/types/database";

export function ModerationTimeline({
  events,
}: {
  events: Tables<"moderation_events">[];
}) {
  if (events.length === 0) {
    return (
      <div className="rounded-[1.25rem] border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
        Nu există evenimente de moderare încă.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {events.map((event) => (
        <article
          key={event.id}
          className="rounded-[1.25rem] border border-border bg-background p-4"
        >
          <p className="text-sm font-semibold text-foreground">
            {moderationActionLabels[event.action]}
          </p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            {formatAdminDate(event.created_at)}
          </p>
          {event.note ? (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {event.note}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
