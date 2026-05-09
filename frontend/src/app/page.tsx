"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import Navbar from "@/components/Navbar";
import Metrics from "@/components/Metrics";
import EmergencyPanel from "@/components/EmergencyPanel";
import AssistantPanel from "@/components/AssistantPanel";
import SmartRecommendations from "@/components/SmartRecommendations";
import RouteOptimizer from "@/components/RouteOptimizer";


const Map = dynamic(
  () => import("@/components/Map"),
  { ssr: false }
);

export default function Home() {
  const [selectedAlert, setSelectedAlert] =
    useState("");

  return (
    <main className="min-h-screen bg-black text-white p-6 relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-[-200px] left-[-100px] w-[400px] h-[400px] bg-blue-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="absolute bottom-[-200px] right-[-100px] w-[400px] h-[400px] bg-purple-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <Navbar />

      {/* Page Title */}
      <div className="mb-6 relative z-10">
        <h1 className="text-5xl font-bold tracking-tight">
          UrbanFlow Dashboard
        </h1>

        <p className="text-zinc-400 mt-2 text-lg">
          AI-powered sustainable urban intelligence
        </p>

        {/* Live Status */}
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

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">

        {/* Map */}
        <div className="lg:col-span-2 rounded-3xl overflow-hidden">
          <Map selectedAlert={selectedAlert} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <EmergencyPanel
            setSelectedAlert={setSelectedAlert}
          />
          <SmartRecommendations
            selectedAlert={selectedAlert}
          />
          <RouteOptimizer
            selectedAlert={selectedAlert}
          />

          <AssistantPanel />
        </div>
      </div>
    </main>
  );
}