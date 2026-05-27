import Link from "next/link";

import { NotificationItem } from "@/components/notifications/notification-item";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/types/database";

export function NotificationDropdown({
  notifications,
}: {
  notifications: Tables<"notifications">[];
}) {
  return (
    <div className="absolute right-0 top-12 w-[min(22rem,calc(100vw-2rem))] rounded-[1.5rem] border border-border bg-card p-3 shadow-soft">
      <div className="flex items-center justify-between gap-3 px-2 py-1">
        <h2 className="text-sm font-black text-foreground">Notificări</h2>
        <Link
          href="/cont/notificari"
          className="text-xs font-bold text-muted-foreground hover:text-primary"
        >
          Setări
        </Link>
      </div>
      <div className="mt-2 grid max-h-[28rem] gap-2 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              compact
              showActions={false}
            />
          ))
        ) : (
          <div className="rounded-[1rem] border border-dashed border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
            Nu ai notificări încă.
          </div>
        )}
      </div>
      <Button
        asChild
        className="mt-3 h-10 w-full rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground"
      >
        <Link href="/notificari">Vezi toate notificările</Link>
      </Button>
    </div>
  );
}
