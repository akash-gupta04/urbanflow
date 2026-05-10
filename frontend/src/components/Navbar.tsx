"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Radio } from "lucide-react";
import { getApiBaseUrl } from "@/lib/api";

const mainNav = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transit", label: "Transit" },
  { href: "/emergency", label: "Emergency" },
  { href: "/civic-assistant", label: "Assistant" },
] as const;

const dashboardAnchors = [
  { href: "/dashboard#metrics", label: "Metrics" },
  { href: "/dashboard#map", label: "Map" },
  { href: "/dashboard#alerts", label: "Alerts" },
] as const;

function linkClass(active: boolean) {
  return [
    "shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-medium transition",
    active
      ? "bg-teal-400/15 text-teal-100 ring-1 ring-teal-400/25"
      : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100",
  ].join(" ");
}

export default function Navbar() {
  const pathname = usePathname();
  const [apiOk, setApiOk] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    const base = getApiBaseUrl();
    fetch(`${base}/`)
      .then((r) => {
        if (!cancelled) setApiOk(r.ok);
      })
      .catch(() => {
        if (!cancelled) setApiOk(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onDashboard = pathname === "/dashboard";

  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4"
      role="banner"
    >
      <div className="pointer-events-auto mx-auto max-w-[1320px]">
        <div className="uf-card flex flex-col gap-0 overflow-hidden px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-center gap-3 lg:gap-4">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2.5 rounded-xl py-1 outline-none ring-teal-400/30 focus-visible:ring-2"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-indigo-500 text-slate-950 shadow-lg shadow-teal-500/20">
                <Layers className="h-5 w-5" aria-hidden />
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="uf-kicker block text-[0.58rem] text-teal-300/90">
                  UrbanFlow
                </span>
                <span className="text-sm font-semibold tracking-tight text-slate-50">
                  City OS
                </span>
              </span>
            </Link>

            <nav
              className="-mx-1 flex min-w-0 flex-1 gap-0.5 overflow-x-auto px-1 py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Primary"
            >
              {mainNav.map(({ href, label }) => {
                const active =
                  href === "/"
                    ? pathname === "/"
                    : pathname === href ||
                      pathname.startsWith(`${href}/`);
                return (
                  <Link key={href} href={href} className={linkClass(active)}>
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div
              className="flex shrink-0 items-center gap-2 rounded-full border border-[var(--uf-border)] bg-black/35 px-2.5 py-1.5 sm:px-3"
              title={getApiBaseUrl()}
            >
              <Radio
                className={`h-3.5 w-3.5 ${
                  apiOk === true
                    ? "text-emerald-400"
                    : apiOk === false
                      ? "text-amber-400"
                      : "text-slate-600"
                }`}
                aria-hidden
              />
              <span
                className={`hidden text-[11px] font-medium sm:inline ${
                  apiOk === true
                    ? "text-emerald-300"
                    : apiOk === false
                      ? "text-amber-300"
                      : "text-slate-500"
                }`}
              >
                {apiOk === null ? "…" : apiOk ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          {onDashboard ? (
            <nav
              className="mt-2 flex flex-wrap items-center gap-1 border-t border-[var(--uf-border)] pt-2 text-[12px]"
              aria-label="Dashboard sections"
            >
              <span className="mr-1 text-slate-600">Jump</span>
              {dashboardAnchors.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="rounded-md px-2 py-1 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-200"
                >
                  {label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </header>
  );
}
