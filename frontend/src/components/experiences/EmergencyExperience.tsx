"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { AlertTriangle, Shield, MapPin } from "lucide-react";
import { getApiBaseUrl } from "@/lib/api";

type Alert = {
  id: number;
  title: string;
  severity: string;
  location: string;
};

const steps = [
  "Confirm your household is accounted for.",
  "Follow marked corridors away from the hazard zone.",
  "Prefer transit hubs and hospitals shown on the city map.",
  "Listen for service updates on official channels.",
];

export default function EmergencyExperience() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const base = getApiBaseUrl();
    axios
      .get<Alert[]>(`${base}/alerts`)
      .then((r) => {
        setAlerts(r.data);
        setError(null);
      })
      .catch(() => setError("Live feed unavailable"));
  }, []);

  const highest = alerts.some((a) => a.severity === "High");

  return (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <p className="uf-kicker-muted">Emergency</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Response mode
        </h1>
        <p className="mt-3 text-slate-400">
          Signals first, then next steps, then the map when you are ready to
          move.
        </p>
      </header>

      {highest ? (
        <div
          className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-4 text-rose-100"
          role="status"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">Elevated advisory</p>
            <p className="mt-1 text-sm text-rose-200/90">
              At least one high-severity alert — treat routes as provisional
              until verified locally.
            </p>
          </div>
        </div>
      ) : null}

      <section className="uf-card p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Shield className="h-5 w-5 text-teal-400" aria-hidden />
          Active signals
        </h2>
        {error ? (
          <p className="mt-4 text-sm text-amber-200/90">{error}</p>
        ) : alerts.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No alerts right now.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {alerts.map((a) => (
              <li
                key={a.id}
                className="rounded-xl border border-[var(--uf-border)] bg-black/25 px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-white">{a.title}</span>
                  <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs text-slate-300">
                    {a.severity}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{a.location}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="uf-card p-6">
        <h2 className="text-lg font-semibold text-white">If you are moving</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-slate-300">
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <Link
          href="/dashboard#map"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-teal-400/30 bg-gradient-to-r from-teal-500/15 to-indigo-500/10 px-4 py-3 text-sm font-semibold text-teal-50 shadow-inner shadow-teal-500/5 transition hover:border-teal-400/45 hover:from-teal-500/25 no-underline"
        >
          <MapPin className="h-4 w-4" aria-hidden />
          Open response map
        </Link>
      </section>
    </div>
  );
}
