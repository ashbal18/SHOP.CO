"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";

interface AddStoreModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (store: any) => void;
  token: string;
}

interface StoreAdmin {
  id: string;
  name: string;
  email: string;
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

export default function AddStoreModal({
  open,
  onClose,
  onAdd,
  token,
}: AddStoreModalProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [adminId, setAdminId] = useState("");
  const [cityId, setCityId] = useState<number | null>(null);

  const [admins, setAdmins] = useState<StoreAdmin[]>([]);
  const [cities, setCities] = useState<RajaOngkirCity[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get("/store-admin", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmins(response.data);
      } catch (err) {
        console.error("Gagal mengambil data admin:", err);
      }
    };

    if (open) {
      fetchAdmins();
    }
  }, [open, token]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Log payload jika ingin melihat di console
      console.log({
        name,
        address,
        adminId,
        city_id: String(cityId),
      });

      const response = await axios.post(
        "/store",
        {
          name,
          address,
          adminId,
          city_id: String(cityId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onAdd(response.data);
      setName("");
      setAddress("");
      setAdminId("");
      setCityId(null);
      onClose();
    } catch (err: any) {
      console.error("Gagal menambahkan toko:", err);
      setError(err.response?.data?.error || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Tambah Toko Baru</h2>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Nama Toko</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700">Alamat</label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700">Pilih Admin Toko</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              required
            >
              <option value="">-- Pilih Admin --</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.name} ({admin.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Cari Kota</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Ketik nama kota/kecamatan..."
                className="flex-1 border border-gray-300 rounded px-3 py-2"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <button
                type="button"
                onClick={handleSearchCity}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Cari
              </button>
            </div>

            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={cityId ?? ""}
              onChange={(e) => setCityId(Number(e.target.value))}
              required
            >
              <option value="">-- Pilih Kota --</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
