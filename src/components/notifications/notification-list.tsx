import { NotificationEmptyState } from "@/components/notifications/notification-empty-state";
import { NotificationItem } from "@/components/notifications/notification-item";
import type { Tables } from "@/types/database";

export function NotificationList({
  notifications,
}: {
  notifications: Tables<"notifications">[];
}) {
  if (notifications.length === 0) {
    return <NotificationEmptyState />;
  }

  return (
    <div className="grid gap-3">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
}
