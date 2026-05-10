/// <reference types="google.maps" />

/** SVG data-URL markers for Google Maps (UrbanFlow palette). */

function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function endpointMarkerIcon(
  letter: "A" | "B",
  maps: typeof google.maps
): google.maps.Icon {
  const isStart = letter === "A";
  const ring = isStart ? "#14b8a6" : "#818cf8";
  const core = isStart ? "#0d9488" : "#6366f1";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="52" viewBox="0 0 44 52">
  <defs>
    <filter id="g" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.45"/>
    </filter>
  </defs>
  <path filter="url(#g)" fill="${ring}" d="M22 2C12.6 2 5 9.4 5 18.2c0 12.4 17 29.8 17 29.8s17-17.4 17-29.8C39 9.4 31.4 2 22 2z"/>
  <ellipse cx="22" cy="18" rx="11" ry="11" fill="${core}"/>
  <text x="22" y="22.5" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="white">${letter}</text>
</svg>`;
  return {
    url: svgDataUrl(svg),
    scaledSize: new maps.Size(44, 52),
    anchor: new maps.Point(22, 52),
  };
}

export function corridorStopIcon(maps: typeof google.maps): google.maps.Icon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
  <circle cx="11" cy="11" r="9" fill="#fbbf24" stroke="#0f172a" stroke-width="2"/>
  <circle cx="11" cy="11" r="3" fill="#fef3c7"/>
</svg>`;
  return {
    url: svgDataUrl(svg),
    scaledSize: new maps.Size(22, 22),
    anchor: new maps.Point(11, 11),
  };
}

export function poiMarkerIcon(type: string, maps: typeof google.maps): google.maps.Icon {
  let stroke = "#fb7185";
  let fill = "#fda4af";
  if (type === "transit") {
    stroke = "#38bdf8";
    fill = "#7dd3fc";
  } else if (type === "shelter") {
    stroke = "#fbbf24";
    fill = "#fde68a";
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">
  <circle cx="13" cy="13" r="10" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
  <circle cx="13" cy="13" r="3" fill="#0f172a" opacity="0.35"/>
</svg>`;
  return {
    url: svgDataUrl(svg),
    scaledSize: new maps.Size(26, 26),
    anchor: new maps.Point(13, 13),
  };
}
