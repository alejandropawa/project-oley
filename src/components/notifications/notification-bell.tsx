import { Bell } from "lucide-react";

import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { NotificationUnreadBadge } from "@/components/notifications/notification-unread-badge";
import {
  getCurrentUserNotifications,
  getUnreadNotificationCount,
} from "@/lib/db/notifications";
import { createClient } from "@/lib/supabase/server";

export async function NotificationBell() {
  const supabase = await createClient();
  const [latest, unread] = await Promise.all([
    getCurrentUserNotifications({ limit: 5 }, supabase),
    getUnreadNotificationCount(supabase),
  ]);

  if (latest.source === "unavailable" && unread.source === "unavailable") {
    return null;
  }

  return (
    <details className="group relative hidden md:block">
      <summary
        aria-label="Deschide notificările"
        className="relative grid size-11 cursor-pointer list-none place-items-center rounded-full text-muted-foreground transition hover:bg-card hover:text-foreground [&::-webkit-details-marker]:hidden"
      >
        <Bell className="size-4" aria-hidden="true" />
        <NotificationUnreadBadge count={unread.count} />
      </summary>
      <NotificationDropdown notifications={latest.notifications} />
    </details>
  );
}
