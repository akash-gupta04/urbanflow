"use client";

import axios from "axios";
import { useEffect, useState } from "react";

export default function SmartRecommendations({
  selectedAlert,
}: {
  selectedAlert: string;
}) {
  const [recommendation,
    setRecommendation] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  const [cache,
    setCache] =
    useState<Record<string, string>>(
      {}
    );

  useEffect(() => {
    if (!selectedAlert) return;

    // Use cached response
    if (cache[selectedAlert]) {
      setRecommendation(
        cache[selectedAlert]
      );
      return;
    }

    const fetchAI =
      async () => {

      setLoading(true);

      try {
        const response =
          await axios.get(
            `http://localhost:8000/ai-recommendation?alert=${encodeURIComponent(
              selectedAlert
            )}`
          );

        const aiText =
          response.data
            .recommendation;

        setRecommendation(
          aiText
        );

        // Save to cache
        setCache((prev) => ({
          ...prev,
          [selectedAlert]:
            aiText,
        }));

      } catch (error) {

        const fallback =
          "UrbanFlow recommends sustainable routing and safe mobility actions based on current urban conditions.";

        setRecommendation(
          fallback
        );

        console.error(
          "AI error:",
          error
        );
      }

      setLoading(false);
    };

    fetchAI();

  }, [selectedAlert]);

  if (!selectedAlert)
    return null;

  return (
    <div className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800 shadow-[0_0_30px_rgba(59,130,246,0.06)]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">
            AI Recommendation 🧠
          </h2>

          <p className="text-zinc-500 text-sm">
            Context-aware civic intelligence
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs px-3 py-1 rounded-full">
            Powered by Llama
          </span>

          <span className="text-green-400 text-sm animate-pulse">
            LIVE
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="bg-zinc-800 rounded-2xl p-4 border border-zinc-700 min-h-[120px] flex items-center">
        
        {loading ? (
          <div className="animate-pulse space-y-3 w-full">
            <div className="h-4 bg-zinc-700 rounded w-3/4" />
            <div className="h-4 bg-zinc-700 rounded w-1/2" />
            <div className="h-4 bg-zinc-700 rounded w-2/3" />
          </div>
        ) : (
          <p className="text-zinc-300 leading-relaxed">
            {recommendation}
          </p>
        )}
      </div>
    </div>
  );
}