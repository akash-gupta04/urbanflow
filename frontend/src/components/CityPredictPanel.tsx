"use client";

import { useCallback, useState } from "react";
import axios from "axios";
import { getApiBaseUrl } from "@/lib/api";

type PredictCityResponse = {
  city: string;
  prediction: string | null;
  model_used?: string | null;
  inference_route?: string | null;
  note?: string | null;
};

type TsfmCityResponse = {
  city: string;
  tsfm_configured: boolean;
  history_preview: {
    timestamps: string[];
    mobility_index: number[];
  };
  forecast: unknown;
  forecast_values?: number[] | null;
  note?: string | null;
  error?: string | null;
};

export type CityForecastParsed = {
  future_traffic?: number;
  future_transit?: number;
  risk_level?: string;
  summary?: string;
};

function parseCityForecastJson(raw: string): CityForecastParsed | null {
  let s = raw.trim();
  const fenced = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/im.exec(s);
  if (fenced) s = fenced[1].trim();
  try {
    const o = JSON.parse(s) as unknown;
    if (!o || typeof o !== "object") return null;
    return o as CityForecastParsed;
  } catch {
    return null;
  }
}

function riskTone(level: string | undefined) {
  const u = (level || "").toLowerCase();
  if (u.includes("high"))
    return "border-rose-400/35 bg-rose-500/15 text-rose-100";
  if (u.includes("moderate"))
    return "border-amber-400/35 bg-amber-500/12 text-amber-100";
  return "border-emerald-400/30 bg-emerald-500/10 text-emerald-100";
}

type Props = {
  defaultCity?: string;
  /** Smaller heading when embedded on secondary pages */
  compactHeading?: boolean;
};

