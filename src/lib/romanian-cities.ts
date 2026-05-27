import { normalizeRomanianSlug } from "@/lib/seo/slug";

export type RomanianCity = {
  name: string;
  slug: string;
  county: string;
  countySlug: string;
  latitude: number;
  longitude: number;
  region?: string;
};

export const romanianCities: RomanianCity[] = [
  city("București", "bucuresti", "București", "bucuresti", 44.4268, 26.1025, "Muntenia"),
  city("Cluj-Napoca", "cluj-napoca", "Cluj", "cluj", 46.7712, 23.6236, "Transilvania"),
  city("Iași", "iasi", "Iași", "iasi", 47.1585, 27.6014, "Moldova"),
  city("Timișoara", "timisoara", "Timiș", "timis", 45.7489, 21.2087, "Banat"),
  city("Brașov", "brasov", "Brașov", "brasov", 45.6427, 25.5887, "Transilvania"),
  city("Constanța", "constanta", "Constanța", "constanta", 44.1598, 28.6348, "Dobrogea"),
  city("Oradea", "oradea", "Bihor", "bihor", 47.0465, 21.9189, "Crișana"),
  city("Sibiu", "sibiu", "Sibiu", "sibiu", 45.7983, 24.1256, "Transilvania"),
  city("Craiova", "craiova", "Dolj", "dolj", 44.3302, 23.7949, "Oltenia"),
  city("Ploiești", "ploiesti", "Prahova", "prahova", 44.9367, 26.0129, "Muntenia"),
  city("Arad", "arad", "Arad", "arad", 46.1866, 21.3123, "Crișana"),
  city("Galați", "galati", "Galați", "galati", 45.4353, 28.0078, "Moldova"),
  city("Pitești", "pitesti", "Argeș", "arges", 44.8565, 24.8692, "Muntenia"),
  city("Suceava", "suceava", "Suceava", "suceava", 47.6514, 26.2556, "Bucovina"),
  city("Târgu Mureș", "targu-mures", "Mureș", "mures", 46.5425, 24.5575, "Transilvania"),
];

export function getCityBySlug(slug: string) {
  const normalized = normalizeRomanianSlug(slug);
  return romanianCities.find((city) => city.slug === normalized);
}

export function getCityByName(name: string) {
  const normalized = normalizeRomanianSlug(name);

  return romanianCities.find((city) => city.slug === normalized);
}

export function getCityCoordinates(cityName: string, countyName?: string) {
  const city = getCityByName(cityName);

  if (!city) {
    return null;
  }

  if (countyName && city.countySlug !== normalizeRomanianSlug(countyName)) {
    return null;
  }

  return {
    latitude: city.latitude,
    longitude: city.longitude,
  };
}

export function getCountyBySlug(slug: string) {
  return getCountyOptions().find((county) => county.slug === slug);
}

export function getCityOptions() {
  return romanianCities.map((city) => ({
    label: city.name,
    value: city.slug,
    county: city.county,
    countySlug: city.countySlug,
    latitude: city.latitude,
    longitude: city.longitude,
  }));
}

export function getCountyOptions() {
  const counties = new Map<string, { label: string; slug: string }>();

  for (const city of romanianCities) {
    counties.set(city.countySlug, { label: city.county, slug: city.countySlug });
  }

  return Array.from(counties.values()).sort((a, b) =>
    a.label.localeCompare(b.label, "ro"),
  );
}

function city(
  name: string,
  slug: string,
  county: string,
  countySlug: string,
  latitude: number,
  longitude: number,
  region: string,
): RomanianCity {
  return { name, slug, county, countySlug, latitude, longitude, region };
}

export { normalizeRomanianSlug };
