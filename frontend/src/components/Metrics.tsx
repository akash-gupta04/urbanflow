"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";

type MetricsData = {
  co2_reduced: number;
  traffic_reduction: number;
  emergency_access: number;
  transit_efficiency: number;
};

type MetricsProps = {
  selectedCity: string;
};

export default function Metrics({
  selectedCity,
}: MetricsProps) {

  const [metrics,
    setMetrics] =
    useState<MetricsData | null>(
      null
    );

  const [loading,
    setLoading] =
    useState(false);

  useEffect(() => {

    const fetchMetrics =
      async () => {

      try {

        setLoading(true);

        const response =
          await axios.get(
            `http://localhost:8000/city-metrics?city=${selectedCity}`
          );

        setMetrics(
          response.data
        );

      } catch (error) {

        console.error(
          "Error fetching metrics:",
          error
        );
      }

      setLoading(false);
    };

    fetchMetrics();

  }, [selectedCity]);

  const metricCards = metrics
    ? [
        {
          title:
            "CO₂ Reduced",

          value:
            metrics.co2_reduced,

          suffix:
            "%",

          subtitle:
            `${selectedCity} sustainability`,
        },

        {
          title:
            "Traffic Reduction",

          value:
            metrics.traffic_reduction,

          suffix:
            "%",

          subtitle:
            "smart routing",
        },

        {
          title:
            "Emergency Access",

          value:
            metrics.emergency_access,

          suffix:
            "%",

          subtitle:
            "optimized response",
        },

        {
          title:
            "Transit Efficiency",

          value:
            metrics.transit_efficiency,

          suffix:
            "%",

          subtitle:
            "city mobility",
        },
      ]
    : [];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

      {metricCards.map(
        (
          metric,
          index
        ) => (
          <motion.div
            key={index}
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
              delay:
                index * 0.1,
            }}
            whileHover={{
              scale: 1.03,
            }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-[0_0_40px_rgba(59,130,246,0.08)] hover:border-zinc-700 transition-all duration-300"
          >
            <p className="text-zinc-400 text-sm">
              {metric.title}
            </p>

            <div className="flex items-center gap-2 mt-2">

              <h2 className="text-4xl font-bold">
                {loading
                  ? "..."
                  : metric.value}

                {metric.suffix}
              </h2>

              <span className="text-green-400 text-sm animate-pulse">
                LIVE
              </span>
            </div>

            <p className="text-zinc-500 text-sm mt-1">
              {metric.subtitle}
            </p>
          </motion.div>
        )
      )}
    </div>
  );
}