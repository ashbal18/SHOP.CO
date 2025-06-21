"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

const userIcon = new L.Icon({
  iconUrl: "/marker-icon-user.png", // ganti dengan ikon custom jika perlu
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const storeIcon = new L.Icon({
  iconUrl: "/marker-icon-store.png", // ganti dengan ikon custom jika perlu
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

type Product = {
  id: string;
  name: string;
  storeLatitude?: number;
  storeLongitude?: number;
  distance?: number;
  store?: {
    address: string;
  } | null;
};

type MapViewProps = {
  userCoords: { lat: number; lng: number };
  products: Product[];
};

const ChangeView = ({ coords }: { coords: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 13);
  }, [coords, map]);
  return null;
};

export default function MapView({ userCoords, products }: MapViewProps) {
  return (
    <div className="w-full h-[400px] mt-8 rounded-lg overflow-hidden">
      <MapContainer center={[userCoords.lat, userCoords.lng]} zoom={13} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <ChangeView coords={[userCoords.lat, userCoords.lng]} />
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marker untuk user */}
        <Marker position={[userCoords.lat, userCoords.lng]} icon={userIcon}>
          <Popup>Lokasi Anda</Popup>
        </Marker>

        {/* Marker untuk toko-toko */}
        {products
          .filter((p) => p.storeLatitude && p.storeLongitude)
          .map((product) => (
            <Marker
              key={product.id}
              position={[product.storeLatitude!, product.storeLongitude!]}
              icon={storeIcon}
            >
              <Popup>
                <strong>{product.name}</strong>
                <br />
                {product.store?.address ?? "Alamat tidak tersedia"}
                <br />
                📏 {product.distance?.toFixed(2)} km
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
