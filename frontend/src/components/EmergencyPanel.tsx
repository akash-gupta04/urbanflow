"use client";

import { useEffect, useState } from "react";

const alertSets = [
  [
    {
      title: "Flood Warning",
      severity: "High",
      location: "Downtown Sector",
    },
    {
      title: "Heavy Traffic",
      severity: "Medium",
      location: "Main Transit Corridor",
    },
    {
      title: "Heatwave Alert",
      severity: "Low",
      location: "City Wide",
    },
  ],

  [
    {
      title: "Transit Delay",
      severity: "Medium",
      location: "North Terminal",
    },
    {
      title: "Storm Advisory",
      severity: "High",
      location: "West District",
    },
    {
      title: "Road Maintenance",
      severity: "Low",
      location: "Downtown Core",
    },
  ],
];

export default function EmergencyPanel() {
  const [alerts, setAlerts] = useState(alertSets[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts((prev) =>
        prev === alertSets[0]
          ? alertSets[1]
          : alertSets[0]
      );
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "High":
        return "bg-red-500/20 text-red-400 border border-red-500/20";

      case "Medium":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/20";

      case "Low":
        return "bg-green-500/20 text-green-400 border border-green-500/20";

      default:
        return "bg-zinc-700 text-zinc-300";
    }
  };

  return (
    <div className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800 shadow-[0_0_30px_rgba(59,130,246,0.06)]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          Emergency Alerts 🚨
        </h2>

        <span className="text-green-400 text-sm animate-pulse">
          LIVE
        </span>
      </div>

      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className="bg-zinc-800 rounded-2xl p-4 border border-zinc-700 hover:border-zinc-600 transition-all"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">
                {alert.title}
              </h3>

              <span
                className={`text-sm px-3 py-1 rounded-full ${getSeverityStyles(
                  alert.severity
                )}`}
              >
                {alert.severity}
              </span>
            </div>

            <p className="text-zinc-400 mt-2">
              {alert.location}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}