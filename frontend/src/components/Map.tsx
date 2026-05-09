"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
} from "react-leaflet";
import L from "leaflet";

const center: [number, number] = [43.7315, -79.7624];

const locations = [
  {
    name: "Brampton Civic Hospital",
    type: "hospital",
    position: [43.744, -79.74],
  },
  {
    name: "Emergency Shelter",
    type: "shelter",
    position: [43.72, -79.78],
  },
  {
    name: "Transit Hub",
    type: "transit",
    position: [43.7315, -79.7624],
  },
  {
    name: "Flood Risk Zone",
    type: "hazard",
    position: [43.725, -79.75],
  },
];

const iconStyles: Record<string, string> = {
  hospital: "#ef4444",
  shelter: "#22c55e",
  transit: "#3b82f6",
  hazard: "#f59e0b",
};

function createCustomIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:18px;
        height:18px;
        background:${color};
        border-radius:999px;
        border:3px solid white;
        box-shadow:0 0 20px ${color};
      ">
      </div>
    `,
  });
}

export default function Map() {
  return (
    <div className="rounded-3xl overflow-hidden border border-zinc-800 shadow-[0_0_40px_rgba(59,130,246,0.08)]">
      <MapContainer
        center={center}
        zoom={12}
        style={{
          height: "600px",
          width: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Hazard Zone */}
        <Circle
          center={[43.725, -79.75]}
          radius={800}
          pathOptions={{
            color: "#f59e0b",
            fillOpacity: 0.2,
          }}
        />

        {locations.map((location, index) => (
          <Marker
            key={index}
            position={location.position as [number, number]}
            icon={createCustomIcon(
              iconStyles[location.type]
            )}
          >
            <Popup>
              <div className="font-semibold">
                {location.name}
              </div>

              <p className="text-sm">
                Type: {location.type}
              </p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}