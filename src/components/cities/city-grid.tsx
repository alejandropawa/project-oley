import { CityCard } from "@/components/cities/city-card";
import type { RomanianCity } from "@/lib/romanian-cities";

export function CityGrid({
  cities,
  counts,
}: {
  cities: RomanianCity[];
  counts: Map<string, number>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cities.map((city) => (
        <CityCard
          key={city.slug}
          city={city}
          count={counts.get(city.name) ?? 0}
        />
      ))}
    </div>
  );
}
