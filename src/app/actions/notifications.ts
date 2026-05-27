"use server";

import { revalidatePath } from "next/cache";

import {
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/db/notifications";
import {
  updateCurrentUserNotificationPreferences,
  type NotificationPreferencesUpdate,
} from "@/lib/db/notification-preferences";
import { createClient } from "@/lib/supabase/server";

export type NotificationActionResult = {
  success: boolean;
  error?: string;
};

export async function markNotificationAsReadAction(
  notificationId: string,
): Promise<NotificationActionResult> {
  const supabase = await createClient();
  const result = await markNotificationAsRead(notificationId, supabase);

  if (result.error) {
    return { success: false, error: getNotificationError(result.error) };
  }

  revalidateNotifications();
  return { success: true };
}

export async function markAllNotificationsAsReadAction(): Promise<NotificationActionResult> {
  const supabase = await createClient();
  const result = await markAllNotificationsAsRead(supabase);

  if (result.error) {
    return { success: false, error: getNotificationError(result.error) };
  }

  revalidateNotifications();
  return { success: true };
}

export async function deleteNotificationAction(
  notificationId: string,
): Promise<NotificationActionResult> {
  const supabase = await createClient();
  const result = await deleteNotification(notificationId, supabase);

  if (result.error) {
    return { success: false, error: getNotificationError(result.error) };
  }

  revalidateNotifications();
  return { success: true };
}

export async function updateNotificationPreferencesAction(
  input: NotificationPreferencesUpdate,
): Promise<NotificationActionResult> {
  const supabase = await createClient();
  const result = await updateCurrentUserNotificationPreferences(input, supabase);

  if (result.error) {
    return { success: false, error: getNotificationError(result.error) };
  }

  revalidateNotifications();
  return { success: true };
}

function revalidateNotifications() {
  revalidatePath("/notificari");
  revalidatePath("/cont");
  revalidatePath("/cont/notificari");
}

function getNotificationError(error: string) {
  if (error === "NOT_AUTHENTICATED") {
    return "Intră în cont pentru a actualiza notificările.";
  }

  if (error === "SUPABASE_NOT_CONFIGURED") {
    return "Notificările vor fi disponibile după configurarea Supabase.";
  }

  if (error === "UPDATE_PREFERENCES_FAILED") {
    return "Nu am putut salva preferințele.";
  }

  return "Nu am putut actualiza notificările. Încearcă din nou.";
}
