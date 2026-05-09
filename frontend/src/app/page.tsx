"use client";

import dynamic from "next/dynamic";
import EmergencyPanel from "@/components/EmergencyPanel";
import Metrics from "@/components/Metrics";
import AssistantPanel from "@/components/AssistantPanel";
import Navbar from "@/components/Navbar";
const Map = dynamic(
  () => import("@/components/Map"),
  { ssr: false }
);

export default function Home() {
  return (
    
<main className="min-h-screen bg-black text-white p-6 relative overflow-hidden">
  <div className="absolute top-[-200px] left-[-100px] w-[400px] h-[400px] bg-blue-500/10 blur-[140px] rounded-full pointer-events-none" />

<div className="absolute bottom-[-200px] right-[-100px] w-[400px] h-[400px] bg-purple-500/10 blur-[140px] rounded-full pointer-events-none" />
      {/* Header */}
      <Navbar />
      <div className="mb-6">
        <div className="mb-6">
  <h1 className="text-5xl font-bold tracking-tight">
    UrbanFlow Dashboard
  </h1>

  <p className="text-zinc-400 mt-2 text-lg">
    AI-powered sustainable urban intelligence
  </p>
</div>

        {/* Live Status Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-zinc-300">
              System Active
            </span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full">
            <span className="text-sm text-zinc-400">
              📍 Brampton, ON
            </span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full">
            <span className="text-sm text-zinc-400">
              ⚡ Live Monitoring
            </span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <Metrics />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl overflow-hidden">
          <Map />
        </div>

      <div className="space-y-6">
        <EmergencyPanel />
        <AssistantPanel />
      </div>
      </div>
    </main>
  );
}