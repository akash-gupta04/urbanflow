"use client";

import { motion } from "framer-motion";

export default function Metrics() {
  const metrics = [
    {
      title: "CO₂ Reduced",
      value: "18%",
      subtitle: "vs last week",
    },
    {
      title: "Traffic Reduction",
      value: "24%",
      subtitle: "smart routing",
    },
    {
      title: "Emergency Access",
      value: "92%",
      subtitle: "optimized response",
    },
    {
      title: "Transit Efficiency",
      value: "87%",
      subtitle: "city average",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: index * 0.1,
          }}
          whileHover={{
            scale: 1.03,
          }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-[0_0_40px_rgba(59,130,246,0.08)] hover:border-zinc-700 transition-all"
        >
          <p className="text-zinc-400 text-sm">
            {metric.title}
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {metric.value}
          </h2>

          <p className="text-zinc-500 text-sm mt-1">
            {metric.subtitle}
          </p>
        </motion.div>
      ))}
    </div>
  );
}