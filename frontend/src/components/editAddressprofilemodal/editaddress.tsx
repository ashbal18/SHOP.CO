"use client";
import { useEffect, useState, FormEvent } from "react";
import axios from "@/lib/axios";
import DestinationSearch from "./destination";
import MapSection from "./locMarker";

export interface Address {
  address_id: string;
  address_name: string;
  address: string;
  subdistrict?: string | null;
  city: string;
  province: string;
  postcode?: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface Destination {
  id: number;
  label: string;
  subdistrict_name: string;
  city_name: string;
  province_name: string;
  zip_code: string;
}

interface EditAddressModalProps {
  open: boolean;
  onClose: () => void;
  addressToEdit: Address | null;
  token: string;
  onUpdate: (updatedAddress: Address) => void;
}

const fetchCoordinatesFromAddress = async (fullAddress: string) => {
  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: fullAddress,
        format: "json",
        limit: 1,
      },
    });
    if (res.data.length > 0) {
      const { lat, lon } = res.data[0];
      return {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
      };
    }
  } catch (error) {
    console.error("Gagal mendapatkan koordinat:", error);
  }
  return { latitude: undefined, longitude: undefined };
};
export default function EditAddressModal({
  open,
  onClose,
  addressToEdit,
  token,
  onUpdate,
}: EditAddressModalProps) {
  const [addressName, setAddressName] = useState("");
  const [address, setAddress] = useState("");
  const [subdistrict, setSubdistrict] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postcode, setPostcode] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);

  const [destKeyword, setDestKeyword] = useState("");
  const [destResults, setDestResults] = useState<Destination[]>([]);
  const [destLoading, setDestLoading] = useState(false);
  const [destError, setDestError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (open && addressToEdit) {
      setAddressName(addressToEdit.address_name);
      setAddress(addressToEdit.address);
      setSubdistrict(addressToEdit.subdistrict ?? "");
      setCity(addressToEdit.city);
      setProvince(addressToEdit.province);
      setPostcode(addressToEdit.postcode ?? "");
      setIsPrimary(addressToEdit.is_primary);
      setLatitude(addressToEdit.latitude ?? undefined);
      setLongitude(addressToEdit.longitude ?? undefined);
      setDestKeyword("");
      setDestResults([]);
      setError("");
    }
  }, [open, addressToEdit]);

  const handleDestSearch = async () => {
    if (!destKeyword.trim()) return setDestError("Masukkan kata kunci");
    setDestLoading(true);
    setDestError("");
    try {
      const res = await axios.get("/rajaongkir/search", {
        params: { keyword: destKeyword },
      });
      setDestResults(res.data.data || []);
    } catch (err) {
      console.error("Error fetching destinations:", err);
      setDestError("Gagal mencari tujuan");
    } finally {
      setDestLoading(false);
    }
  };

  const pickDestination = async (d: Destination) => {
    setSubdistrict(d.subdistrict_name);
    setCity(d.city_name);
    setProvince(d.province_name);
    setPostcode(d.zip_code);
    setDestKeyword(d.label);
    setDestResults([]);
    const fullAddress = `${d.subdistrict_name}, ${d.city_name}, ${d.province_name}`;
    const coords = await fetchCoordinatesFromAddress(fullAddress);
    if (coords.latitude && coords.longitude) {
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation tidak didukung oleh browser Anda.");
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
        setError(`Gagal mengambil lokasi: ${err.message}`);
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      address_name: addressName,
      address,
      subdistrict: subdistrict || null,
      city,
      province,
      postcode: postcode || null,
      is_primary: isPrimary,
      latitude,
      longitude,
    };

    try {
      const response = await axios.put(
        `/address/${addressToEdit?.address_id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onUpdate(response.data);
      onClose();
    } catch (err) {
      console.error("Error updating address:", err);
      setError("Gagal menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !addressToEdit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Edit Alamat</h2>
        {error && <p className="text-red-600 mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Nama Alamat" value={addressName} onChange={(e) => setAddressName(e.target.value)} className="w-full border rounded px-3 py-2" required />
          <textarea placeholder="Alamat Lengkap" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border rounded px-3 py-2" required />
          <input type="text" placeholder="Kelurahan/Kecamatan" value={subdistrict} onChange={(e) => setSubdistrict(e.target.value)} className="w-full border rounded px-3 py-2" />
          <DestinationSearch
            keyword={destKeyword}
            setKeyword={setDestKeyword}
            results={destResults}
            onSearch={handleDestSearch}
            loading={destLoading}
            error={destError}
            onSelect={pickDestination}
          />
          <input type="text" placeholder="Kode Pos" value={postcode} onChange={(e) => setPostcode(e.target.value)} className="w-full border rounded px-3 py-2" />
          <button type="button" onClick={handleUseCurrentLocation} className="px-3 py-1 bg-green-600 text-white rounded" disabled={isLocating}>
            {isLocating ? "Mengambil lokasi..." : "Gunakan Lokasi Saat Ini"}
          </button>
          <MapSection latitude={latitude} longitude={longitude} setLatitude={setLatitude} setLongitude={setLongitude} />
          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
            <span>Jadikan alamat utama</span>
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400" disabled={loading}>
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
