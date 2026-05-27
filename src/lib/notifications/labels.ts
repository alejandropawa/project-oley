import {
  Bell,
  BookmarkCheck,
  Flag,
  Heart,
  Megaphone,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type { Enums } from "@/types/database";

export const notificationTypeLabels: Record<
  Enums<"notification_type">,
  string
> = {
  message_received: "Mesaj nou",
  listing_favorited: "Anunt salvat",
  listing_status_changed: "Status anunt",
  saved_search_match: "Cautare salvata",
  promotion_order_created: "Solicitare promovare",
  promotion_order_approved: "Promovare aprobata",
  promotion_order_rejected: "Promovare respinsa",
  promotion_expiring: "Promovare aproape expirata",
  report_submitted: "Raportare trimisa",
  report_status_changed: "Raportare actualizata",
  system_announcement: "Anunt TROKO",
  review_received: "Review primit",
  verification_approved: "Verificare aprobata",
  verification_rejected: "Verificare respinsa",
  trust_badge_awarded: "Badge acordat",
};

export const notificationTypeIcons = {
  message_received: MessageCircle,
  listing_favorited: Heart,
  listing_status_changed: BookmarkCheck,
  saved_search_match: Search,
  promotion_order_created: Megaphone,
  promotion_order_approved: Sparkles,
  promotion_order_rejected: Megaphone,
  promotion_expiring: Bell,
  report_submitted: Flag,
  report_status_changed: ShieldCheck,
  system_announcement: Bell,
  review_received: ShieldCheck,
  verification_approved: ShieldCheck,
  verification_rejected: ShieldCheck,
  trust_badge_awarded: Sparkles,
} satisfies Record<Enums<"notification_type">, typeof Bell>;

export const notificationPreferenceGroups = [
  {
    key: "messages",
    label: "Mesaje",
    emailField: "email_messages",
    inAppField: "in_app_messages",
  },
  {
    key: "listing_activity",
    label: "Activitate anunturi",
    emailField: "email_listing_activity",
    inAppField: "in_app_listing_activity",
  },
  {
    key: "saved_searches",
    label: "Cautari salvate",
    emailField: "email_saved_searches",
    inAppField: "in_app_saved_searches",
  },
  {
    key: "promotions",
    label: "Promovari",
    emailField: "email_promotions",
    inAppField: "in_app_promotions",
  },
  {
    key: "moderation",
    label: "Moderare si raportari",
    emailField: "email_moderation",
    inAppField: "in_app_moderation",
  },
  {
    key: "system",
    label: "Anunturi de sistem",
    emailField: "email_system",
    inAppField: "in_app_system",
  },
] as const;

export function formatNotificationDate(value: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

