"use client";

import { motion } from "framer-motion";
import {
  CITY_METRIC_BLOCKS,
  type CityMetrics,
} from "@/lib/cityMetricDisplay";

function SkeletonCard() {
  return (
    <div className="h-[92px] animate-pulse rounded-lg border border-[var(--uf-border)] bg-black/15" />
  );
}

type MetricsProps = {
  data: CityMetrics | null;
  loading: boolean;
  /** True when numbers are demo fallbacks (API error). */
  demoMode?: boolean;
  /** Shown under the demo banner for debugging / recovery. */
  apiErrorMessage?: string | null;
};

export default function Metrics({
  data,
  loading,
  demoMode = false,
  apiErrorMessage = null,
}: MetricsProps) {
  return (
    <section aria-labelledby="metrics-heading">
      <div className="mb-3 sm:mb-4">
        <p className="uf-kicker-muted text-[0.58rem]">Metrics</p>
        <h1
          id="metrics-heading"
          className="mt-1.5 text-base font-medium tracking-tight text-white sm:text-[1.05rem]"
        >
          How things are going
        </h1>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
          Four corridor signals — current % per card.
        </p>
      </div>

      {demoMode && data ? (
        <div className="mb-3 rounded-lg border border-amber-500/15 bg-amber-500/[0.06] px-3 py-2.5 text-xs text-amber-100/90">
          <p className="font-medium text-amber-50/90">Sample metrics</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-amber-100/70">
            API unreachable — demo percentages for layout. Start the backend
            and refresh.
          </p>
          {apiErrorMessage ? (
            <p className="mt-1.5 font-mono text-[10px] text-amber-200/55">
              {apiErrorMessage}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
        {loading && !data ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : data ? (
          CITY_METRIC_BLOCKS.map((item, index) => {
            const Icon = item.Icon;
            const value = Math.min(100, Math.max(0, data[item.key]));
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.18, delay: index * 0.02 }}
                className="relative flex flex-col overflow-hidden rounded-lg border border-[var(--uf-border)] bg-black/20 px-3 py-2.5 transition hover:border-white/[0.08] hover:bg-black/[0.28]"
              >
                <div
                  className={`pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r ${item.bar} opacity-60`}
                />
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-medium tracking-wide text-slate-500">
                    Now
                  </span>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-slate-400 ring-1 ring-white/[0.06]">
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                  </div>
                </div>
                <p className="mt-1.5 text-xs font-medium leading-snug text-slate-400">
                  {item.title}
                </p>
                <p className="mt-1.5 flex items-baseline gap-0.5">
                  <span className="text-lg font-medium tabular-nums tracking-tight text-slate-100 sm:text-xl">
                    {value}
                  </span>
                  <span className="text-[11px] font-medium text-slate-600">
                    %
                  </span>
                </p>
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-800/80">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${item.bar} opacity-70`}
                    style={{ width: `${value}%` }}
                  />
                </div>
                <p className="mt-1.5 line-clamp-2 text-[10px] leading-snug text-slate-600">
                  {item.subtitle}
                </p>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-2 rounded-lg border border-[var(--uf-border)] bg-black/15 px-3 py-6 text-center text-xs text-slate-500">
            No metric data yet.
          </div>
        )}
      </div>
    </section>
  );
}
