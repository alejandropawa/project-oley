import { normalizeRomanianSlug } from "@/lib/romanian-cities";

export function createProfileSlug(displayName: string, userId: string) {
  const base = normalizeRomanianSlug(displayName || "utilizator-troko");
  const suffix = userId.replaceAll("-", "").slice(0, 6);

  return `${base || "utilizator-troko"}-${suffix}`;
}

