"use client";

export default function RouteOptimizer({
  selectedAlert,
}: {
  selectedAlert: string;
}) {
  const routeData: Record<
    string,
    {
      title: string;
      message: string;
      timeSaved: string;
      co2: string;
      color: string;
    }
  > = {
    "Heavy Traffic": {
      title: "Optimized Transit Route",
      message:
        "Alternative Route 501 recommended to bypass congestion hotspots.",
      timeSaved: "8 min",
      co2: "-18%",
      color: "border-yellow-500/20",
    },

    "Flood Warning": {
      title: "Emergency Safe Route",
      message:
        "Downtown roads avoided. Safe shelter path generated.",
      timeSaved: "12 min",
      co2: "-10%",
      color: "border-red-500/20",
    },

    "Heatwave Alert": {
      title: "Climate-Friendly Route",
      message:
        "Shaded transit corridors recommended to reduce heat exposure.",
      timeSaved: "5 min",
      co2: "-8%",
      color: "border-orange-500/20",
    },

    "Transit Delay": {
      title: "Transit Alternative",
      message:
        "Nearest GO Station recommended for lower wait times.",
      timeSaved: "10 min",
      co2: "-15%",
      color: "border-blue-500/20",
    },

    "Storm Advisory": {
      title: "Weather Safe Route",
      message:
        "Safer roads identified with lower flood exposure.",
      timeSaved: "7 min",
      co2: "-11%",
      color: "border-purple-500/20",
    },
  };

  const route =
    routeData[selectedAlert];

  return (
    <div className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800 shadow-[0_0_30px_rgba(59,130,246,0.06)]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold">
          Smart Route Optimizer 🛣️
        </h2>

        <span className="text-green-400 text-sm animate-pulse">
          LIVE
        </span>
      </div>

      {!route ? (
        <div className="bg-zinc-800 rounded-2xl p-4 border border-zinc-700">
          <p className="text-zinc-400">
            Select an emergency alert to
            generate optimized city routes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            className={`bg-zinc-800 rounded-2xl p-4 border ${route.color}`}
          >
            <h3 className="font-semibold text-lg">
              {route.title}
            </h3>

            <p className="text-zinc-400 mt-2">
              {route.message}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800 rounded-2xl p-4">
              <p className="text-zinc-500 text-sm">
                Time Saved
              </p>

              <h2 className="text-2xl font-bold">
                {route.timeSaved}
              </h2>
            </div>

            <div className="bg-zinc-800 rounded-2xl p-4">
              <p className="text-zinc-500 text-sm">
                CO₂ Reduced
              </p>

              <h2 className="text-2xl font-bold text-green-400">
                {route.co2}
              </h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}