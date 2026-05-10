"use client";

import { useCallback, useState } from "react";
import axios from "axios";
import { CloudSun, Sparkles } from "lucide-react";
import CityPredictPanel from "@/components/CityPredictPanel";
import { getApiBaseUrl } from "@/lib/api";

export default function GraniteExperience() {
  const [alertDraft, setAlertDraft] = useState(
    "Heat advisory and poor air quality — downtown core."
  );
  const [recLoading, setRecLoading] = useState(false);
  const [recText, setRecText] = useState<string | null>(null);
  const [recError, setRecError] = useState<string | null>(null);

  const runRecommendation = useCallback(async () => {
    const alert = alertDraft.trim();
    if (!alert) return;
    setRecLoading(true);
    setRecError(null);
    setRecText(null);
    const base = getApiBaseUrl();
    try {
      const { data } = await axios.get<{ recommendation: string }>(
        `${base}/ai-recommendation`,
        { params: { alert }, timeout: 45_000 }
      );
      setRecText(data.recommendation ?? "");
    } catch {
      setRecError(
        "Could not reach the assistant. Start the backend and set GROQ_API_KEY for this route."
      );
    } finally {
      setRecLoading(false);
    }
  }, [alertDraft]);

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8 max-w-2xl">
        <p className="uf-kicker-muted flex items-center gap-2">
          <CloudSun className="h-4 w-4 text-teal-400/90" aria-hidden />
          IBM Granite
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Urban conditions & forecasts
        </h1>
        <p className="mt-3 text-slate-400">
          This page calls your UrbanFlow backend:{" "}
          <strong className="font-medium text-slate-300">
            Granite-style LLM outlook
          </strong>{" "}
          (instruct model on Hugging Face or Groq),{" "}
          <strong className="font-medium text-slate-300">
            Granite Time Series (TTM)
          </strong>{" "}
          when <code className="text-teal-200/80">TSFM_INFERENCE_URL</code> is
          configured, plus the sustainability assistant for weather and incident-style
          alerts. Real meteorological grids are not bundled here — use these tools for
          planning narratives and demo time-series channels.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <CityPredictPanel defaultCity="Brampton" />

        <section
          className="uf-card p-4 sm:p-5"
          aria-labelledby="granite-alert-heading"
        >
          <div className="flex items-start gap-2">
            <Sparkles
              className="mt-0.5 h-4 w-4 shrink-0 text-teal-400/80"
              aria-hidden
            />
            <div>
              <p className="uf-kicker-muted">Assistant</p>
              <h2
                id="granite-alert-heading"
                className="mt-1 text-lg font-semibold text-white"
              >
                Weather & incident briefing
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Uses{" "}
                <code className="rounded bg-black/30 px-1 font-mono text-[11px] text-teal-200/90">
                  /ai-recommendation
                </code>{" "}
                (Groq Llama). Describe heat, storms, flooding, or service disruption —
                you get a short sustainability and mobility-focused reply.
              </p>
            </div>
          </div>

          <label className="mt-4 block text-sm font-medium text-slate-400">
            Alert or scenario
            <textarea
              value={alertDraft}
              onChange={(e) => setAlertDraft(e.target.value)}
              rows={3}
              className="mt-2 w-full resize-y rounded-lg border border-[var(--uf-border)] bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal-400/30 placeholder:text-slate-600 focus:border-teal-400/40 focus:ring-2"
              placeholder="e.g. Freezing rain expected overnight — transit delays likely."
            />
          </label>

          <button
            type="button"
            disabled={recLoading}
            onClick={() => void runRecommendation()}
            className="mt-3 rounded-lg bg-indigo-500/90 px-4 py-2 text-sm font-medium text-white shadow shadow-indigo-500/20 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {recLoading ? "Generating…" : "Get briefing"}
          </button>

          {recError ? (
            <p className="mt-3 text-sm text-amber-200/90" role="alert">
              {recError}
            </p>
          ) : null}
          {recText !== null && !recError ? (
            <p className="mt-3 rounded-lg border border-[var(--uf-border)] bg-black/30 p-3 text-sm leading-relaxed text-slate-200">
              {recText}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
