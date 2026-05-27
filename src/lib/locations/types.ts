export type ListingLocationPrecision = "city" | "approximate" | "exact_private";

export const locationPrecisionLabels: Record<ListingLocationPrecision, string> = {
  city: "Doar orașul",
  approximate: "Locație aproximativă",
  exact_private: "Locație exactă privată",
};

export const locationPrecisionDescriptions: Record<ListingLocationPrecision, string> = {
  city: "Recomandat pentru majoritatea anunțurilor.",
  approximate: "Afișăm zona, nu adresa exactă.",
  exact_private: "Coordonatele exacte nu vor fi afișate public.",
};

export const radiusOptions = [
  { value: "", label: "Toată România" },
  { value: "5", label: "5 km" },
  { value: "10", label: "10 km" },
  { value: "25", label: "25 km" },
  { value: "50", label: "50 km" },
  { value: "100", label: "100 km" },
] as const;
