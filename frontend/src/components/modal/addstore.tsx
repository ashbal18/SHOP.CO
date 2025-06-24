"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface AddStoreModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (store: Store) => void;
  token: string;
}

interface StoreAdmin {
  id: string;
  name: string;
  email: string;
}

interface Store {
  id: string;
  name: string;
  address: string;
  adminId: string;
  city_id: string;
  latitude: number;
  longitude: number;
}

interface RajaOngkirCity {
  id: number;
  label: string;
  subdistrict_name: string;
  district_name: string;
  city_name: string;
  province_name: string;
  zip_code: string;
}

const markerIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapWrapper({ latitude, longitude }: { latitude?: number; longitude?: number }) {
  const map = useMap();
  if (latitude !== undefined && longitude !== undefined) {
    map.setView([latitude, longitude], 13, { animate: true });
  }
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
        Lokasi terpilih:<br />
        Lat: {latitude.toFixed(5)}, Lng: {longitude.toFixed(5)}
      </Popup>
    </Marker>
  );
}

export default function AddStoreModal({ open, onClose, onAdd, token }: AddStoreModalProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [adminId, setAdminId] = useState("");
  const [cityId, setCityId] = useState<number | null>(null);
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();

  const [admins, setAdmins] = useState<StoreAdmin[]>([]);
  const [cities, setCities] = useState<RajaOngkirCity[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchAdmins = async () => {
      try {
        const res = await axios.get("/store-admin", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmins(res.data);
      } catch (err) {
        console.error("Gagal mengambil data admin:", err);
      }
    };

    fetchAdmins();
  }, [open, token]);

  const fetchCoordinatesFromAddress = async (address: string) => {
    try {
      const res = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: address,
          format: "json",
          limit: 1,
        },
      });

      if (res.data.length > 0) {
        const { lat, lon } = res.data[0];
        setLatitude(parseFloat(lat));
        setLongitude(parseFloat(lon));
      }
    } catch (err) {
      console.error("Gagal mendapatkan koordinat:", err);
    }
  };

  const handleSearchCity = async () => {
    if (!searchKeyword) return;
    try {
      const res = await axios.get("/rajaongkir/search", {
        params: { keyword: searchKeyword },
        headers: { Authorization: `Bearer ${token}` },
      });
      setCities(res.data.data || []);
    } catch (err) {
      console.error("Gagal mencari kota:", err);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation tidak didukung browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);
        setIsLocating(false);
      },
      (err) => {
        alert("Gagal mendapatkan lokasi: " + err.message);
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "/store",
        {
          name,
          address,
          adminId,
          city_id: String(cityId),
          latitude,
          longitude,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onAdd(res.data);
      setName("");
      setAddress("");
      setAdminId("");
      setCityId(null);
      setLatitude(undefined);
      setLongitude(undefined);
      onClose();
    } catch (err) {
      console.error("Gagal menambahkan toko:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Tambah Toko Baru</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700">Nama Toko</label>
            <input type="text" className="w-full border px-3 py-2 rounded" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Alamat</label>
            <textarea className="w-full border px-3 py-2 rounded" value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Admin Toko</label>
            <select className="w-full border px-3 py-2 rounded" value={adminId} onChange={(e) => setAdminId(e.target.value)} required>
              <option value="">-- Pilih Admin --</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>{admin.name} ({admin.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-700">Cari Kota</label>
            <div className="flex gap-2 my-2">
              <input type="text" className="flex-1 border px-3 py-2 rounded" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} placeholder="Ketik nama kota..." />
              <button type="button" onClick={handleSearchCity} className="px-4 py-2 bg-blue-600 text-white rounded">Cari</button>
            </div>
            <select
              className="w-full border px-3 py-2 rounded"
              value={cityId ?? ""}
              onChange={async (e) => {
                const selectedId = Number(e.target.value);
                setCityId(selectedId);

                const selected = cities.find((c) => c.id === selectedId);
                if (selected) {
                  const fullAddress = `${selected.subdistrict_name}, ${selected.city_name}, ${selected.province_name}`;
                  await fetchCoordinatesFromAddress(fullAddress);
                }
              }}
              required
            >
              <option value="">-- Pilih Kota --</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-700">Lokasi Toko (klik di peta)</label>
            <button type="button" onClick={handleUseCurrentLocation} disabled={isLocating} className="mb-2 px-3 py-1 bg-green-600 text-white rounded">
              {isLocating ? "Mengambil lokasi..." : "Gunakan Lokasi Saat Ini"}
            </button>
            <MapContainer center={[-6.2, 106.8]} zoom={10} className="h-64 w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapWrapper latitude={latitude} longitude={longitude} />
              <LocationMarker
                latitude={latitude}
                longitude={longitude}
                setLatitude={setLatitude}
                setLongitude={setLongitude}
              />
            </MapContainer>
            {latitude && longitude && (
              <p className="text-sm mt-2 text-gray-600">
                Koordinat dipilih: <strong>{latitude.toFixed(5)}, {longitude.toFixed(5)}</strong>
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Batal</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}
