"use client";
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapWrapper({ latitude, longitude }: { latitude?: number; longitude?: number }) {
  const map = useMap();
  useEffect(() => {
    if (latitude !== undefined && longitude !== undefined) {
      map.setView([latitude, longitude], 13, { animate: true });
    }
  }, [latitude, longitude, map]);
  return null;
}

function LocationMarker({
  latitude,
  longitude,
  setLatitude,
  setLongitude,
}: {
  latitude?: number;
  longitude?: number;
  setLatitude: (lat: number) => void;
  setLongitude: (lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      setLatitude(e.latlng.lat);
      setLongitude(e.latlng.lng);
    },
  });

  if (latitude === undefined || longitude === undefined) return null;

  return (
    <Marker position={[latitude, longitude]} icon={markerIcon}>
      <Popup>
        Lokasi terpilih:
        <br />
        Lat: {latitude.toFixed(5)}, Lng: {longitude.toFixed(5)}
      </Popup>
    </Marker>
  );
}

export default function MapSection({
  latitude,
  longitude,
  setLatitude,
  setLongitude,
}: {
  latitude?: number;
  longitude?: number;
  setLatitude: (lat: number) => void;
  setLongitude: (lng: number) => void;
}) {
  return (
    <>
      <MapContainer center={[latitude ?? -6.2, longitude ?? 106.8]} zoom={10} className="h-64 w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapWrapper latitude={latitude} longitude={longitude} />
        <LocationMarker latitude={latitude} longitude={longitude} setLatitude={setLatitude} setLongitude={setLongitude} />
      </MapContainer>
      {latitude !== undefined && longitude !== undefined && (
        <p className="text-sm text-gray-700 mt-2">
          Koordinat: <strong>Lat:</strong> {latitude.toFixed(5)} | <strong>Lng:</strong> {longitude.toFixed(5)}
        </p>
      )}
    </>
  );
}
