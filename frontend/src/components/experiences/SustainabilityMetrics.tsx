"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { getApiBaseUrl } from "@/lib/api";

type M = {
  co2_reduced: number;
  traffic_reduction: number;
  emergency_access: number;
  transit_efficiency: number;
};

const rows: { key: keyof M; label: string; hint: string }[] = [
  {
    key: "co2_reduced",
    label: "CO₂ signal",
    hint: "Mode-shift and routing",
  },
  {
    key: "traffic_reduction",
    label: "Traffic relief",
    hint: "Corridor pressure",
  },
  {
    key: "emergency_access",
    label: "Emergency access",
    hint: "Readiness",
  },
  {
    key: "transit_efficiency",
    label: "Transit performance",
    hint: "Network",
  },
];

function insight(v: number) {
  if (v >= 70) return "Strong";
  if (v >= 40) return "Steady";
  return "Build";
}

export default function SustainabilityMetrics() {
  const [m, setM] = useState<M | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const base = getApiBaseUrl();
    axios
      .get<M>(`${base}/metrics`)
      .then((r) => {
        setM(r.data);
        setErr(null);
      })
      .catch(() => setErr("Live metrics unavailable."));
  }, []);

  return (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <p className="uf-kicker-muted">Sustainability</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          City pulse
        </h1>
        <p className="mt-3 text-slate-400">
          Bars from your metrics endpoint — same numbers as the dashboard strip.
        </p>
      </header>

      {err ? (
        <p className="text-sm text-amber-200/90">{err}</p>
      ) : !m ? (
        <div className="h-44 animate-pulse rounded-2xl border border-[var(--uf-border)] bg-black/20" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((row) => {
            const v = Math.min(100, Math.max(0, m[row.key]));
            return (
              <section key={row.key} className="uf-card p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-medium text-white">{row.label}</h2>
                    <p className="mt-1 text-xs text-slate-600">{row.hint}</p>
                  </div>
                  <span className="rounded-full border border-[var(--uf-border)] bg-black/30 px-2 py-1 text-[11px] text-slate-400">
                    {insight(v)}
                  </span>
                </div>
                <p className="mt-4 text-3xl font-semibold tabular-nums text-white">
                  {v}
                  <span className="text-base font-normal text-slate-500">%</span>
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400/90 to-teal-400/85"
                    style={{ width: `${v}%` }}
                  />
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Link
        href="/dashboard#metrics"
        className="inline-flex text-sm font-medium text-teal-300 hover:text-teal-200"
      >
        Open dashboard metrics →
      </Link>
    </div>
  );
}
