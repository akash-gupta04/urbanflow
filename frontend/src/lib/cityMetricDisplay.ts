import type { LucideIcon } from "lucide-react";
import { Gauge, Leaf, Shield, TrainFront } from "lucide-react";

export type CityMetricKey =
  | "co2_reduced"
  | "traffic_reduction"
  | "emergency_access"
  | "transit_efficiency";

export type CityMetrics = Record<CityMetricKey, number>;

/** Shown on the dashboard when `/metrics` is unreachable so the UI still has numbers. */
export const DEMO_CITY_METRICS: CityMetrics = {
  co2_reduced: 64,
  traffic_reduction: 52,
  emergency_access: 78,
  transit_efficiency: 61,
};

export const CITY_METRIC_BLOCKS: {
  key: CityMetricKey;
  title: string;
  subtitle: string;
  bar: string;
  Icon: LucideIcon;
}[] = [
  {
    key: "co2_reduced",
    title: "Cleaner trips",
    subtitle: "Emissions trending down across the network",
    Icon: Leaf,
    bar: "from-emerald-400 to-teal-500",
  },
  {
    key: "traffic_reduction",
    title: "Easier roads",
    subtitle: "How uncongested major corridors feel right now",
    Icon: Gauge,
    bar: "from-sky-400 to-indigo-500",
  },
  {
    key: "emergency_access",
    title: "Help on the way",
    subtitle: "Reachability for critical services from where you are",
    Icon: Shield,
    bar: "from-amber-400 to-orange-500",
  },
  {
    key: "transit_efficiency",
    title: "Transit feeling",
    subtitle: "How smoothly buses and trains are moving today",
    Icon: TrainFront,
    bar: "from-violet-400 to-fuchsia-500",
  },
];

function tier(n: number): "low" | "mid" | "high" {
  if (n < 42) return "low";
  if (n < 72) return "mid";
  return "high";
}

function alertTone(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("heat")) return "heat";
  if (t.includes("flood") || t.includes("storm") || t.includes("rain"))
    return "wet";
  if (t.includes("traffic") || t.includes("delay")) return "traffic";
  if (t.includes("transit")) return "transit";
  return "general";
}

/**
 * One wear/carry line per metric, grounded in live % + alert + location label.
 */
export function situationTipsForLocation(
  locationLabel: string,
  alertTitle: string,
  metrics: CityMetrics
): { key: CityMetricKey; currentPct: number; carry: string }[] {
  const place = locationLabel.trim() || "this area";
  const tone = alertTone(alertTitle);
  const co2 = tier(metrics.co2_reduced);
  const road = tier(metrics.traffic_reduction);
  const emerg = tier(metrics.emergency_access);
  const transit = tier(metrics.transit_efficiency);

  const out: { key: CityMetricKey; currentPct: number; carry: string }[] = [];

  // Cleaner trips / air & mode nudge
  if (co2 === "high") {
    out.push({
      key: "co2_reduced",
      currentPct: metrics.co2_reduced,
      carry: `Around ${place}: trips are relatively clean today — light layers and a reusable bottle are enough; consider transit or walking for short hops.`,
    });
  } else if (co2 === "low") {
    out.push({
      key: "co2_reduced",
      currentPct: metrics.co2_reduced,
      carry: `Around ${place}: air quality pressure is higher — a well‑fitted mask on busy sidewalks, breathable clothes, and sticking to lower‑exposure routes helps.`,
    });
  } else {
    out.push({
      key: "co2_reduced",
      currentPct: metrics.co2_reduced,
      carry: `Around ${place}: emissions are middling — pack a light scarf or buff for dust near arterials, and favor buses where you can.`,
    });
  }

  // Roads / congestion
  if (road === "high") {
    out.push({
      key: "traffic_reduction",
      currentPct: metrics.traffic_reduction,
      carry: `Roads are flowing fairly well near ${place} — comfortable shoes if you walk the last kilometre, phone charged, and you can skip the “just in case” heavy jacket in the car.`,
    });
  } else if (road === "low") {
    out.push({
      key: "traffic_reduction",
      currentPct: metrics.traffic_reduction,
      carry: `Congestion is heavier near ${place} — bring water, a snack, and something to pass time; leave a few extra minutes and wear layers you can peel off if you’re idling in heat.`,
    });
  } else {
    out.push({
      key: "traffic_reduction",
      currentPct: metrics.traffic_reduction,
      carry: `Traffic is average around ${place} — small backpack with water, umbrella if rain is in the forecast, and shoes you’re okay standing in at signals.`,
    });
  }

  // Emergency access
  if (emerg === "high") {
    out.push({
      key: "emergency_access",
      currentPct: metrics.emergency_access,
      carry: `Help is relatively reachable from ${place} — still carry ID, any meds you need today, and a charged phone; a compact first‑aid pouch is plenty.`,
    });
  } else if (emerg === "low") {
    out.push({
      key: "emergency_access",
      currentPct: metrics.emergency_access,
      carry: `Response access is tighter near ${place} — add a small flashlight, jot emergency contacts on paper, and keep cash/card visible; avoid unnecessary solo trips after dark if you can.`,
    });
  } else {
    out.push({
      key: "emergency_access",
      currentPct: metrics.emergency_access,
      carry: `Emergency reach is moderate for ${place} — carry your usual meds, a power bank, and know the nearest hospital or clinic before you head out.`,
    });
  }

  // Transit efficiency + tone overlay
  let transitLine = "";
  if (transit === "high") {
    transitLine = `Transit is moving smoothly — travel light: small bag, tap card ready, and you can skip bulky extras.`;
  } else if (transit === "low") {
    transitLine = `Buses and trains are sluggish today — book or podcast, water, and a packable layer for platforms; consider an earlier departure.`;
  } else {
    transitLine = `Transit is middling — umbrella or compact shell, headphones, and snacks if you’re connecting more than once.`;
  }
  if (tone === "heat") {
    transitLine += ` With ${alertTitle}: cap or visor, sunscreen, and light colours.`;
  } else if (tone === "wet") {
    transitLine += ` With ${alertTitle}: waterproof shell, dry bag for electronics, and shoes with grip.`;
  } else if (tone === "traffic" || tone === "transit") {
    transitLine += ` With ${alertTitle}: check detours before you leave.`;
  }
  out.push({
    key: "transit_efficiency",
    currentPct: metrics.transit_efficiency,
    carry: `Near ${place}: ${transitLine}`,
  });

  return out;
}
