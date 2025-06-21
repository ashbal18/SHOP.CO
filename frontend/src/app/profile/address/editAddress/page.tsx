"use client";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";

interface Address {
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
}

interface EditAddressModalProps {
  open: boolean;
  onClose: () => void;
  addressToEdit: Address | null;
  token: string;
  onUpdate: (updatedAddress: Address) => void;
}

export default function EditAddressModal({
  open,
  onClose,
  addressToEdit,
  token,
  onUpdate,
}: EditAddressModalProps) {
  // State pakai camelCase, mapping ke snake_case saat kirim
  const [addressName, setAddressName] = useState("");
  const [address, setAddress] = useState("");
  const [subdistrict, setSubdistrict] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postcode, setPostcode] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && addressToEdit) {
      setAddressName(addressToEdit.address_name);
      setAddress(addressToEdit.address);
      setSubdistrict(addressToEdit.subdistrict ?? "");
      setCity(addressToEdit.city);
      setProvince(addressToEdit.province);
      setPostcode(addressToEdit.postcode ?? "");
      setIsPrimary(addressToEdit.is_primary);
      setError("");
    }
  }, [open, addressToEdit]);

  if (!open || !addressToEdit) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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
    };

    console.log("Mengirim data update alamat:", payload);

    try {
      const response = await axios.put(
        `/address/${addressToEdit.address_id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response dari server:", response.data);

      onUpdate(response.data);
      onClose();
    } catch (err: any) {
      console.error("Error saat update alamat:", err.response || err);
      setError(err.response?.data?.message || "Terjadi kesalahan saat memperbarui alamat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Edit Alamat</h2>

        {error && <p className="text-red-600 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Nama Alamat</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={addressName}
              onChange={(e) => setAddressName(e.target.value)}
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
            <label className="block text-gray-700">Kelurahan/Subdistrict</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={subdistrict}
              onChange={(e) => setSubdistrict(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700">Kota</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700">Provinsi</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700">Kode Pos</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="isPrimary"
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="form-checkbox"
            />
            <label htmlFor="isPrimary" className="text-gray-700">
              Jadikan alamat utama
            </label>
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
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
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
