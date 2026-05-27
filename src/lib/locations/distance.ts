export type Coordinates = {
  latitude: number;
  longitude: number;
};

export function calculateDistanceKm(a: Coordinates, b: Coordinates) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;

  return 2 * earthRadiusKm * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistanceKm(distanceKm?: number | null) {
  if (distanceKm === null || distanceKm === undefined) {
    return null;
  }

  if (distanceKm < 1) {
    return "La mai puțin de 1 km";
  }

  return `La aproximativ ${Math.round(distanceKm)} km`;
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
