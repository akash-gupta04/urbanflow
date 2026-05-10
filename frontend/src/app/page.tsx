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

  const [
    selectedAlert,
    setSelectedAlert,
  ] = useState("");

  const [
    selectedCity,
    setSelectedCity,
  ] = useState("Brampton");

  return (
    <main className="min-h-screen bg-black text-white p-6 relative overflow-x-hidden">

      {/* Background Glow */}
      <div className="absolute top-[-200px] left-[-100px] w-[400px] h-[400px] bg-blue-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="absolute bottom-[-200px] right-[-100px] w-[400px] h-[400px] bg-purple-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Sticky Navbar */}
      <div className="sticky top-4 z-[1000] mb-8">
        <Navbar />
      </div>

      {/* Dashboard */}
      <section id="dashboard">

        {/* Title */}
        <div className="mb-6 relative z-10">

          <h1 className="text-6xl font-bold tracking-tight leading-tight">
            UrbanFlow Dashboard
          </h1>

          <p className="text-zinc-400 mt-3 text-xl max-w-2xl">
            AI-powered sustainable urban intelligence
          </p>

          {/* Status Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-3">

            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />

              <span className="text-sm text-zinc-300">
                System Active
              </span>
            </div>

            {/* City Selector */}
            <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full flex items-center gap-3">

              <span className="text-zinc-400">
                🌍
              </span>

              <select
                value={selectedCity}
                onChange={(e) =>
                  setSelectedCity(
                    e.target.value
                  )
                }
                className="bg-transparent text-zinc-300 outline-none"
              >
                <option value="Brampton">
                  Brampton
                </option>

                <option value="Toronto">
                  Toronto
                </option>

                <option value="Mississauga">
                  Mississauga
                </option>

                <option value="Vancouver">
                  Vancouver
                </option>
              </select>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full">
              <span className="text-sm text-zinc-400">
                ⚡ Live Monitoring
              </span>
            </div>

          </div>
        </div>

        {/* Metrics */}
        <div className="mt-8">
          <Metrics
            selectedCity={
              selectedCity
            }
          />
        </div>

      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 relative z-10 items-start">

        {/* Map */}
        <section
          id="map"
          className="lg:col-span-8 rounded-3xl overflow-hidden"
        >
          <Map
          selectedAlert={
            selectedAlert
          }
          selectedCity={
            selectedCity
          }
        />
        </section>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6 sticky top-32">

          <section id="alerts">
            <EmergencyPanel
              setSelectedAlert={
                setSelectedAlert
              }
            />
          </section>

          <section id="ai">
            <SmartRecommendations
            selectedAlert={
              selectedAlert
            }
            selectedCity={
              selectedCity
            }
          />
          </section>

          <RouteOptimizer
            selectedAlert={
              selectedAlert
            }
          />

          <AssistantPanel />
        </div>
      </div>
    </main>
  );
}