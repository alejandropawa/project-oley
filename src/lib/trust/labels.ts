import type { Enums } from "@/types/database";

export const trustBadgeLabels: Record<
  Enums<"trust_badge_code">,
  { label: string; description: string }
> = {
  email_verified: {
    label: "Email verificat",
    description: "Adresa de email a fost confirmata.",
  },
  phone_verified: {
    label: "Telefon verificat",
    description: "Numarul de telefon a fost verificat.",
  },
  profile_complete: {
    label: "Profil complet",
    description: "Profilul are informatiile de baza completate.",
  },
  fast_responder: {
    label: "Raspunde rapid",
    description: "Utilizatorul raspunde rapid la mesaje.",
  },
  trusted_seller: {
    label: "Vanzator de incredere",
    description: "Badge acordat de echipa TROKO.",
  },
  business_seller: {
    label: "Business",
    description: "Cont de business.",
  },
  top_rated: {
    label: "Top rated",
    description: "Rating foarte bun de la comunitate.",
  },
  new_member: {
    label: "Membru nou",
    description: "Utilizator nou pe TROKO.",
  },
};

export const verificationStatusLabels: Record<
  Enums<"verification_status">,
  string
> = {
  unverified: "Neverificat",
  pending: "In analiza",
  verified: "Verificat",
  rejected: "Respins",
};

export const reviewStatusLabels: Record<Enums<"review_status">, string> = {
  published: "Publicat",
  pending_review: "In analiza",
  hidden: "Ascuns",
  removed: "Eliminat",
};

export function formatTrustDate(value?: string | null) {
  if (!value) {
    return "indisponibil";
  }

  return new Intl.DateTimeFormat("ro-RO", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

