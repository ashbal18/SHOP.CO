import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { Store } from "./addadminstore";

interface EditStoreModalProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (updatedStore: Store) => void;
  storeToEdit: StoreWithCity | null;
  token: string;
}

interface StoreWithCity {
  id: string;
  name: string;
  address: string;
  city_id?: number;
  admin?: {
    id: string;
    name: string;
    email: string;
  };
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

interface StoreAdmin {
  id: string;
  name: string;
  email: string;
}

export default function EditStoreModal({
  open,
  onClose,
  onUpdate,
  storeToEdit,
  token,
}: EditStoreModalProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [cityId, setCityId] = useState<number | null>(null);
  const [adminId, setAdminId] = useState("");
  const [admins, setAdmins] = useState<StoreAdmin[]>([]);
  const [cities, setCities] = useState<RajaOngkirCity[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    if (storeToEdit) {
      setName(storeToEdit.name);
      setAddress(storeToEdit.address);
      setCityId(storeToEdit.city_id ?? null);
      setAdminId(storeToEdit.admin?.id ?? "");
    }

    if (open) {
      fetchAdmins();
    }
  }, [storeToEdit, open]);

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

  const handleSubmit = async () => {
    if (!storeToEdit) return;

    try {
      const response = await axios.patch(
        `/store/${storeToEdit.id}`,
        {
          name,
          address,
          city_id: cityId ? String(cityId) : null,
          adminId: adminId || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onUpdate(response.data);
      onClose();
    } catch (error) {
      console.error("Gagal memperbarui toko:", error);
      alert("Terjadi kesalahan saat memperbarui toko.");
    }
  };

  if (!open || !storeToEdit) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Toko</h2>

        <label className="block mb-2">
          Nama Toko
          <input
            type="text"
            className="w-full border px-3 py-2 rounded mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="block mb-2">
          Alamat
          <textarea
            className="w-full border px-3 py-2 rounded mt-1"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </label>

        <div className="mb-4">
          <label className="block mb-1">Pilih Admin Toko</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
          >
            <option value="">-- Pilih Admin --</option>
            {admins.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.name} ({admin.email})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-2">
          <label className="block mb-1">Cari Kota</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Ketik nama kota/kecamatan..."
              className="flex-1 border px-3 py-2 rounded"
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
            className="w-full border px-3 py-2 rounded"
            value={cityId ?? ""}
            onChange={(e) => setCityId(Number(e.target.value))}
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
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
