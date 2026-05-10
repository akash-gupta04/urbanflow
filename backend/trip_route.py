"""Geocode free-text places, driving path, and corridor transit stops."""

import os
import time

import requests

from ai_service import generate_bus_lines_hint
from google_routes import (
    directions_driving,
    directions_transit_summary,
    geocode_google,
    get_google_maps_key,
)

NOMINATIM = "https://nominatim.openstreetmap.org/search"
OSRM_BASE = "https://router.project-osrm.org/route/v1/driving"
GEOAPIFY_PLACES = "https://api.geoapify.com/v2/places"

UA = {
    "User-Agent": "UrbanFlow/1.0 (local demo; https://www.openstreetmap.org/copyright)",
}


def geocode_place(query: str):
    q = (query or "").strip()
    if not q:
        return None
    low = q.lower()
    if "ontario" not in low and "canada" not in low:
        q = f"{q}, Peel Region, Ontario, Canada"
    try:
        r = requests.get(
            NOMINATIM,
            params={
                "q": q,
                "format": "json",
                "limit": 1,
                "countrycodes": "ca",
            },
            headers=UA,
            timeout=12,
        )
        r.raise_for_status()
        rows = r.json()
        if not rows:
            return None
        row = rows[0]
        return {
            "lat": float(row["lat"]),
            "lon": float(row["lon"]),
            "resolved": row.get("display_name", ""),
        }
    except Exception:
        return None


def fetch_driving_polyline(lat1, lon1, lat2, lon2):
    url = f"{OSRM_BASE}/{lon1},{lat1};{lon2},{lat2}"
    try:
        r = requests.get(
            url,
            params={"overview": "full", "geometries": "geojson"},
            headers=UA,
            timeout=20,
        )
        r.raise_for_status()
        data = r.json()
        routes = data.get("routes") or []
        if not routes:
            return None
        geom = routes[0].get("geometry") or {}
        if geom.get("type") != "LineString":
            return None
        raw = geom.get("coordinates") or []
        return [[pt[1], pt[0]] for pt in raw]
    except Exception:
        return None


def _geoapify_transit_near(lat, lon, api_key, radius_m=800, limit=12):
    if not api_key:
        return []
    try:
        r = requests.get(
            GEOAPIFY_PLACES,
            params={
                "categories": "public_transport",
                "filter": f"circle:{lon},{lat},{radius_m}",
                "limit": limit,
                "apiKey": api_key,
            },
            timeout=12,
        )
        r.raise_for_status()
        data = r.json()
        out = []
        for feature in data.get("features", []):
            props = feature.get("properties", {}) or {}
            cats = props.get("categories", []) or []
            if not any("public_transport" in c for c in cats):
                continue
            coords = (feature.get("geometry") or {}).get("coordinates")
            if not coords or len(coords) < 2:
                continue
            out.append(
                {
                    "name": props.get("name") or "Transit stop",
                    "lat": float(coords[1]),
                    "lon": float(coords[0]),
                }
            )
        return out
    except Exception:
        return []


def collect_transit_corridor(coords, api_key):
    if not coords or len(coords) < 2 or not api_key:
        return []
    n = len(coords)
    idxs = sorted(
        {0, max(0, n // 4), max(0, n // 2), max(0, (3 * n) // 4), n - 1}
    )
    seen = set()
    merged = []
    for i in idxs:
        lat, lon = coords[i][0], coords[i][1]
        for p in _geoapify_transit_near(lat, lon, api_key):
            key = (round(p["lat"], 4), round(p["lon"], 4))
            if key in seen:
                continue
            seen.add(key)
            merged.append(p)
    return merged[:28]


def build_trip_route(
    from_place: str,
    to_place: str,
    departure_unix: int | None = None,
):
    gkey = get_google_maps_key()
    a = geocode_google(from_place, gkey) if gkey else None
    b = geocode_google(to_place, gkey) if gkey else None
    if not a:
        a = geocode_place(from_place)
    if not b:
        b = geocode_place(to_place)
    if not a or not b:
        return {
            "ok": False,
            "error": (
                "Could not find one or both places. "
                "Try a fuller address or landmark (e.g. “Brampton GO, Ontario”)."
            ),
        }

    lat1, lon1 = a["lat"], a["lon"]
    lat2, lon2 = b["lat"], b["lon"]
    dep = departure_unix if departure_unix and departure_unix > 0 else int(time.time())

    coords = None
    source = "osrm"
    route_alternatives = None
    transit_google_hint = None

    if gkey:
        gdir = directions_driving(lat1, lon1, lat2, lon2, gkey, dep)
        if gdir and gdir.get("coordinates") and len(gdir["coordinates"]) >= 2:
            coords = gdir["coordinates"]
            source = "google_directions"
            route_alternatives = gdir.get("alternatives") or []
        transit_google_hint = directions_transit_summary(
            lat1, lon1, lat2, lon2, gkey, dep
        )

    if not coords or len(coords) < 2:
        coords = fetch_driving_polyline(lat1, lon1, lat2, lon2)
        source = "osrm"
        route_alternatives = None
    if not coords or len(coords) < 2:
        coords = [[lat1, lon1], [lat2, lon2]]
        source = "straight_line"
        route_alternatives = None

    api_key = os.getenv("GEOAPIFY_API_KEY") or ""
    transit_stops = collect_transit_corridor(coords, api_key)
    stop_names = ", ".join(s["name"] for s in transit_stops[:20])
    if not stop_names:
        stop_names = "(no stops returned — configure GEOAPIFY_API_KEY)"

    buses_hint = generate_bus_lines_hint(
        from_place.strip(),
        to_place.strip(),
        stop_names,
    )
    if transit_google_hint:
        buses_hint = f"{buses_hint}\n\n{transit_google_hint}"

    out: dict = {
        "ok": True,
        "from": {
            "lat": lat1,
            "lon": lon1,
            "label": from_place.strip(),
            "resolved": a.get("resolved", ""),
        },
        "to": {
            "lat": lat2,
            "lon": lon2,
            "label": to_place.strip(),
            "resolved": b.get("resolved", ""),
        },
        "coordinates": coords,
        "geometry_source": source,
        "transit_stops": transit_stops,
        "buses_hint": buses_hint,
    }
    if route_alternatives:
        out["route_alternatives"] = route_alternatives
    return out
