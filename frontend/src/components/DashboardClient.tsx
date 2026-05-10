"use client";

import dynamic from "next/dynamic";
import { useMemo, useEffect, useState } from "react";
import axios from "axios";

import Metrics from "@/components/Metrics";
import EmergencyPanel from "@/components/EmergencyPanel";
import { getApiBaseUrl } from "@/lib/api";
import {
  DEMO_CITY_METRICS,
  type CityMetrics,
} from "@/lib/cityMetricDisplay";
import {
  TRIP_STORAGE_KEY,
  type StoredTripPayload,
} from "@/lib/tripMap";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function DashboardClient() {
  const [tripFromTransit, setTripFromTransit] = useState<StoredTripPayload | null>(
    null
  );
  const [selectedAlert, setSelectedAlert] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("");

  const handleSelectAlert = (title: string, severity: string) => {
    setSelectedAlert(title)
    setSelectedSeverity(severity);
  };
  const [metrics, setMetrics] = useState<CityMetrics | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(TRIP_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredTripPayload;
      sessionStorage.removeItem(TRIP_STORAGE_KEY);
      setTripFromTransit(parsed);
    } catch {
      sessionStorage.removeItem(TRIP_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!tripFromTransit) return;
    const id = window.requestAnimationFrame(() => {
      document.getElementById("map")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [tripFromTransit]);

  useEffect(() => {
    const base = getApiBaseUrl();
    let cancelled = false;
    const load = async () => {
      setMetricsLoading(true);
      try {
        const { data } = await axios.get<CityMetrics>(`${base}/metrics`);
        if (!cancelled) {
          setMetrics(data);
          setMetricsError(null);
        }
      } catch {
        if (!cancelled) {
          setMetricsError(
            "We couldn’t refresh these numbers. Check back in a moment."
          );
          setMetrics(null);
        }
      } finally {
        if (!cancelled) setMetricsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayMetrics = useMemo(() => {
    if (metrics) return metrics;
    if (!metricsLoading && metricsError) return DEMO_CITY_METRICS;
    return null;
  }, [metrics, metricsLoading, metricsError]);

  const metricsDemoMode = Boolean(!metrics && metricsError && displayMetrics);

  return (
    <>
      <div id="metrics" className="mb-6 scroll-mt-36 sm:scroll-mt-40">
        <div className="uf-card p-4 sm:p-5">
          <Metrics
            data={displayMetrics}
            loading={metricsLoading && !displayMetrics}
            demoMode={metricsDemoMode}
            apiErrorMessage={metricsDemoMode ? metricsError : null}
          />
        </div>
      </div>

      {tripFromTransit ? (
        <div className="mb-6 scroll-mt-36 rounded-xl border border-teal-400/20 bg-teal-950/20 px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-300/90">
            Trip from Transit
          </p>
          <p className="mt-1 text-sm text-slate-300">
            <span className="text-white">{tripFromTransit.from.label}</span>
            <span className="text-slate-500"> → </span>
            <span className="text-white">{tripFromTransit.to.label}</span>
          </p>
          {tripFromTransit.route_alternatives &&
          tripFromTransit.route_alternatives.length > 0 ? (
            <div className="mt-3 border-t border-white/[0.06] pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-300/90">
                Driving options (Google ranked by time in traffic)
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-300">
                {tripFromTransit.route_alternatives.map((r, i) => (
                  <li
                    key={`${r.summary}-${i}`}
                    className={
                      r.is_best
                        ? "rounded-lg border border-teal-400/30 bg-teal-500/10 px-3 py-2"
                        : "rounded-lg border border-white/[0.06] px-3 py-2"
                    }
                  >
                    <span className="font-medium text-white">{r.summary}</span>
                    <span className="text-slate-500"> · </span>
                    <span>{r.duration_text}</span>
                    <span className="text-slate-500"> · </span>
                    <span>{r.distance_text}</span>
                    {r.is_best ? (
                      <span className="ml-2 text-[10px] font-semibold uppercase text-teal-300/90">
                        Best now
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {tripFromTransit.buses_hint ? (
            <p className="mt-3 text-sm leading-relaxed text-teal-100/95">
              <span className="font-medium text-teal-200/90">Buses to look for · </span>
              {tripFromTransit.buses_hint}
            </p>
          ) : null}
          {tripFromTransit.ai_recommendation ? (
            <p className="mt-3 whitespace-pre-wrap border-t border-white/[0.06] pt-3 text-xs leading-relaxed text-slate-400">
              {tripFromTransit.ai_recommendation}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
        <div id="map" className="scroll-mt-36 sm:scroll-mt-40 lg:col-span-8">
          <Map
            selectedAlert={selectedAlert}
            selectedSeverity={selectedSeverity}
            tripFromTransit={tripFromTransit}
          />
        </div>

        <aside
          id="alerts"
          className="scroll-mt-36 space-y-5 sm:scroll-mt-40 lg:col-span-4"
        >
          <EmergencyPanel
            onSelectAlert={handleSelectAlert}
            selectedAlert={selectedAlert}
            metrics={displayMetrics}
            metricsLoading={metricsLoading && !displayMetrics}
            metricsAreLive={metrics !== null}
          />
        </aside>
      </div>

      <footer className="mt-16 border-t border-[var(--uf-border)] pt-8 text-center text-sm text-slate-500">
        <p>UrbanFlow keeps this view in sync with your live city data.</p>
        <details className="mt-3 text-xs text-slate-600">
          <summary className="cursor-pointer text-slate-500 hover:text-slate-400">
            For developers
          </summary>
          <p className="mt-2 font-mono text-[11px] leading-relaxed text-slate-600">
            alerts · metrics · trip-route · nearby-locations
          </p>
        </details>
      </footer>
    </>
  );
}
