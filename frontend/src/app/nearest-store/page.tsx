"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Import Leaflet components secara dynamic karena Next.js (ssr: false)
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

type Store = {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  distance?: number; // dalam km dari user
};

// Fungsi geocode alamat pakai Nominatim (OpenStreetMap)
async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

// Fungsi hitung jarak Haversine (km)
function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius bumi km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export default function NearestStorePage() {
  const { data: session, status } = useSession();
  const loadingSession = status === "loading";

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: -6.200000,
    lng: 106.816666,
  });

  // Ambil lokasi user pertama kali saat mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setMapCenter({ lat: latitude, lng: longitude });
        setError(null);
      },
      () => {
        setError("Unable to retrieve your location");
      }
    );
  }, []);

  // Fungsi untuk update lokasi user ulang lewat button
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setMapCenter({ lat: latitude, lng: longitude });
        setError(null);
      },
      () => {
        setError("Unable to retrieve your location");
      }
    );
  };

  // Fetch data toko dan geocode alamat toko saat ada session dan lokasi user
  useEffect(() => {
    if (!session?.accessToken || !userLocation) return;

    async function fetchAndProcessStores() {
      setLoading(true);
      try {
        // Ganti URL dengan endpoint API kamu
        const res = await axios.get("/store/", {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });

        const rawStores: Store[] = res.data.stores ?? res.data;

        const storesWithCoords: Store[] = [];
        for (const store of rawStores) {
          const coords = await geocodeAddress(store.address);
          if (coords) {
            // Hitung jarak toko ke user
            const distance = userLocation
              ? getDistanceFromLatLonInKm(
                  userLocation.lat,
                  userLocation.lng,
                  coords.lat,
                  coords.lon
                )
              : undefined;
            storesWithCoords.push({
              ...store,
              latitude: coords.lat,
              longitude: coords.lon,
              distance,
            });
          } else {
            storesWithCoords.push(store);
          }
        }

        // Sortir berdasarkan jarak terdekat
        storesWithCoords.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

        setStores(storesWithCoords);
      } catch (err) {
        console.error(err);
        setError("Failed to load or process store data");
      } finally {
        setLoading(false);
      }
    }

    fetchAndProcessStores();
  }, [session?.accessToken, userLocation]);

  if (loadingSession) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>Loading session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>You need to log in first.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>Loading stores and locations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Filter dengan search query
  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex-1 p-8 overflow-auto max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Nearest Stores</h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 my-6">
        <input
          type="text"
          placeholder="Search stores by name or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow p-3 border border-gray-300 rounded-lg"
        />
        <button
          onClick={handleUseCurrentLocation}
          className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="Use your current location"
        >
          Use Current Location
        </button>
      </div>

      <div style={{ height: "400px", width: "100%" }}>
        <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Marker user */}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]}>
              <Popup>Your Location</Popup>
            </Marker>
          )}

          {/* Marker toko */}
          {filteredStores.map(
            (store) =>
              store.latitude &&
              store.longitude && (
                <Marker key={store.id} position={[store.latitude, store.longitude]}>
                  <Popup>
                    <strong>{store.name}</strong>
                    <br />
                    {store.address}
                    <br />
                    <em>{store.distance?.toFixed(2)} km away</em>
                  </Popup>
                </Marker>
              )
          )}
        </MapContainer>
      </div>

      {filteredStores.length === 0 ? (
        <p className="mt-4">No stores found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-8">
          {filteredStores.map((store) => (
            <div
              key={store.id}
              className="flex flex-col p-6 bg-white shadow-xl rounded-lg border-2 hover:scale-105 transition-transform"
            >
              <h2 className="text-xl font-semibold">{store.name}</h2>
              <p className="text-gray-500 text-sm">{store.address}</p>
              {store.distance !== undefined && (
                <p className="text-sm text-gray-600">{store.distance.toFixed(2)} km away</p>
              )}
              {store.latitude && store.longitude && (
                <a
                  href={`https://maps.google.com/?q=${store.latitude},${store.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 px-4 py-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                >
                  View on Map
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
