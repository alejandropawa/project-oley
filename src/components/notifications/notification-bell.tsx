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
    <details className="group relative block">
      <summary
        aria-label="Deschide notificările"
        title="Notificări"
        className="relative grid size-10 cursor-pointer list-none place-items-center rounded-full text-brand-ink transition hover:bg-brand-soft hover:text-brand focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 min-[1800px]:size-11 [&::-webkit-details-marker]:hidden"
      >
        <Bell className="size-4 stroke-[2]" aria-hidden="true" />
        <NotificationUnreadBadge count={unread.count} />
      </summary>
      <NotificationDropdown notifications={latest.notifications} />
    </details>
  );
}
