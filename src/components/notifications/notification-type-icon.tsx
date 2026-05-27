import { notificationTypeIcons } from "@/lib/notifications/labels";
import { cn } from "@/lib/utils";
import type { Enums } from "@/types/database";

export function NotificationTypeIcon({
  type,
  className,
}: {
  type: Enums<"notification_type">;
  className?: string;
}) {
  const Icon = notificationTypeIcons[type];

  return (
    <span
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-[1rem] bg-muted text-primary",
        className,
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
    </span>
  );
}
