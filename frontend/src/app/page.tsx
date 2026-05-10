import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Bus,
  Map,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { SiteMain } from "@/components/SiteMain";

const highlights = [
  {
    icon: Map,
    title: "Live operations canvas",
    desc: "Map, metrics, alerts, and chat together so teams can see the corridor at a glance.",
  },
  {
    icon: Bus,
    title: "Transit & timing ideas",
    desc: "Plan from A to B with suggested routes, connections, and when to pad for traffic.",
  },
  {
    icon: MessageCircle,
    title: "Resident-friendly answers",
    desc: "The civic assistant turns questions into clear responses backed by your city API.",
  },
  {
    icon: Sparkles,
    title: "AI as a co-pilot",
    desc: "Smart nudges and trip guidance sit next to real data — always verify against official sources.",
  },
] as const;

export const metadata: Metadata = {
  title: "Home",
  description: "UrbanFlow — city operations in one place.",
};

export default function HomePage() {
  return (
    <SiteMain>
      <section className="relative mb-10 overflow-hidden rounded-2xl border border-teal-400/15 bg-gradient-to-br from-teal-950/35 via-[rgba(8,9,13,0.92)] to-indigo-950/30 px-5 py-10 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.75)] sm:px-8 sm:py-12 lg:mb-14 lg:px-10 lg:py-14">
        <div
          className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-teal-400/12 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl"
          aria-hidden
        />
        <div className="relative grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
          <div className="lg:col-span-6 xl:col-span-5">
            <p className="uf-kicker">What is UrbanFlow?</p>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
              One place for how your city moves, responds, and talks to residents.
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-slate-400 sm:text-[1.05rem]">
              UrbanFlow is a demo-ready hub for corridor operations: staff get a shared
              picture of what is happening on the network, and residents get simpler paths
              to trips, safety signals, and questions answered — without juggling a dozen
              tools.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-6 xl:col-span-7 lg:grid-cols-2 lg:gap-4">
            {highlights.map(({ icon: Icon, title, desc }) => (
              <li
                key={title}
                className="flex gap-3 rounded-xl border border-white/[0.06] bg-black/25 p-4 backdrop-blur-sm transition hover:border-teal-400/20 hover:bg-black/35"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-teal-400/20 bg-teal-500/10 text-teal-200">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-100">{title}</p>
                  <p className="mt-1 text-sm leading-snug text-slate-500">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <section className="uf-card p-6 sm:p-8 lg:col-span-7">
          <p className="uf-kicker-muted">Today</p>
          <h2 className="mt-3 max-w-xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            Operations for the corridor — tools first, dashboard when you need
            the full canvas.
          </h2>
          <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-slate-400">
            Each page is a focused surface. The dashboard brings map, metrics,
            alerts, and chat together for demos and daily checks.
          </p>
          <div className="mt-8">
            <Link
              href="/dashboard"
              className="uf-btn-primary no-underline inline-flex w-full justify-center gap-2 py-3.5 text-base font-semibold"
            >
              <Map className="h-5 w-5 shrink-0" aria-hidden />
              Open dashboard
            </Link>
          </div>
        </section>

        <aside className="flex h-full min-h-0 flex-col gap-4 lg:col-span-5">
          <Link
            href="/transit"
            className="uf-card group relative overflow-hidden p-5 transition hover:border-teal-400/30 sm:p-6 no-underline"
          >
            <div
              className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-teal-400/10 blur-2xl transition group-hover:bg-teal-400/14"
              aria-hidden
            />
            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="uf-kicker-muted">Transit</p>
                <h2 className="mt-2 text-lg font-semibold tracking-tight text-white sm:text-xl">
                  Plan your trip
                </h2>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-slate-500">
                  Door-to-door ideas: buses, connections, and when to pad your
                  schedule for traffic.
                </p>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-teal-400/25 bg-teal-500/10 text-teal-200 transition group-hover:border-teal-400/40 group-hover:bg-teal-500/15">
                <Bus className="h-5 w-5" aria-hidden />
              </div>
            </div>
            <span className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-teal-300/95">
              Open trip planner
              <ArrowRight
                className="h-4 w-4 transition group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </Link>
          <div className="uf-card flex min-h-0 flex-1 flex-col justify-center p-5 sm:p-6">
            <Sparkles className="h-8 w-8 text-indigo-400/90" aria-hidden />
            <p className="mt-3 text-sm font-medium text-slate-300">
              AI + maps + metrics share one API base — configure with{" "}
              <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs text-teal-200/90">
                NEXT_PUBLIC_API_URL
              </code>
              .
            </p>
          </div>
        </aside>
      </div>
    </SiteMain>
  );
}
