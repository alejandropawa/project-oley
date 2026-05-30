"use client";

import { useState, useTransition } from "react";

import { updateNotificationPreferencesAction } from "@/app/actions/notifications";
import { Button } from "@/components/ui/button";
import { notificationPreferenceGroups } from "@/lib/notifications/labels";
import type { Tables } from "@/types/database";

type PreferenceState = Pick<
  Tables<"notification_preferences">,
  | "email_messages"
  | "email_listing_activity"
  | "email_saved_searches"
  | "email_promotions"
  | "email_moderation"
  | "email_system"
  | "in_app_messages"
  | "in_app_listing_activity"
  | "in_app_saved_searches"
  | "in_app_promotions"
  | "in_app_moderation"
  | "in_app_system"
>;

export function NotificationPreferencesForm({
  preferences,
}: {
  preferences: Tables<"notification_preferences">;
}) {
  const [values, setValues] = useState<PreferenceState>({
    email_messages: preferences.email_messages,
    email_listing_activity: preferences.email_listing_activity,
    email_saved_searches: preferences.email_saved_searches,
    email_promotions: preferences.email_promotions,
    email_moderation: preferences.email_moderation,
    email_system: preferences.email_system,
    in_app_messages: preferences.in_app_messages,
    in_app_listing_activity: preferences.in_app_listing_activity,
    in_app_saved_searches: preferences.in_app_saved_searches,
    in_app_promotions: preferences.in_app_promotions,
    in_app_moderation: preferences.in_app_moderation,
    in_app_system: preferences.in_app_system,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function update(field: keyof PreferenceState, checked: boolean) {
    setValues((current) => ({ ...current, [field]: checked }));
  }

  function save() {
    setMessage("");
    setError("");
    startTransition(async () => {
      const result = await updateNotificationPreferencesAction(values);

      if (!result.success) {
        setError(result.error ?? "Nu am putut salva preferințele.");
        return;
      }

      setMessage("Preferințele de notificare au fost salvate.");
    });
  }

  return (
    <div className="grid gap-5">
      <div className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-soft-sm">
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-border px-4 py-3 text-xs font-semibold uppercase text-muted-foreground sm:px-5">
          <span>Tip</span>
          <span>Email</span>
          <span>În app</span>
        </div>
        {notificationPreferenceGroups.map((group) => (
          <div
            key={group.key}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-border px-4 py-4 last:border-b-0 sm:px-5"
          >
            <div>
              <h2 className="font-semibold text-foreground">{group.label}</h2>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Primești notificări relevante pentru această categorie.
              </p>
            </div>
            <Toggle
              label={`Email: ${group.label}`}
              checked={values[group.emailField]}
              onChange={(checked) => update(group.emailField, checked)}
            />
            <Toggle
              label={`În app: ${group.label}`}
              checked={values[group.inAppField]}
              onChange={(checked) => update(group.inAppField, checked)}
            />
          </div>
        ))}
      </div>

      {message ? <p className="text-sm font-semibold text-primary">{message}</p> : null}
      {error ? <p className="text-sm font-semibold text-destructive">{error}</p> : null}

      <Button
        type="button"
        onClick={save}
        disabled={isPending}
        className="h-11 w-fit rounded-full bg-primary px-5 font-semibold text-primary-foreground"
      >
        {isPending ? "Se salvează..." : "Salvează preferințele"}
      </Button>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2">
      <span className="sr-only">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span className="relative h-7 w-12 rounded-full border border-border bg-background transition peer-checked:border-primary peer-checked:bg-primary peer-checked:[&>span]:translate-x-5 peer-checked:[&>span]:bg-primary-foreground">
        <span className="absolute left-1 top-1 size-5 rounded-full bg-muted-foreground/45 transition" />
      </span>
    </label>
  );
}
