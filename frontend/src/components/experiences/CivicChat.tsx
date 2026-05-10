"use client";

import { useState } from "react";
import axios from "axios";
import { Send, Sparkles } from "lucide-react";
import { getApiBaseUrl } from "@/lib/api";

type Msg = { role: "user" | "assistant"; text: string };

export default function CivicChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Ask about transit, safety, heat, or flooding — short answers from your assistant API.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);
    const base = getApiBaseUrl();
    try {
      const { data } = await axios.get<{ recommendation: string }>(
        `${base}/ai-recommendation`,
        { params: { alert: text } }
      );
      setMessages((m) => [
        ...m,
        { role: "assistant", text: data.recommendation },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "Could not reach the assistant. Is the API running?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col">
      <header className="mb-6">
        <p className="uf-kicker-muted">Assistant</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Civic chat
        </h1>
        <p className="mt-3 text-slate-400">
          Each reply is generated from your backend route — same contract as the
          dashboard panel.
        </p>
      </header>

      <div className="uf-card flex min-h-[340px] flex-col overflow-hidden p-0">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {messages.map((msg, i) => (
            <div
              key={`${i}-${msg.text.slice(0, 16)}`}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-teal-500/20 text-teal-50 ring-1 ring-teal-400/25"
                    : "bg-black/35 text-slate-200 ring-1 ring-[var(--uf-border)]"
                }`}
              >
                {msg.role === "assistant" ? (
                  <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    <Sparkles className="h-3 w-3 text-teal-400/80" />
                    Assistant
                  </span>
                ) : null}
                {msg.text}
              </div>
            </div>
          ))}
          {loading ? (
            <p className="text-center text-xs text-slate-500">Thinking…</p>
          ) : null}
        </div>

        <div className="border-t border-[var(--uf-border)] p-3 sm:p-4">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder="Type a question…"
              className="uf-input min-h-[48px] flex-1"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={loading || !input.trim()}
              className="uf-btn-primary min-h-[48px] min-w-[52px] shrink-0 px-0 disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
