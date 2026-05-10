"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { MapPin, Navigation, Sparkles } from "lucide-react";
import { getApiBaseUrl } from "@/lib/api";
import {
  TRIP_STORAGE_KEY,
  downsampleTripCoordinates,
  type RouteAlternativeSummary,
  type StoredTripPayload,
  type TripMapPayload,
} from "@/lib/tripMap";

type TripRouteResponse =
  | ({
      ok: true;
      from: TripMapPayload["from"];
      to: TripMapPayload["to"];
      coordinates: TripMapPayload["coordinates"];
      geometry_source: TripMapPayload["geometry_source"];
      transit_stops: TripMapPayload["transit_stops"];
      buses_hint: TripMapPayload["buses_hint"];
      route_alternatives?: RouteAlternativeSummary[];
    })
  | { ok: false; error: string };

function buildTransitPrompt(start: string, end: string, when: string) {
  const timeHint = when.trim()
    ? `Planned departure (local, as entered by the rider): ${when.trim()}.`
    : `No exact time given — assume a typical weekday and mention how morning vs afternoon rush usually feels so they can pad their schedule.`;

  return `Transit trip planner for the Brampton / Peel / Greater Toronto area.

START: ${start.trim()}
DESTINATION: ${end.trim()}
${timeHint}
Balance reasonable travel time with typical transit reliability.

Reply in plain language with:
1) Best practical transit route — buses, GO, or key transfers in order.
2) Bus connectivity — where to watch for delays, sensible backups if a leg runs late.
3) What traffic is often like around that time on the roads that matter for this trip, and how many minutes of buffer you would add so they are less likely to be late.

Keep under 140 words. If start or end is too vague, ask one short clarifying question instead of guessing.`;
}

