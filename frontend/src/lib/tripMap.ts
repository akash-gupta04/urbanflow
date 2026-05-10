/** Session payload when redirecting from Transit → Dashboard map. */

export const TRIP_STORAGE_KEY = "urbanflow.trip.v1";

export type TripTransitStop = {
  name: string;
  lat: number;
  lon: number;
};

export type TripMapPayload = {
  from: {
    lat: number;
    lon: number;
    label: string;
    resolved?: string;
  };
  to: {
    lat: number;
    lon: number;
    label: string;
    resolved?: string;
  };
  coordinates: [number, number][];
  geometry_source: "osrm" | "straight_line";
  transit_stops: TripTransitStop[];
  buses_hint: string;
};

export type StoredTripPayload = TripMapPayload & {
  ai_recommendation?: string;
};

export function downsampleTripCoordinates(
  coords: [number, number][],
  maxPoints = 280
): [number, number][] {
  if (coords.length <= maxPoints) return coords;
  const step = Math.ceil(coords.length / maxPoints);
  const out: [number, number][] = [];
  for (let i = 0; i < coords.length; i += step) {
    out.push(coords[i]);
  }
  const last = coords[coords.length - 1];
  const prev = out[out.length - 1];
  if (prev[0] !== last[0] || prev[1] !== last[1]) {
    out.push(last);
  }
  return out;
}
