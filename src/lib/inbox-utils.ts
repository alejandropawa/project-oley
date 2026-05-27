import type { ConversationListing } from "@/lib/db/conversations";
import type { Enums } from "@/types/database";

export const conversationStatusLabels: Record<
  Enums<"conversation_status">,
  string
> = {
  active: "Activă",
  archived: "Arhivată",
  blocked: "Blocată",
};

export const listingStatusLabels: Record<string, string> = {
  draft: "Draft",
  active: "Activ",
  reserved: "Rezervat",
  sold: "Vândut",
  expired: "Expirat",
  archived: "Arhivat",
};

export function formatConversationPrice(listing: ConversationListing) {
  if (listing.price_cents === null) {
    return "Preț de discutat";
  }

  const amount = new Intl.NumberFormat("ro-RO").format(
    Math.round(listing.price_cents / 100),
  );

  return `${amount} ${listing.currency === "EUR" ? "EUR" : "RON"}`;
}

export function formatMessageTime(value: string | null) {
  if (!value) {
    return "Fără mesaje";
  }

  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getConversationInitial(name: string) {
  return name.trim().charAt(0).toLocaleUpperCase("ro") || "T";
}
