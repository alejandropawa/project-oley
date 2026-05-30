"use client";

import { useState, useTransition } from "react";

import {
  deleteNotificationAction,
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from "@/app/actions/notifications";
import { Button } from "@/components/ui/button";

export function MarkAllReadButton({ disabled }: { disabled?: boolean }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function markAll() {
    setMessage("");
    setError("");
    startTransition(async () => {
      const result = await markAllNotificationsAsReadAction();

      if (!result.success) {
        setError(result.error ?? "Nu am putut actualiza notificările.");
        return;
      }

      setMessage("Toate notificările au fost marcate ca citite.");
    });
  }

  return (
    <div className="grid gap-2">
      <Button
        type="button"
        onClick={markAll}
        disabled={disabled || isPending}
        variant="outline"
        className="h-10 rounded-full border-border bg-card px-4 text-sm font-semibold"
      >
        {isPending ? "Se marchează..." : "Marchează toate ca citite"}
      </Button>
      {message ? <p className="text-sm font-semibold text-primary">{message}</p> : null}
      {error ? <p className="text-sm font-semibold text-destructive">{error}</p> : null}
    </div>
  );
}

export function NotificationItemActions({
  notificationId,
  isRead,
}: {
  notificationId: string;
  isRead: boolean;
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function markRead() {
    setMessage("");
    setError("");
    startTransition(async () => {
      const result = await markNotificationAsReadAction(notificationId);

      if (!result.success) {
        setError(result.error ?? "Nu am putut marca notificarea.");
        return;
      }

      setMessage("Notificarea a fost marcată ca citită.");
    });
  }

  function remove() {
    setMessage("");
    setError("");
    startTransition(async () => {
      const result = await deleteNotificationAction(notificationId);

      if (!result.success) {
        setError(result.error ?? "Nu am putut șterge notificarea.");
        return;
      }

      setMessage("Notificarea a fost ștearsă.");
    });
  }

  return (
    <div className="grid gap-2 sm:justify-items-end">
      <div className="flex flex-wrap gap-2">
        {!isRead ? (
          <Button
            type="button"
            onClick={markRead}
            disabled={isPending}
            variant="outline"
            className="h-9 rounded-full border-border bg-background px-3 text-xs font-semibold"
          >
            {isPending ? "Se marchează..." : "Marchează citită"}
          </Button>
        ) : null}
        <Button
          type="button"
          onClick={remove}
          disabled={isPending}
          variant="ghost"
          className="h-9 rounded-full px-3 text-xs font-semibold text-muted-foreground"
        >
          Șterge
        </Button>
      </div>
      {message ? <p className="text-xs font-semibold text-primary">{message}</p> : null}
      {error ? <p className="text-xs font-semibold text-destructive">{error}</p> : null}
    </div>
  );
}
