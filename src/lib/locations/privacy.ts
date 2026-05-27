import { getCityCoordinates } from "@/lib/romanian-cities";
import type { Coordinates } from "@/lib/locations/distance";
import type { ListingLocationPrecision } from "@/lib/locations/types";

export function roundCoordinates(
  latitude: number,
  longitude: number,
  precision = 2,
): Coordinates {
  const factor = 10 ** precision;

  return {
    latitude: Math.round(latitude * factor) / factor,
    longitude: Math.round(longitude * factor) / factor,
  };
}

export function jitterCoordinates(
  latitude: number,
  longitude: number,
  seed: string,
  radiusMeters = 650,
): Coordinates {
  const hash = stableHash(seed);
  const angle = (hash % 360) * (Math.PI / 180);
  const distance = radiusMeters * (0.35 + ((hash % 100) / 100) * 0.65);
  const deltaLat = distance / 111_320;
  const deltaLng = distance / (111_320 * Math.cos((latitude * Math.PI) / 180));

  return roundCoordinates(
    latitude + Math.sin(angle) * deltaLat,
    longitude + Math.cos(angle) * deltaLng,
    3,
  );
}

export function getPublicLocationForListing(input: {
  id?: string;
  slug?: string;
  city: string;
  county: string;
  latitude?: number | null;
  longitude?: number | null;
  precision?: ListingLocationPrecision;
}) {
  const precision = input.precision ?? "city";
  const cityCoordinates = getCityCoordinates(input.city, input.county);

  if (precision === "city") {
    return cityCoordinates;
  }

  if (input.latitude === null || input.longitude === null) {
    return cityCoordinates;
  }

  if (input.latitude === undefined || input.longitude === undefined) {
    return cityCoordinates;
  }

  if (precision === "approximate") {
    return jitterCoordinates(
      input.latitude,
      input.longitude,
      input.id ?? input.slug ?? `${input.city}-${input.county}`,
    );
  }

  return roundCoordinates(input.latitude, input.longitude, 2);
}

function stableHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}
