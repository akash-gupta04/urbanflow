"""Google Geocoding + Directions for traffic-aware routes and alternatives."""

from __future__ import annotations

import os
from typing import Any

import requests

GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
DIRECTIONS_URL = "https://maps.googleapis.com/maps/api/directions/json"


def _decode_polyline(polyline: str) -> list[list[float]]:
    """Decode Google's encoded polyline to [[lat, lon], ...]."""
    if not polyline:
        return []
    index = 0
    lat = 0
    lng = 0
    coordinates: list[list[float]] = []
    while index < len(polyline):
        shift = 0
        result = 0
        while True:
            b = ord(polyline[index]) - 63
            index += 1
            result |= (b & 0x1F) << shift
            shift += 5
            if b < 0x20:
                break
        dlat = ~(result >> 1) if (result & 1) else (result >> 1)
        lat += dlat

        shift = 0
        result = 0
        while True:
            b = ord(polyline[index]) - 63
            index += 1
            result |= (b & 0x1F) << shift
            shift += 5
            if b < 0x20:
                break
        dlng = ~(result >> 1) if (result & 1) else (result >> 1)
        lng += dlng

        coordinates.append([lat * 1e-5, lng * 1e-5])
    return coordinates


def geocode_google(query: str, api_key: str) -> dict[str, Any] | None:
    q = (query or "").strip()
    if not q or not api_key:
        return None
    low = q.lower()
    if "ontario" not in low and "canada" not in low:
        q = f"{q}, Peel Region, Ontario, Canada"
    try:
        r = requests.get(
            GEOCODE_URL,
            params={
                "address": q,
                "key": api_key,
                "region": "ca",
                "components": "country:CA",
            },
            timeout=15,
        )
        r.raise_for_status()
        data = r.json()
        if data.get("status") not in ("OK", "ZERO_RESULTS"):
            return None
        rows = data.get("results") or []
        if not rows:
            return None
        row = rows[0]
        loc = row.get("geometry", {}).get("location") or {}
        return {
            "lat": float(loc["lat"]),
            "lon": float(loc["lng"]),
            "resolved": row.get("formatted_address", ""),
        }
    except Exception:
        return None


def _leg_seconds(leg: dict[str, Any]) -> tuple[int, int | None]:
    dur = (leg.get("duration") or {}).get("value")
    dit = (leg.get("duration_in_traffic") or {}).get("value")
    base = int(dur) if dur is not None else 0
    traffic = int(dit) if dit is not None else None
    return base, traffic


def _route_score(route: dict[str, Any]) -> int:
    """Lower is better — per leg, use traffic duration when Google returns it."""
    legs = route.get("legs") or []
    total = 0
    for leg in legs:
        base, traffic = _leg_seconds(leg)
        total += traffic if traffic is not None else base
    return total


def directions_driving(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
    api_key: str,
    departure_unix: int | None,
) -> dict[str, Any] | None:
    if not api_key:
        return None
    params: dict[str, Any] = {
        "origin": f"{lat1},{lon1}",
        "destination": f"{lat2},{lon2}",
        "mode": "driving",
        "alternatives": "true",
        "key": api_key,
    }
    if departure_unix is not None and departure_unix > 0:
        params["departure_time"] = str(departure_unix)
        params["traffic_model"] = "best_guess"
    try:
        r = requests.get(DIRECTIONS_URL, params=params, timeout=20)
        r.raise_for_status()
        data = r.json()
        if data.get("status") not in ("OK", "ZERO_RESULTS"):
            return None
        routes = data.get("routes") or []
        if not routes:
            return None
        scored = sorted(
            [( _route_score(rt), i, rt) for i, rt in enumerate(routes)],
            key=lambda x: (x[0], x[1]),
        )
        best = scored[0][2]
        poly = (best.get("overview_polyline") or {}).get("points") or ""
        coords = _decode_polyline(poly)
        alternatives: list[dict[str, Any]] = []
        for rank, (_, _, rt) in enumerate(scored[:3]):
            legs = rt.get("legs") or []
            if not legs:
                continue
            dist_m = sum(
                int((lg.get("distance") or {}).get("value") or 0) for lg in legs
            )
            total_s = _route_score(rt)
            mins = max(1, (total_s + 59) // 60)
            dist_km = dist_m / 1000.0
            alternatives.append(
                {
                    "summary": rt.get("summary") or "Route",
                    "duration_text": f"{mins} min",
                    "distance_text": f"{dist_km:.1f} km",
                    "duration_seconds": total_s,
                    "distance_meters": dist_m,
                    "is_best": rank == 0,
                }
            )
        return {"coordinates": coords, "alternatives": alternatives}
    except Exception:
        return None


def directions_transit_summary(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
    api_key: str,
    departure_unix: int,
) -> str | None:
    if not api_key or departure_unix <= 0:
        return None
    try:
        r = requests.get(
            DIRECTIONS_URL,
            params={
                "origin": f"{lat1},{lon1}",
                "destination": f"{lat2},{lon2}",
                "mode": "transit",
                "departure_time": str(departure_unix),
                "key": api_key,
            },
            timeout=20,
        )
        r.raise_for_status()
        data = r.json()
        if data.get("status") != "OK":
            return None
        routes = data.get("routes") or []
        if not routes:
            return None
        rt = routes[0]
        legs = rt.get("legs") or []
        if not legs:
            return None
        parts: list[str] = []
        for leg in legs:
            for step in leg.get("steps") or []:
                tr = step.get("transit_details")
                if not tr:
                    continue
                line = (tr.get("line") or {}).get("short_name") or (tr.get("line") or {}).get("name")
                head = (tr.get("headsign") or "").strip()
                if line:
                    chunk = f"{line}"
                    if head:
                        chunk += f" → {head}"
                    parts.append(chunk)
        if not parts:
            dur = (legs[0].get("duration") or {}).get("text", "")
            return f"Google Transit: about {dur} (see Maps for step-by-step)."
        return "Transit option: " + " · ".join(parts[:8])
    except Exception:
        return None


def get_google_maps_key() -> str:
    return (os.getenv("GOOGLE_MAPS_API_KEY") or "").strip()