export default function TransitExperience() {
  const router = useRouter();
  const [startFrom, setStartFrom] = useState("");
  const [goingTo, setGoingTo] = useState("");
  const [leaveAt, setLeaveAt] = useState("");
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [tripPlanError, setTripPlanError] = useState<string | null>(null);
  const [routeHelp, setRouteHelp] = useState("");

  const fetchRoutePlan = async () => {
    const s = startFrom.trim();
    const d = goingTo.trim();
    if (!s || !d) return;

    setRouteLoading(true);
    setRouteError(null);
    setTripPlanError(null);
    setRouteHelp("");

    const alert = buildTransitPrompt(s, d, leaveAt);
    const base = getApiBaseUrl();

    try {
      const [tripSettled, aiSettled] = await Promise.allSettled([
        axios.get<TripRouteResponse>(`${base}/trip-route`, {
          params: {
            from_place: s,
            to_place: d,
            ...(leaveAt.trim() ? { leave_at: leaveAt.trim() } : {}),
          },
        }),
        axios.get<{ recommendation: string }>(`${base}/ai-recommendation`, {
          params: { alert },
        }),
      ]);

      let tripBody: TripMapPayload | null = null;
      if (tripSettled.status === "fulfilled") {
        const body = tripSettled.value.data;
        if (body.ok) {
          tripBody = {
            from: body.from,
            to: body.to,
            coordinates: body.coordinates,
            geometry_source: body.geometry_source,
            transit_stops: body.transit_stops ?? [],
            buses_hint: body.buses_hint ?? "",
          };
        } else {
          setTripPlanError(body.error);
        }
      } else {
        setTripPlanError(
          "Could not load the trip path. Is the city API running and online?"
        );
      }

      let aiText = "";
      if (aiSettled.status === "fulfilled") {
        aiText = aiSettled.value.data.recommendation;
      } else {
        setRouteError(
          "We couldn’t reach the assistant. Your map trip may still open without the written tips."
        );
      }

      if (tripBody) {
        const routeAlts =
          tripSettled.status === "fulfilled" &&
          tripSettled.value.data.ok &&
          tripSettled.value.data.route_alternatives
            ? tripSettled.value.data.route_alternatives
            : undefined;
        const stored: StoredTripPayload = {
          ...tripBody,
          coordinates: downsampleTripCoordinates(tripBody.coordinates),
          ai_recommendation: aiText || undefined,
          route_alternatives: routeAlts,
        };
        try {
          sessionStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(stored));
        } catch {
          setTripPlanError(
            "Trip was planned but could not be saved for the map (storage full). Try again."
          );
          setRouteLoading(false);
          return;
        }
        router.push("/dashboard#map");
        return;
      }

      if (aiText) {
        setRouteHelp(aiText);
      }
    } catch {
      setRouteError(
        "We couldn’t reach the city API. Check that it is running, then try again."
      );
      setTripPlanError("Network error while planning your trip.");
    } finally {
      setRouteLoading(false);
    }
  };

  const canPlan = startFrom.trim().length > 0 && goingTo.trim().length > 0;

  return (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <p className="uf-kicker-muted">Transit</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Plan a trip
        </h1>
        <p className="mt-3 text-slate-400">
          Enter your start and destination, then open the{" "}
          <strong className="font-medium text-slate-300">city dashboard map</strong>
          : we draw your corridor path, nearby bus stops from open data, and a
          short AI line on which buses to look for — plus written route ideas
          when the assistant is available.
        </p>
      </header>

      <section className="uf-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Navigation className="h-5 w-5 text-teal-400" aria-hidden />
              Door-to-door help
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Plan sends you to the dashboard map with your path and corridor
              stops. Written tips use the same assistant as the rest of UrbanFlow.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--uf-border)] bg-black/30 px-3 py-1 text-[11px] font-medium text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-teal-400/80" aria-hidden />
            AI + map handoff
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-400">
            Starting from
            <input
              type="text"
              value={startFrom}
              onChange={(e) => setStartFrom(e.target.value)}
              placeholder="e.g. Bramalea City Centre, my home near Chinguacousy…"
              className="uf-input mt-2"
              autoComplete="off"
            />
          </label>
          <label className="block text-sm font-medium text-slate-400">
            Heading to
            <input
              type="text"
              value={goingTo}
              onChange={(e) => setGoingTo(e.target.value)}
              placeholder="e.g. downtown Brampton GO, work on Steeles…"
              className="uf-input mt-2"
              autoComplete="off"
            />
          </label>
        </div>

        <label className="mt-4 block text-sm font-medium text-slate-400">
          When are you leaving?{" "}
          <span className="font-normal text-slate-600">
            (optional — helps with rush-hour traffic)
          </span>
          <input
            type="datetime-local"
            value={leaveAt}
            onChange={(e) => setLeaveAt(e.target.value)}
            className="uf-input mt-2 max-w-full sm:max-w-xs"
          />
        </label>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            disabled={!canPlan || routeLoading}
            onClick={() => void fetchRoutePlan()}
            className="uf-btn-primary disabled:cursor-not-allowed disabled:opacity-45"
          >
            {routeLoading ? "Opening dashboard map…" : "Show trip on city map"}
          </button>
          {!canPlan ? (
            <span className="text-xs text-slate-600">
              Add both a start and a destination to continue.
            </span>
          ) : null}
        </div>

        {tripPlanError ? (
          <p className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
            {tripPlanError}
          </p>
        ) : null}

        {routeError ? (
          <p className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
            {routeError}
          </p>
        ) : null}

        {routeHelp ? (
          <div className="uf-inset mt-5 px-4 py-4">
            <p className="text-xs font-medium text-slate-500">Assistant (map path unavailable)</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
              {routeHelp}
            </p>
          </div>
        ) : null}
      </section>

      <p className="text-center text-sm text-slate-500">
        <Link
          href="/dashboard#map"
          className="inline-flex items-center justify-center gap-2 text-teal-300/90 underline-offset-4 hover:underline"
        >
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          Open dashboard map only
        </Link>
      </p>
    </div>
  );
}
