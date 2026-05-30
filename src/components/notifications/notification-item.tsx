import Link from "next/link";

import { NotificationItemActions } from "@/components/notifications/mark-all-read-button";
import { NotificationTypeIcon } from "@/components/notifications/notification-type-icon";
import { Badge } from "@/components/ui/badge";
import {
  formatNotificationDate,
  notificationTypeLabels,
} from "@/lib/notifications/labels";
import { cn } from "@/lib/utils";
import type { Tables } from "@/types/database";

export function NotificationItem({
  notification,
  compact = false,
  showActions = true,
}: {
  notification: Tables<"notifications">;
  compact?: boolean;
  showActions?: boolean;
}) {
  const isRead = Boolean(notification.read_at);
  const content = (
    <>
      <NotificationTypeIcon type={notification.type} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {!isRead ? (
            <Badge className="rounded-full bg-secondary px-2 py-0.5 text-[0.7rem] font-semibold text-warm-foreground">
              Necitită
            </Badge>
          ) : null}
          <span className="text-xs font-semibold uppercase text-primary">
            {notificationTypeLabels[notification.type]}
          </span>
          <span className="text-xs font-semibold text-muted-foreground">
            {formatNotificationDate(notification.created_at)}
          </span>
        </div>
        <h3
          className={cn(
            "mt-1 font-semibold text-foreground",
            compact ? "line-clamp-1 text-sm" : "text-base",
          )}
        >
          {notification.title}
        </h3>
        <p
          className={cn(
            "mt-1 leading-6 text-muted-foreground",
            compact ? "line-clamp-2 text-xs" : "text-sm",
          )}
        >
          {notification.body}
        </p>
      </div>
    </>
  );

  return (
    <article
      className={cn(
        "grid gap-3 rounded-[1.25rem] border border-border bg-card p-4 shadow-soft-sm",
        !isRead && "border-brand-border bg-card",
        !compact && "sm:grid-cols-[1fr_auto] sm:items-center",
      )}
    >
      {notification.action_url ? (
        <Link
          href={notification.action_url}
          className="flex min-w-0 gap-3 rounded-[1rem] transition hover:text-primary"
        >
          {content}
        </Link>
      ) : (
        <div className="flex min-w-0 gap-3">{content}</div>
      )}

      {showActions && !compact ? (
        <NotificationItemActions
          notificationId={notification.id}
          isRead={isRead}
        />
      ) : null}
    </article>
  );
}
