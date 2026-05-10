"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  CircleMarker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Building2, Bus, HeartPulse, MapPin, MapPinned } from "lucide-react";
import { getApiBaseUrl } from "@/lib/api";
import type { TripMapPayload } from "@/lib/tripMap";

const LEAFLET_VERSION = "1.9.4";
const ICON_BASE = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/images/`;

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: `${ICON_BASE}marker-icon-2x.png`,
  iconUrl: `${ICON_BASE}marker-icon.png`,
  shadowUrl: `${ICON_BASE}marker-shadow.png`,
});

type Location = {
  name: string;
  type: string;
  lat: number;
  lon: number;
};

const ALERT_LOCATIONS: Record<string, [number, number]> = {
  "Flood Warning": [43.725, -79.75],
  "Heavy Traffic": [43.7315, -79.7624],
  "Heatwave Alert": [43.74, -79.77],
  "Transit Delay": [43.735, -79.748],
  "Storm Advisory": [43.72, -79.79],
};

/** Geometry per alert title — circle colour comes from API severity when you pick an alert. */
const ALERT_AREAS: Record<string, { center: [number, number]; radius: number }> =
  {
    "Flood Warning": { center: [43.725, -79.75], radius: 1000 },
    "Heavy Traffic": { center: [43.7315, -79.7624], radius: 900 },
    "Heatwave Alert": { center: [43.74, -79.77], radius: 1200 },
    "Transit Delay": { center: [43.735, -79.748], radius: 850 },
    "Storm Advisory": { center: [43.72, -79.79], radius: 1300 },
  };

function normalizeSeverity(raw: string): "High" | "Medium" | "Low" | "unknown" {
  const s = raw.trim().toLowerCase();
  if (s === "high") return "High";
  if (s === "medium") return "Medium";
  if (s === "low") return "Low";
  return "unknown";
}

function severityCircleColor(severity: string): string {
  switch (normalizeSeverity(severity)) {
    case "High":
      return "#dc2626";
    case "Medium":
      return "#eab308";
    case "Low":
      return "#22c55e";
    default:
      return "#64748b";
  }
}

function MapNavigation({
  trip,
  selectedAlert,
}: {
  trip: TripMapPayload | null;
  selectedAlert: string;
}) {
  const map = useMap();

  useEffect(() => {
    if (trip && trip.coordinates.length > 0) {
      const pts: L.LatLngExpression[] = [
        ...trip.coordinates,
        [trip.from.lat, trip.from.lon],
        [trip.to.lat, trip.to.lon],
        ...trip.transit_stops.map(
          (s) => [s.lat, s.lon] as [number, number]
        ),
      ];
      const b = L.latLngBounds(pts);
      map.fitBounds(b, { padding: [52, 52], maxZoom: 14, animate: true });
      return;
    }
    const target = ALERT_LOCATIONS[selectedAlert];
    if (selectedAlert && target) {
      map.flyTo(target, 13, { duration: 1.2 });
    }
  }, [trip, selectedAlert, map]);

  return null;
}

function typeIcon(type: string) {
  switch (type) {
    case "hospital":
      return HeartPulse;
    case "transit":
      return Bus;
    case "shelter":
      return Building2;
    default:
      return MapPinned;
  }
}

export default function Map({
  selectedAlert,
  selectedSeverity,
  tripFromTransit,
}: {
  selectedAlert: string;
  selectedSeverity: string;
  tripFromTransit?: TripMapPayload | null;
}) {
  const trip = tripFromTransit ?? null;
  const [locations, setLocations] = useState<Location[]>([]);

  const area = selectedAlert ? ALERT_AREAS[selectedAlert] : null;

  const warningCirclePathOptions = useMemo(() => {
    const color = selectedSeverity
      ? severityCircleColor(selectedSeverity)
      : "#64748b";
    const sev = normalizeSeverity(selectedSeverity);
    const fillOpacity =
      sev === "High" ? 0.24 : sev === "Medium" ? 0.2 : sev === "Low" ? 0.17 : 0.14;
    const weight = sev === "High" ? 3 : 2;
    return {
      color,
      fillColor: color,
      fillOpacity,
      weight,
    };
  }, [selectedSeverity]);

  const tripPolylineOptions = useMemo(() => {
    if (!trip) return null;
    const straight = trip.geometry_source === "straight_line";
    return {
      color: "#2dd4bf",
      weight: straight ? 3 : 5,
      opacity: 0.92,
      lineCap: "round" as const,
      lineJoin: "round" as const,
      dashArray: straight ? "10 7" : undefined,
    };
  }, [trip]);

  const counts = useMemo(() => {
    return locations.reduce(
      (acc, loc) => {
        acc[loc.type] = (acc[loc.type] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [locations]);

  const transitStopCount = trip?.transit_stops.length ?? 0;

  useEffect(() => {
    const base = getApiBaseUrl();
    const fetchLocations = async () => {
      try {
        const response = await axios.get<Location[] | { error: string }>(
          `${base}/nearby-locations`
        );
        if (Array.isArray(response.data)) {
          setLocations(response.data);
        } else {
          setLocations([]);
        }
      } catch {
        setLocations([]);
      }
    };
    fetchLocations();
  }, []);

  return (
    <div className="uf-card overflow-hidden p-0">
      <div className="border-b border-[var(--uf-border)] px-4 pb-4 pt-4 sm:px-5 sm:pt-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <MapPin className="h-5 w-5 shrink-0 text-teal-400/90" aria-hidden />
          Map &amp; what&apos;s around you
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {trip
            ? "Your Transit trip path (driving geometry), corridor bus stops, hospitals, and hubs — tap pins for detail."
            : "Hospitals, transit, and community spots — tap a pin to learn more."}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--uf-border)] px-4 py-3 sm:px-5">
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          {trip ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-400/25 bg-teal-500/10 px-2.5 py-1 font-medium text-teal-200/90">
              <Bus className="h-3.5 w-3.5" aria-hidden />
              Trip corridor stops · {transitStopCount}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--uf-border)] bg-black/30 px-2.5 py-1 font-medium text-slate-400">
            <HeartPulse className="h-3.5 w-3.5 text-rose-300/90" />
            Hospitals nearby · {counts.hospital ?? 0}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--uf-border)] bg-black/30 px-2.5 py-1 font-medium text-slate-400">
            <Bus className="h-3.5 w-3.5 text-sky-300/90" />
            Transit stops · {counts.transit ?? 0}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--uf-border)] bg-black/30 px-2.5 py-1 font-medium text-slate-400">
            <Building2 className="h-3.5 w-3.5 text-amber-200/80" />
            Community hubs · {counts.shelter ?? 0}
          </span>
        </div>
        <p className="text-[11px] text-slate-600">
          Showing {locations.length} helpful spots nearby
        </p>
      </div>

      <div className="h-[min(70vh,640px)] min-h-[420px]">
        <MapContainer
          center={[43.7315, -79.7624]}
          zoom={12}
          className="h-full w-full z-0 [&_.leaflet-control-attribution]:bg-zinc-900/90 [&_.leaflet-control-attribution]:text-zinc-500 [&_.leaflet-control-attribution]:text-[10px]"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapNavigation trip={trip} selectedAlert={selectedAlert} />

          {trip && tripPolylineOptions ? (
            <Polyline
              positions={trip.coordinates}
              pathOptions={tripPolylineOptions}
            />
          ) : null}

          {trip
            ? trip.transit_stops.map((s, i) => (
                <CircleMarker
                  key={`trip-stop-${i}-${s.lat}-${s.lon}`}
                  center={[s.lat, s.lon]}
                  radius={6}
                  pathOptions={{
                    color: "#fbbf24",
                    fillColor: "#fbbf24",
                    fillOpacity: 0.85,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="min-w-[120px] text-slate-900">
                      <p className="m-0 text-xs font-semibold">Bus / transit stop</p>
                      <p className="mt-1 text-xs">{s.name}</p>
                      <p className="mt-1 text-[10px] text-slate-600">
                        Near your planned corridor
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))
            : null}

          {trip ? (
            <>
              <Marker position={[trip.from.lat, trip.from.lon]}>
                <Popup>
                  <div className="min-w-[130px] text-slate-900">
                    <p className="m-0 text-xs font-semibold">Start</p>
                    <p className="mt-1 text-xs">{trip.from.label}</p>
                  </div>
                </Popup>
              </Marker>
              <Marker position={[trip.to.lat, trip.to.lon]}>
                <Popup>
                  <div className="min-w-[130px] text-slate-900">
                    <p className="m-0 text-xs font-semibold">Destination</p>
                    <p className="mt-1 text-xs">{trip.to.label}</p>
                  </div>
                </Popup>
              </Marker>
            </>
          ) : null}

          {locations.map((location, index) => {
            const Icon = typeIcon(location.type);
            return (
              <Marker
                key={`${location.lat}-${location.lon}-${index}`}
                position={[location.lat, location.lon]}
              >
                <Popup>
                  <div className="min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0 text-teal-400" />
                      <h3 className="m-0 text-sm font-semibold text-white">
                        {location.name}
                      </h3>
                    </div>
                    <p className="mt-2 text-xs text-zinc-400">
                      <span className="text-zinc-500">Type · </span>
                      <span className="capitalize">{location.type}</span>
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {area && (
            <Circle
              center={area.center}
              radius={area.radius}
              pathOptions={warningCirclePathOptions}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
