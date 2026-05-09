"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type Alert = {
  id: number;
  title: string;
  severity: string;
  location: string;
};

export default function EmergencyPanel({
  setSelectedAlert,
}: {
  setSelectedAlert: (alert: string) => void;
}) {
  const [alerts, setAlerts] = useState<
    Alert[]
  >([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response =
          await axios.get(
            "http://127.0.0.1:8000/alerts"
          );

        setAlerts(response.data);
      } catch (error) {
        console.error(
          "Error fetching alerts:",
          error
        );
      }
    };

    fetchAlerts();
  }, []);

  const getSeverityStyles = (
    severity: string
  ) => {
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
        {alerts.map((alert) => (
          <div
            key={alert.id}
            onClick={() =>
              setSelectedAlert(alert.title)
            }
            className="bg-zinc-800 rounded-2xl p-4 border border-zinc-700 hover:border-zinc-600 transition-all cursor-pointer hover:scale-[1.02]"
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