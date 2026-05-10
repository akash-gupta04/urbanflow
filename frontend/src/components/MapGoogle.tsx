"use client";

/// <reference types="google.maps" />

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Circle,
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";
import type { TripMapPayload } from "@/lib/tripMap";
import { urbanFlowMapStyles } from "@/lib/googleMapStyles";
import {
  corridorStopIcon,
  endpointMarkerIcon,
  poiMarkerIcon,
} from "@/lib/mapMarkerIcons";

type Location = {
  name: string;
  type: string;
  lat: number;
  lon: number;
};

const ALERT_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  "Flood Warning": { lat: 43.725, lng: -79.75 },
  "Heavy Traffic": { lat: 43.7315, lng: -79.7624 },
  "Heatwave Alert": { lat: 43.74, lng: -79.77 },
  "Transit Delay": { lat: 43.735, lng: -79.748 },
  "Storm Advisory": { lat: 43.72, lng: -79.79 },
};

const ALERT_AREAS: Record<
  string,
  { center: { lat: number; lng: number }; radius: number }
> = {
  "Flood Warning": { center: { lat: 43.725, lng: -79.75 }, radius: 1000 },
  "Heavy Traffic": { center: { lat: 43.7315, lng: -79.7624 }, radius: 900 },
  "Heatwave Alert": { center: { lat: 43.74, lng: -79.77 }, radius: 1200 },
  "Transit Delay": { center: { lat: 43.735, lng: -79.748 }, radius: 850 },
  "Storm Advisory": { center: { lat: 43.72, lng: -79.79 }, radius: 1300 },
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
      return "#f87171";
    case "Medium":
      return "#facc15";
    case "Low":
      return "#4ade80";
    default:
      return "#64748b";
  }
}

const mapContainerStyle = { width: "100%", height: "100%" };

const defaultCenter = { lat: 43.7315, lng: -79.7624 };

type MapGoogleProps = {
  selectedAlert: string;
  selectedSeverity: string;
  trip: TripMapPayload | null;
  locations: Location[];
};

function useFitTripBounds(
  map: google.maps.Map | null,
  trip: TripMapPayload | null,
  selectedAlert: string,
  locations: Location[]
) {
  useEffect(() => {
    if (!map || typeof google === "undefined") return;

    if (trip && trip.coordinates.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      trip.coordinates.forEach(([lat, lon]) => {
        bounds.extend({ lat, lng: lon });
      });
      bounds.extend({ lat: trip.from.lat, lng: trip.from.lon });
      bounds.extend({ lat: trip.to.lat, lng: trip.to.lon });
      trip.transit_stops.forEach((s) => {
        bounds.extend({ lat: s.lat, lng: s.lon });
      });
      map.fitBounds(bounds, { top: 56, right: 56, bottom: 56, left: 56 });
      const listener = google.maps.event.addListenerOnce(map, "idle", () => {
        const z = map.getZoom();
        if (z !== undefined && z > 15) map.setZoom(15);
      });
      return () => {
        google.maps.event.removeListener(listener);
      };
    }

    const target = selectedAlert ? ALERT_LOCATIONS[selectedAlert] : null;
    if (target) {
      map.panTo(target);
      map.setZoom(13);
      return;
    }

    if (locations.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      locations.forEach((loc) => bounds.extend({ lat: loc.lat, lng: loc.lon }));
      map.fitBounds(bounds, 52);
      return;
    }

    map.panTo(defaultCenter);
    map.setZoom(12);
  }, [map, trip, selectedAlert, locations]);
}

