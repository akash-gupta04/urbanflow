"use client";

import { useEffect, useSyncExternalStore } from "react";

export const PREFERENCE_KEYS = {
  lowBandwidth: "uf_low_bandwidth",
  simpleUi: "uf_simple_ui",
  highContrast: "uf_high_contrast",
} as const;

export type PreferenceKey = keyof typeof PREFERENCE_KEYS;

function readFlag(key: string) {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(key) === "1";
}

function applyDocumentPrefs() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.lowBandwidth = readFlag(PREFERENCE_KEYS.lowBandwidth)
    ? "true"
    : "false";
  root.dataset.simpleUi = readFlag(PREFERENCE_KEYS.simpleUi)
    ? "true"
    : "false";
  root.dataset.highContrast = readFlag(PREFERENCE_KEYS.highContrast)
    ? "true"
    : "false";
}

export function syncPreferencesFromStorage() {
  applyDocumentPrefs();
}

export default function PreferencesRoot() {
  useEffect(() => {
    applyDocumentPrefs();
    const onChange = () => applyDocumentPrefs();
    window.addEventListener("storage", onChange);
    window.addEventListener("uf-prefs", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("uf-prefs", onChange);
    };
  }, []);

  return null;
}

export function setPreferenceFlag(key: PreferenceKey, on: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFERENCE_KEYS[key], on ? "1" : "0");
  applyDocumentPrefs();
  window.dispatchEvent(new Event("uf-prefs"));
}

export function getPreferenceFlag(key: PreferenceKey) {
  return readFlag(PREFERENCE_KEYS[key]);
}

function subscribePrefs(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("uf-prefs", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("uf-prefs", callback);
    window.removeEventListener("storage", callback);
  };
}

function prefsSnapshot() {
  return [
    getPreferenceFlag("lowBandwidth"),
    getPreferenceFlag("simpleUi"),
    getPreferenceFlag("highContrast"),
  ]
    .map((v) => (v ? "1" : "0"))
    .join("");
}

function prefsServerSnapshot() {
  return "000";
}

/** Live preference flags (hydration-safe). */
export function useDocumentPrefs() {
  const snap = useSyncExternalStore(
    subscribePrefs,
    prefsSnapshot,
    prefsServerSnapshot
  );
  return {
    lowBandwidth: snap[0] === "1",
    simpleUi: snap[1] === "1",
    highContrast: snap[2] === "1",
  };
}
