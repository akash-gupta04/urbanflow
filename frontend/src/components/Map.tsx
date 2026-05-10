"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";

import { useEffect, useState } from "react";
import axios from "axios";

type Location = {
  name: string;
  type: string;
  lat: number;
  lon: number;
};

function FlyToAlert({
  selectedAlert,
}: {
  selectedAlert: string;
}) {
  const map = useMap();

  useEffect(() => {
    const alertLocations: Record<
      string,
      [number, number]
    > = {
      "Flood Warning":
        [43.725, -79.75],

      "Heavy Traffic":
        [43.7315, -79.7624],

      "Heatwave Alert":
        [43.74, -79.77],

      "Transit Delay":
        [43.735, -79.748],

      "Storm Advisory":
        [43.72, -79.79],
    };

    if (
      selectedAlert &&
      alertLocations[selectedAlert]
    ) {
      map.flyTo(
        alertLocations[
        selectedAlert
        ],
        13,
        {
          duration: 1.5,
        }
      );
    }
  }, [selectedAlert, map]);

  return null;
}

export default function Map({
  selectedAlert,
  selectedCity,
}: {
  selectedAlert: string;
  selectedCity: string;
}) {
  const [locations,
    setLocations] =
    useState<Location[]>([]);

  useEffect(() => {

    const fetchLocations =
      async () => {

        try {

          const response =
            await axios.get(
            `http://localhost:8000/nearby-locations?city=${selectedCity}`
          );
          if (
            Array.isArray(
              response.data
            )
          ) {

            setLocations(
              response.data
            );

          } else {

            console.error(
              "API Error:",
              response.data
            );

            setLocations([]);
          }

        } catch (error) {

          console.error(
            "Location error:",
            error
          );

          setLocations([]);
        }
      };

    fetchLocations();

  }, [selectedCity]);
const cityCoordinates:
  Record<
    string,
    [number, number]
  > = {

  Brampton:
    [43.7315, -79.7624],

  Toronto:
    [43.6532, -79.3832],

  Mississauga:
    [43.5890, -79.6441],

  Vancouver:
    [49.2827, -123.1207],
};

const selectedCoords =
  cityCoordinates[
    selectedCity
  ] ||
  cityCoordinates[
    "Brampton"
  ];
  return (
    <div className="rounded-3xl overflow-hidden border border-zinc-800 h-[650px]">
      <MapContainer
        center={selectedCoords}
        zoom={12}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution="OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyToAlert
          selectedAlert={
            selectedAlert
          }
        />

        {/* Dynamic markers */}
        {locations.map(
          (
            location,
            index
          ) => (
            <Marker
              key={index}
              position={[
                location.lat,
                location.lon,
              ]}
            >
              <Popup>
                <div>
                  <h3 className="font-bold">
                    {location.type === "hospital" && "🏥 "}
                    {location.type === "transit" && "🚌 "}
                    {location.type === "shelter" && "🏫 "}
                    {location.name}
                  </h3>

                  <p className="text-sm mt-1">
                    Category: {location.type}
                  </p>

                  <p className="text-green-500 text-sm">
                    Status: Active
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        )}

        {/* Flood */}
        {selectedAlert ===
          "Flood Warning" && (
            <Circle
              center={[
                43.725,
                -79.75,
              ]}
              radius={1000}
              pathOptions={{
                color:
                  "#ef4444",
                fillOpacity:
                  0.25,
              }}
            />
          )}

        {/* Traffic */}
        {selectedAlert ===
          "Heavy Traffic" && (
            <Circle
              center={[
                43.7315,
                -79.7624,
              ]}
              radius={900}
              pathOptions={{
                color:
                  "#eab308",
                fillOpacity:
                  0.22,
              }}
            />
          )}

        {/* Heatwave */}
        {selectedAlert ===
          "Heatwave Alert" && (
            <Circle
              center={[
                43.74,
                -79.77,
              ]}
              radius={1200}
              pathOptions={{
                color:
                  "#f97316",
                fillOpacity:
                  0.22,
              }}
            />
          )}

        {/* Transit */}
        {selectedAlert ===
          "Transit Delay" && (
            <Circle
              center={[
                43.735,
                -79.748,
              ]}
              radius={850}
              pathOptions={{
                color:
                  "#3b82f6",
                fillOpacity:
                  0.22,
              }}
            />
          )}

        {/* Storm */}
        {selectedAlert ===
          "Storm Advisory" && (
            <Circle
              center={[
                43.72,
                -79.79,
              ]}
              radius={1300}
              pathOptions={{
                color:
                  "#a855f7",
                fillOpacity:
                  0.22,
              }}
            />
          )}
      </MapContainer>
    </div>
  );
}