"use client";

import {
  setPreferenceFlag,
  useDocumentPrefs,
  type PreferenceKey,
} from "@/components/PreferencesRoot";

export default function AccessibilityControls() {
  const { lowBandwidth, simpleUi, highContrast } = useDocumentPrefs();

  const toggle = (key: PreferenceKey, value: boolean) => {
    setPreferenceFlag(key, value);
  };

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <header>
        <p className="uf-kicker-muted">Accessibility</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Display &amp; motion
        </h1>
        <p className="mt-3 text-slate-400">
          Preferences apply across the app and persist on this device.
        </p>
      </header>

      <ul className="uf-card divide-y divide-[var(--uf-border)] overflow-hidden p-0">
        <li className="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="font-medium text-white">Low bandwidth</p>
            <p className="text-sm text-slate-500">
              Hides heavy background blur to save GPU and data.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={lowBandwidth}
            onClick={() => toggle("lowBandwidth", !lowBandwidth)}
            className={`relative h-7 w-12 rounded-full transition ${
              lowBandwidth ? "bg-teal-500/80" : "bg-slate-700"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                lowBandwidth ? "translate-x-5" : ""
              }`}
            />
          </button>
        </li>
        <li className="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="font-medium text-white">Simple layout</p>
            <p className="text-sm text-slate-500">
              Slightly larger type and clearer panel borders.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={simpleUi}
            onClick={() => toggle("simpleUi", !simpleUi)}
            className={`relative h-7 w-12 rounded-full transition ${
              simpleUi ? "bg-teal-500/80" : "bg-slate-700"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                simpleUi ? "translate-x-5" : ""
              }`}
            />
          </button>
        </li>
        <li className="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="font-medium text-white">Higher contrast</p>
            <p className="text-sm text-slate-500">
              Pushes foreground and panel edges brighter.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={highContrast}
            onClick={() => toggle("highContrast", !highContrast)}
            className={`relative h-7 w-12 rounded-full transition ${
              highContrast ? "bg-teal-500/80" : "bg-slate-700"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                highContrast ? "translate-x-5" : ""
              }`}
            />
          </button>
        </li>
      </ul>

      <p className="text-center text-xs text-slate-600">
        Keyboard: Tab into the skip link at the top of every page.
      </p>
    </div>
  );
}
