import type { ReactNode } from "react";

export function SiteMain({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--uf-bg)]">
      <div
        className="ambient-backdrop pointer-events-none absolute inset-0"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-25%,rgba(45,212,191,0.16),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_100%_0%,rgba(99,102,241,0.14),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_35%_at_0%_100%,rgba(45,212,191,0.08),transparent_50%)]" />
      </div>
      <div className="relative z-10 mx-auto max-w-[1320px] px-4 pb-20 pt-[7.25rem] sm:px-6 sm:pt-32 lg:px-10 lg:pt-[8.5rem]">
        {children}
      </div>
    </div>
  );
}