export default function CityPredictPanel({
  defaultCity = "Brampton",
  compactHeading = false,
}: Props) {
  const [city, setCity] = useState(defaultCity);
  const [draft, setDraft] = useState(defaultCity);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    model_used?: string | null;
    inference_route?: string | null;
    note?: string | null;
  } | null>(null);
  const [tsfm, setTsfm] = useState<TsfmCityResponse | null>(null);
  const [tsfmHttpError, setTsfmHttpError] = useState<string | null>(null);

  const run = useCallback(async (c: string) => {
    const trimmed = c.trim() || defaultCity;
    setLoading(true);
    setError(null);
    setRaw(null);
    setMeta(null);
    setTsfm(null);
    setTsfmHttpError(null);
    const base = getApiBaseUrl();

    const parseAxiosDetail = (data: unknown): string => {
      const rawDetail = (data as { detail?: unknown })?.detail;
      if (typeof rawDetail === "string") return rawDetail;
      if (Array.isArray(rawDetail)) {
        return rawDetail
          .map((x) =>
            typeof x === "object" && x && "msg" in x
              ? String((x as { msg: string }).msg)
              : String(x)
          )
          .join(" ");
      }
      return "";
    };

    const [llmOutcome, tsfmOutcome] = await Promise.allSettled([
      axios.get<PredictCityResponse>(`${base}/predict-city`, {
        params: { city: trimmed },
        timeout: 60_000,
      }),
      axios.get<TsfmCityResponse>(`${base}/predict-city-tsfm`, {
        params: { city: trimmed },
        timeout: 120_000,
      }),
    ]);

    if (llmOutcome.status === "fulfilled") {
      const { data } = llmOutcome.value;
      setCity(data.city);
      setDraft(data.city);
      setRaw(data.prediction ?? "");
      setMeta({
        model_used: data.model_used,
        inference_route: data.inference_route,
        note: data.note,
      });
    } else {
      const e = llmOutcome.reason;
      if (axios.isAxiosError(e)) {
        if (e.code === "ECONNABORTED") {
          setError(
            "The LLM request timed out. Try again, or increase the timeout if the model is slow."
          );
        } else if (!e.response) {
          setError(
            `Cannot reach the API at ${base}. Start the backend from the ` +
              `backend folder (for example: uvicorn main:app --reload --host 127.0.0.1) ` +
              `or set NEXT_PUBLIC_API_URL in frontend/.env.local to match where it runs.`
          );
        } else {
          const detail = parseAxiosDetail(e.response.data);
          const status = e.response.status;
          if (status === 401 || status === 403) {
            setError(
              detail ||
                "API rejected the request. Check HF_TOKEN on the backend."
            );
          } else if (status === 503 || status === 502 || status === 500) {
            setError(
              detail ||
                "The LLM prediction service returned an error. Check backend logs and HF_TOKEN."
            );
          } else {
            setError(
              detail ||
                `LLM request failed (${status}). Check the backend and browser console.`
            );
          }
        }
      } else {
        setError("Something went wrong with the LLM request.");
      }
    }

    if (tsfmOutcome.status === "fulfilled") {
      setTsfm(tsfmOutcome.value.data);
    } else {
      const e = tsfmOutcome.reason;
      if (axios.isAxiosError(e)) {
        if (!e.response) {
          setTsfmHttpError(
            `Cannot load Granite TTM data from ${base}. Is the backend running?`
          );
        } else {
          setTsfmHttpError(
            parseAxiosDetail(e.response.data) ||
              `TTM request failed (${e.response.status}).`
          );
        }
      } else {
        setTsfmHttpError("Something went wrong loading Granite TTM data.");
      }
    }

    setLoading(false);
  }, [defaultCity]);

  const parsed = raw ? parseCityForecastJson(raw) : null;

  return (
    <section
      className="uf-card p-4 sm:p-5"
      aria-labelledby="city-predict-heading"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="uf-kicker-muted">Short-horizon outlook</p>
          <h2
            id="city-predict-heading"
            className={
              compactHeading
                ? "mt-1 text-lg font-semibold text-white"
                : "mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl"
            }
          >
            Next 2 hours
          </h2>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            <span className="text-slate-400">LLM outlook:</span> Granite instruct on
            Hugging Face, then Groq (
            <code className="rounded bg-black/30 px-1 font-mono text-[11px] text-teal-200/90">
              GROQ_API_KEY
            </code>
            ). <span className="text-slate-400">TTM:</span> IBM Granite time-series
            forecast when{" "}
            <code className="rounded bg-black/30 px-1 font-mono text-[11px] text-teal-200/90">
              TSFM_INFERENCE_URL
            </code>{" "}
            is set on the backend.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="sr-only" htmlFor="city-predict-input">
          City name
        </label>
        <input
          id="city-predict-input"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void run(draft);
          }}
          placeholder="City"
          className="w-full rounded-lg border border-[var(--uf-border)] bg-black/40 px-3 py-2 text-sm text-white outline-none ring-teal-400/30 placeholder:text-slate-600 focus:border-teal-400/40 focus:ring-2 sm:max-w-xs"
        />
        <button
          type="button"
          disabled={loading}
          onClick={() => void run(draft)}
          className="rounded-lg bg-teal-500/90 px-4 py-2 text-sm font-medium text-slate-950 shadow shadow-teal-500/20 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Running…" : "Predict"}
        </button>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-amber-200/90" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div
          className="mt-4 h-32 animate-pulse rounded-xl border border-[var(--uf-border)] bg-black/25"
          aria-busy
        />
      ) : null}

      {!loading && raw !== null && !error ? (
        <div className="mt-4 space-y-4 border-t border-white/[0.06] pt-4">
          <p className="text-xs text-slate-500">
            City: <span className="font-medium text-slate-300">{city}</span>
          </p>

          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            LLM outlook
          </p>
          {parsed &&
          (parsed.future_traffic != null ||
            parsed.future_transit != null ||
            parsed.risk_level ||
            parsed.summary) ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {parsed.future_traffic != null ? (
                <div className="rounded-xl border border-[var(--uf-border)] bg-black/30 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Future traffic
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
                    {parsed.future_traffic}
                  </p>
                </div>
              ) : null}
              {parsed.future_transit != null ? (
                <div className="rounded-xl border border-[var(--uf-border)] bg-black/30 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Future transit
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
                    {parsed.future_transit}
                  </p>
                </div>
              ) : null}
              {parsed.risk_level ? (
                <div className="sm:col-span-2">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${riskTone(parsed.risk_level)}`}
                  >
                    Risk: {parsed.risk_level}
                  </span>
                </div>
              ) : null}
              {parsed.summary ? (
                <p className="text-sm leading-relaxed text-slate-300 sm:col-span-2">
                  {parsed.summary}
                </p>
              ) : null}
            </div>
          ) : (
            <pre className="max-h-48 overflow-auto rounded-lg border border-[var(--uf-border)] bg-black/40 p-3 font-mono text-xs leading-relaxed text-slate-400">
              {raw || "(empty response)"}
            </pre>
          )}
        </div>
      ) : null}

      {!loading && (tsfm !== null || tsfmHttpError) ? (
        <div
          className="mt-4 space-y-3 border-t border-white/[0.06] pt-4"
          aria-labelledby="city-tsfm-heading"
        >
          <p
            id="city-tsfm-heading"
            className="text-[11px] font-semibold uppercase tracking-wide text-slate-500"
          >
            Granite time series (TTM)
          </p>
          {tsfmHttpError ? (
            <p className="text-sm text-amber-200/90" role="alert">
              {tsfmHttpError}
            </p>
          ) : tsfm ? (
            <>
              {!tsfm.tsfm_configured && tsfm.note ? (
                <p className="text-sm text-slate-400">{tsfm.note}</p>
              ) : null}
              {tsfm.tsfm_configured && tsfm.error ? (
                <p className="text-sm text-amber-200/90" role="alert">
                  {tsfm.error}
                </p>
              ) : null}
              <div className="overflow-x-auto rounded-lg border border-[var(--uf-border)] bg-black/30">
                <table className="w-full min-w-[280px] text-left text-xs text-slate-300">
                  <caption className="sr-only">
                    Recent synthetic mobility index used as TTM context
                  </caption>
                  <thead>
                    <tr className="border-b border-white/[0.06] text-slate-500">
                      <th className="px-3 py-2 font-medium">Time (UTC)</th>
                      <th className="px-3 py-2 font-medium tabular-nums">
                        Mobility index
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const ts = tsfm.history_preview.timestamps;
                      const vs = tsfm.history_preview.mobility_index;
                      const k = Math.min(8, ts.length, vs.length);
                      const tailT = ts.slice(-k);
                      const tailV = vs.slice(-k);
                      return tailT.map((t, i) => (
                        <tr
                          key={`${t}-${i}`}
                          className="border-b border-white/[0.04] last:border-0"
                        >
                          <td className="px-3 py-1.5 font-mono text-[11px] text-slate-400">
                            {t}
                          </td>
                          <td className="px-3 py-1.5 tabular-nums text-white">
                            {tailV[i] !== undefined ? tailV[i] : "—"}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-600">
                Context rows: last 8 of {tsfm.history_preview.timestamps.length}{" "}
                hourly points (demo series derived from city name).
              </p>
              {tsfm.forecast_values && tsfm.forecast_values.length > 0 ? (
                <div className="rounded-xl border border-[var(--uf-border)] bg-black/30 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    TTM forecast (next steps)
                  </p>
                  <p className="mt-2 font-mono text-sm tabular-nums leading-relaxed text-teal-100/90">
                    {tsfm.forecast_values
                      .slice(0, 24)
                      .map((x) => x.toFixed(2))
                      .join(" · ")}
                  </p>
                </div>
              ) : tsfm.tsfm_configured && tsfm.forecast && !tsfm.error ? (
                <pre className="max-h-40 overflow-auto rounded-lg border border-[var(--uf-border)] bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-slate-400">
                  {JSON.stringify(tsfm.forecast, null, 2)}
                </pre>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
