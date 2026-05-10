"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { getApiBaseUrl } from "@/lib/api";
import {
  CITY_METRIC_BLOCKS,
  situationTipsForLocation,
  type CityMetrics,
} from "@/lib/cityMetricDisplay";

type Alert = {
  id: number;
  title: string;
  severity: string;
  location: string;
};

function severityStyles(severity: string) {
  switch (severity) {
    case "High":
      return "bg-rose-500/15 text-rose-100 ring-rose-400/30";
    case "Medium":
      return "bg-amber-500/12 text-amber-100 ring-amber-400/25";
    case "Low":
      return "bg-emerald-500/12 text-emerald-100 ring-emerald-400/25";
    default:
      return "bg-slate-600/30 text-slate-200 ring-white/10";
  }
}

export default function EmergencyPanel({
  onSelectAlert,
  selectedAlert,
  metrics,
  metricsLoading,
  metricsAreLive = true,
}: {
  onSelectAlert: (title: string, severity: string) => void;
  selectedAlert: string;
  metrics: CityMetrics | null;
  metricsLoading: boolean;
  /** False when the sidebar is using demo fallback percentages. */
  metricsAreLive?: boolean;
}) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const base = getApiBaseUrl();
    const fetchAlerts = async () => {
      try {
        const response = await axios.get<Alert[]>(`${base}/alerts`);
        setAlerts(response.data);
        setError(null);
      } catch {
        setError("We couldn’t load alerts right now. Your map still works.");
      }
    };
    fetchAlerts();
  }, []);

  const activeAlert = useMemo(
    () => alerts.find((a) => a.title === selectedAlert) ?? null,
    [alerts, selectedAlert]
  );

  const tipsByKey = useMemo(() => {
    if (!activeAlert || !metrics) return null;
    const rows = situationTipsForLocation(
      activeAlert.location,
      activeAlert.title,
      metrics
    );
    return Object.fromEntries(rows.map((t) => [t.key, t])) as Record<
      keyof CityMetrics,
      { key: keyof CityMetrics; currentPct: number; carry: string }
    >;
  }, [activeAlert, metrics]);

  return (
    <section className="uf-card p-5">
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <AlertTriangle className="h-5 w-5 text-amber-400/90" aria-hidden />
          What’s happening
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Pick an alert for its area — we&apos;ll line up all four live signals
          with practical wear-and-carry ideas for that spot.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-100/90">
          {error}
        </p>
      )}

      <ul className="space-y-2">
        {alerts.length === 0 && !error ? (
          <li className="rounded-xl border border-dashed border-[var(--uf-border)] px-4 py-8 text-center text-sm text-slate-500">
            Nothing urgent right now — we’ll show new notices here as soon as
            they arrive.
          </li>
        ) : (
          alerts.map((alert) => {
            const active = selectedAlert === alert.title;
            return (
              <li key={alert.id}>
                <button
                  type="button"
                  onClick={() => onSelectAlert(alert.title, alert.severity)}
                  className={`group flex w-full cursor-pointer flex-col gap-2 rounded-xl border px-4 py-3 text-left transition ${
                    active
                      ? "border-teal-400/35 bg-teal-500/10 ring-1 ring-teal-400/25"
                      : "border-[var(--uf-border)] bg-black/25 hover:border-teal-400/15 hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-white">{alert.title}</span>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${severityStyles(alert.severity)}`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-sm text-slate-500">
                    <span className="line-clamp-2">{alert.location}</span>
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 text-slate-600 transition group-hover:text-teal-400/80 ${
                        active ? "text-teal-400" : ""
                      }`}
                      aria-hidden
                    />
                  </div>
                </button>
              </li>
            );
          })
        )}
      </ul>

      {!selectedAlert ? (
        <p className="mt-5 rounded-xl border border-dashed border-[var(--uf-border)] bg-black/20 px-3 py-4 text-center text-xs leading-relaxed text-slate-500">
          Select an alert to see four location-tuned suggestions — what to wear,
          pack, or double-check — tied to each dashboard signal.
        </p>
      ) : metricsLoading ? (
        <p className="mt-5 text-center text-xs text-slate-500">
          Loading live metrics to pair with this alert…
        </p>
      ) : !metrics ? (
        <p className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-3 text-center text-xs leading-relaxed text-amber-100/90">
          The four dashboard signals aren&apos;t available right now, so
          location wear-and-carry tips can&apos;t be generated. Refresh after
          the API is back.
        </p>
      ) : activeAlert && tipsByKey ? (
        <div className="mt-5 border-t border-[var(--uf-border)] pt-5">
          <p className="text-xs font-medium text-slate-400">
            For{" "}
            <span className="text-teal-200/95">{activeAlert.location}</span>
            <span className="text-slate-600"> · </span>
            <span className="text-slate-300">{activeAlert.title}</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-600">
            Each card uses the same % as the quadrant above, tuned to this
            notice.
          </p>
          {!metricsAreLive ? (
            <p className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-2.5 py-2 text-[11px] leading-relaxed text-amber-100/85">
              Sample corridor percentages — wear-and-carry ideas are
              illustrative until live metrics load.
            </p>
          ) : null}
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {CITY_METRIC_BLOCKS.map((block) => {
              const tip = tipsByKey[block.key];
              const Icon = block.Icon;
              if (!tip) return null;
              return (
                <div
                  key={block.key}
                  className="rounded-lg border border-[var(--uf-border)] bg-black/20 px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium tracking-wide text-slate-500">
                        {block.title}
                      </p>
                      <p className="mt-0.5 text-base font-medium tabular-nums text-slate-100">
                        {tip.currentPct}
                        <span className="ml-0.5 text-[11px] font-medium text-slate-600">
                          %
                        </span>
                      </p>
                    </div>
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-slate-400 ring-1 ring-white/[0.06]">
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                    </div>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
                    {tip.carry}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
