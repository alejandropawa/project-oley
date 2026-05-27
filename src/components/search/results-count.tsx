export function ResultsCount({
  totalCount,
  source,
  locationLabel,
}: {
  totalCount: number;
  source: "supabase" | "mock" | "unavailable";
  locationLabel?: string;
}) {
  return (
    <div>
      <p className="text-sm font-bold uppercase text-primary">
        Am găsit {totalCount} {totalCount === 1 ? "anunț" : "anunțuri"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {source === "supabase"
          ? "Rezultate live, filtrate din baza de date TROKO."
          : "Rezultate demonstrative până când Supabase este disponibil."}
      </p>
      {locationLabel ? (
        <p className="mt-2 inline-flex rounded-full bg-muted px-3 py-1 text-xs font-bold text-primary">
          {locationLabel}
        </p>
      ) : null}
    </div>
  );
}
