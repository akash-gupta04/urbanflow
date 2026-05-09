"use client";

import { useState } from "react";

export default function AssistantPanel() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState(
    "Ask about traffic, sustainability, emergencies, or city services."
  );

  const handleAsk = () => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("traffic")) {
      setResponse(
        "Heavy congestion detected. UrbanFlow recommends public transit or alternative routes."
      );
    } else if (lowerMessage.includes("flood")) {
      setResponse(
        "Flood warning active. Avoid low-lying roads and proceed to nearby shelters."
      );
    } else if (lowerMessage.includes("carbon")) {
      setResponse(
        "Using public transit can significantly reduce your carbon footprint."
      );
    } else if (lowerMessage.includes("emergency")) {
      setResponse(
        "Emergency facilities nearby identified. Follow highlighted safe routes."
      );
    } else {
      setResponse(
        "UrbanFlow recommends sustainable and safe urban mobility solutions."
      );
    }
  };

  return (
    <div className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800 shadow-[0_0_30px_rgba(59,130,246,0.06)]">
      <h2 className="text-2xl font-bold mb-3">
        UrbanFlow Assistant 🤖
      </h2>

      <p className="text-zinc-400 text-sm mb-4">
        Smart city guidance powered by intelligent infrastructure.
      </p>

      <div className="bg-zinc-800 rounded-2xl p-4 min-h-[120px] border border-zinc-700 mb-4">
        <p className="text-zinc-300">
          {response}
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Ask about traffic or emergencies..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
        />

        <button
          onClick={handleAsk}
          className="bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-xl transition-all duration-300 font-medium"
        >
          Ask
        </button>
      </div>
    </div>
  );
}