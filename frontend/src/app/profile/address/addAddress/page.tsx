"use client";

import Navbar from "@/components/navbar/navbar/Navbar";
import Sidebar from "@/components/navbar/navbar/Sidebar";
import Footer from "@/components/navbar/navbar/footer";
import { useSession } from "next-auth/react";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
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

interface Destination {
  id: number;
  label: string;
  subdistrict_name: string;
  district_name: string;
  city_name: string;
  province_name: string;
  zip_code: string;
}

interface AddressFormData {
  address_name: string;
  address: string;
  subdistrict: string;
  city: string;
  city_id?: string;
  province: string;
  province_id?: string;
  postcode: string;
  latitude?: number;
  longitude?: number;
  is_primary: boolean;
  destination_id?: string; // ✅ baru
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
        Lokasi terpilih: <br />
        Lat: {latitude.toFixed(5)}, Lng: {longitude.toFixed(5)}
      </Popup>
    </Marker>
  );
}

export default function CreateAddressPage() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  const [formData, setFormData] = useState<AddressFormData>({
    address_name: "",
    address: "",
    province: "",
    city: "",
    subdistrict: "",
    postcode: "",
    latitude: undefined,
    longitude: undefined,
    is_primary: false,
    destination_id: undefined,
  });

  const [destKeyword, setDestKeyword] = useState("");
  const [destResults, setDestResults] = useState<Destination[]>([]);
  const [destLoading, setDestLoading] = useState(false);
  const [destError, setDestError] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [subdistricts, setSubdistricts] = useState<any[]>([]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    if (name === "latitude" || name === "longitude") {
      const val = value.trim() === "" ? undefined : parseFloat(value);
      setFormData((prev) => ({ ...prev, [name]: val }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation tidak didukung oleh browser Anda.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setFormData((prev) => ({
          ...prev,
          latitude: coords.latitude,
          longitude: coords.longitude,
        }));
        setIsLocating(false);
      },
      (err) => {
        setMessage(`Gagal mengambil lokasi: ${err.message}`);
        setIsLocating(false);
      }
    );
  };

  const handleDestSearch = async () => {
    if (!destKeyword.trim()) return setDestError("Masukkan kata kunci tujuan");
    setDestLoading(true);
    setDestError("");
    try {
      const res = await axios.get("/rajaongkir/search", {
        params: { keyword: destKeyword },
      });
      setDestResults(res.data.data || []);
    } catch (err: any) {
      setDestError(err?.response?.data?.message || err.message || "Gagal cari tujuan");
    } finally {
      setDestLoading(false);
    }
  };

  const pickDestination = (d: Destination) => {
    setFormData((prev) => ({
      ...prev,
      subdistrict: d.subdistrict_name,
      city: d.city_name,
      province: d.province_name,
      postcode: d.zip_code,
      city_id: String(d.id),
      province_id: d.province_name,
      destination_id: String(d.id), // ✅ simpan ke form
    }));
    setDestKeyword(d.label);
    setDestResults([]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = (session as any)?.accessToken;
    const userId = (session?.user as any)?.id || "";

    if (!formData.address_name || !formData.address || !formData.subdistrict || !formData.city || !formData.province || !formData.postcode) {
      setMessage("Harap isi semua field wajib.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...formData, id: userId };
      const res = await axios.post("/address", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200 || res.status === 201) {
        setMessage("Alamat berhasil dibuat ✅");
        setFormData({
          address_name: "",
          address: "",
          province: "",
          city: "",
          subdistrict: "",
          postcode: "",
          latitude: undefined,
          longitude: undefined,
          is_primary: false,
          destination_id: undefined,
        });
        setSubdistricts([]);
      } else {
        setMessage("Gagal membuat alamat.");
      }
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Gagal mengirim data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading session...</div>;
  if (!session) return <div>Anda harus login terlebih dahulu.</div>;

  return (
    <>
      <Navbar />
      <div className="flex h-screen w-full">
        <div className="w-64 bg-gray-100 hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-auto p-8">
          <h1 className="text-3xl font-bold mb-6">Buat Alamat Baru</h1>
          <div className="max-w-xl bg-white p-6 rounded shadow mx-auto">
            {message && <p className="mb-4 text-red-600">{message}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="address_name" placeholder="Nama Alamat" onChange={handleChange} value={formData.address_name} className="w-full border rounded px-3 py-2" />
              <input name="address" placeholder="Alamat Lengkap" onChange={handleChange} value={formData.address} className="w-full border rounded px-3 py-2" />
              <input name="subdistrict" placeholder="Kecamatan" onChange={handleChange} value={formData.subdistrict} className="w-full border rounded px-3 py-2" readOnly />

              <div>
                <label className="block mb-1 font-semibold">Cari Kota/Kabupaten & Provinsi</label>
                <input
                  type="text"
                  value={destKeyword}
                  onChange={(e) => {
                    setDestKeyword(e.target.value);
                    setDestResults([]);
                  }}
                  placeholder="Contoh: Bandung"
                  className="w-full border rounded px-3 py-2 mb-1"
                />
                <button
                  type="button"
                  onClick={handleDestSearch}
                  disabled={destLoading}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  {destLoading ? "Mencari..." : "Cari"}
                </button>
                {destError && <p className="text-red-500">{destError}</p>}
                {destResults.length > 0 && (
                  <ul className="border rounded mt-2 max-h-40 overflow-y-auto">
                    {destResults.map((d, i) => (
                      <li
                        key={i}
                        onClick={() => pickDestination(d)}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <strong>{d.label}</strong><br />
                        <span className="text-sm text-gray-500">
                          {d.subdistrict_name}, {d.city_name}, {d.province_name}, {d.zip_code}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <input type="hidden" name="city" value={formData.city} />
              <input type="hidden" name="province" value={formData.province} />
              <input type="hidden" name="city_id" value={formData.city_id || ""} />
              <input type="hidden" name="province_id" value={formData.province_id || ""} />
              <input type="hidden" name="destination_id" value={formData.destination_id || ""} /> {/* ✅ */}

              <input name="postcode" placeholder="Kode Pos" onChange={handleChange} value={formData.postcode} className="w-full border rounded px-3 py-2" readOnly />

              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="px-3 py-1 bg-green-600 text-white rounded"
                disabled={isLocating}
              >
                {isLocating ? "Mengambil lokasi..." : "Gunakan Lokasi Saat Ini"}
              </button>

              <MapContainer center={[-6.2, 106.8]} zoom={10} className="h-64 w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapWrapper latitude={formData.latitude} longitude={formData.longitude} />
                <LocationMarker
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  setLatitude={(lat) => setFormData((prev) => ({ ...prev, latitude: lat }))}
                  setLongitude={(lng) => setFormData((prev) => ({ ...prev, longitude: lng }))}
                />
              </MapContainer>

              <label className="flex items-center space-x-2">
                <input type="checkbox" name="is_primary" checked={formData.is_primary} onChange={handleChange} />
                <span>Jadikan alamat utama</span>
              </label>

              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded">
                {isSubmitting ? "Menyimpan..." : "Simpan Alamat"}
              </button>
            </form>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
