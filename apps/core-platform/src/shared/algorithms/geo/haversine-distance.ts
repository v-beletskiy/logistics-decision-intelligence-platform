import { degreesToRadians } from "../../utils/math";

const EARTH_RADIUS_KM = 6371;

export interface Coordinate {
  readonly latitude: number;
  readonly longitude: number;
}

export function haversineDistanceKilometers(
  a: Coordinate,
  b: Coordinate,
): number {
  const dLat = degreesToRadians(b.latitude - a.latitude);
  const dLon = degreesToRadians(b.longitude - a.longitude);
  const lat1 = degreesToRadians(a.latitude);
  const lat2 = degreesToRadians(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}