export default function MapGoogle({
  selectedAlert,
  selectedSeverity,
  trip,
  locations,
}: MapGoogleProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  const { isLoaded, loadError } = useJsApiLoader({
    id: "urbanflow-google-map",
    googleMapsApiKey: apiKey,
  });

  const onMapLoad = useCallback((m: google.maps.Map) => {
    setMap(m);
  }, []);

  useFitTripBounds(map, trip, selectedAlert, locations);

  const area = selectedAlert ? ALERT_AREAS[selectedAlert] : null;

  const circleOptions = useMemo((): google.maps.CircleOptions | null => {
    if (!area) return null;
    const color = selectedSeverity
      ? severityCircleColor(selectedSeverity)
      : "#64748b";
    const sev = normalizeSeverity(selectedSeverity);
    const fillOpacity =
      sev === "High" ? 0.22 : sev === "Medium" ? 0.18 : sev === "Low" ? 0.15 : 0.12;
    const weight = sev === "High" ? 2.5 : 2;
    return {
      strokeColor: color,
      strokeOpacity: 0.9,
      strokeWeight: weight,
      fillColor: color,
      fillOpacity,
    };
  }, [area, selectedSeverity]);

  const path = useMemo(() => {
    if (!trip?.coordinates.length) return null;
    return trip.coordinates.map(([lat, lng]) => ({ lat, lng }));
  }, [trip]);

  const routeStyle = useMemo(() => {
    if (!trip) return null;
    const isStraight = trip.geometry_source === "straight_line";
    const isGoogle = trip.geometry_source === "google_directions";
    return { isStraight, isGoogle };
  }, [trip]);

  const polylineMain = useMemo((): google.maps.PolylineOptions | null => {
    if (!trip || !routeStyle) return null;
    const { isStraight, isGoogle } = routeStyle;
    const opts: google.maps.PolylineOptions = {
      strokeColor: "#5eead4",
      strokeOpacity: isStraight ? 0 : 1,
      strokeWeight: isGoogle ? 5 : isStraight ? 3 : 5,
      zIndex: 3,
    };
    if (isStraight) {
      opts.icons = [
        {
          icon: {
            path: "M 0,-1 0,1",
            strokeOpacity: 1,
            strokeColor: "#5eead4",
            strokeWeight: 2,
            scale: 2,
          },
          offset: "0",
          repeat: "12px",
        },
      ];
    }
    return opts;
  }, [trip, routeStyle]);

  const polylineGlow = useMemo((): google.maps.PolylineOptions | null => {
    if (!trip || !path || !routeStyle || routeStyle.isStraight) return null;
    const w = routeStyle.isGoogle ? 14 : 12;
    return {
      strokeColor: "#0f766e",
      strokeOpacity: 0.45,
      strokeWeight: w,
      zIndex: 2,
    };
  }, [trip, path, routeStyle]);

  const icons = useMemo(() => {
    if (!isLoaded || typeof google === "undefined") return null;
    const maps = google.maps;
    return {
      start: endpointMarkerIcon("A", maps),
      end: endpointMarkerIcon("B", maps),
      corridor: corridorStopIcon(maps),
      poi: (t: string) => poiMarkerIcon(t, maps),
    };
  }, [isLoaded]);

  const mapOptions = useMemo((): google.maps.MapOptions | null => {
    if (!isLoaded || typeof google === "undefined") return null;
    return {
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM,
      },
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM,
      },
      gestureHandling: "greedy",
      backgroundColor: "#08090d",
      styles: urbanFlowMapStyles,
    };
  }, [isLoaded]);

  if (loadError) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center bg-[#08090d] px-4 text-center text-sm text-amber-200/90">
        Google Maps could not load. Check your API key and billing on the Google Cloud
        console.
      </div>
    );
  }

  if (!isLoaded || !mapOptions) {
    return (
      <div className="relative flex h-full min-h-[420px] flex-col items-center justify-center overflow-hidden bg-[#08090d]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(45,212,191,0.12), transparent 55%)",
          }}
        />
        <div className="relative flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-full border-2 border-teal-400/30 border-t-teal-400" />
          <p className="text-sm font-medium tracking-wide text-slate-500">Loading map…</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={defaultCenter}
      zoom={12}
      onLoad={onMapLoad}
      options={mapOptions}
    >
      {path && polylineGlow ? <Polyline path={path} options={polylineGlow} /> : null}
      {path && polylineMain ? <Polyline path={path} options={polylineMain} /> : null}

      {trip && icons
        ? trip.transit_stops.map((s, i) => (
            <Marker
              key={`trip-stop-${i}-${s.lat}-${s.lon}`}
              position={{ lat: s.lat, lng: s.lon }}
              icon={icons.corridor}
              title={s.name}
            />
          ))
        : null}

      {trip && icons ? (
        <>
          <Marker
            position={{ lat: trip.from.lat, lng: trip.from.lon }}
            icon={icons.start}
            title={`Start: ${trip.from.label}`}
          />
          <Marker
            position={{ lat: trip.to.lat, lng: trip.to.lon }}
            icon={icons.end}
            title={`Destination: ${trip.to.label}`}
          />
        </>
      ) : null}

      {icons
        ? locations.map((location, index) => (
            <Marker
              key={`${location.lat}-${location.lon}-${index}`}
              position={{ lat: location.lat, lng: location.lon }}
              icon={icons.poi(location.type)}
              title={`${location.name} · ${location.type}`}
            />
          ))
        : null}

      {area && circleOptions ? (
        <Circle center={area.center} radius={area.radius} options={circleOptions} />
      ) : null}
    </GoogleMap>
  );
}
