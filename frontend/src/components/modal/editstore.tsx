import { useState, useEffect } from "react";
import axios from "@/lib/axios";

interface EditStoreModalProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (updatedStore: Store) => void;
  storeToEdit: Store | null;
  token: string;
}

interface Store {
  id: string;
  name: string;
  address: string;
  admin?: {
    id: string;
    name: string;
    email: string;
  };
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

  useEffect(() => {
    if (storeToEdit) {
      setName(storeToEdit.name);
      setAddress(storeToEdit.address);
    }
  }, [storeToEdit]);

  const handleSubmit = async () => {
    if (!storeToEdit) return;

    try {
      const response = await axios.patch(
        `/store/${storeToEdit.id}`,
        { name, address },
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
        <label className="block mb-4">
          Alamat
          <textarea
            className="w-full border px-3 py-2 rounded mt-1"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </label>
        <div className="flex justify-end gap-2">
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