import { useState, useEffect } from "react";
import axios from "@/lib/axios";

export interface StoreAdmin {
  id: string;
  name: string;
  email: string;
  roles: string;
  store?: {
    id: string;
    name: string;
    location: string;
  };
}

interface EditStoreAdminModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  storeAdmin: StoreAdmin | null;
  onUpdate: (updatedAdmin: StoreAdmin) => void;
}

export default function EditStoreAdminModal({
  isOpen,
  setIsOpen,
  storeAdmin,
  onUpdate,
}: EditStoreAdminModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set form field saat modal terbuka dan storeAdmin berubah
  useEffect(() => {
    if (storeAdmin && isOpen) {
      setName(storeAdmin.name);
      setEmail(storeAdmin.email);
      setRoles(storeAdmin.roles);
      setError(null);
    }
  }, [storeAdmin, isOpen]);

  if (!isOpen || !storeAdmin) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(`/store-admin/${storeAdmin.id}`, {
        name,
        email,
        roles,
      });

      onUpdate(response.data); // Update data di parent
      setIsOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Terjadi kesalahan saat update.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold mb-4">Edit Store Admin</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1" htmlFor="name">
              Nama
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1" htmlFor="roles">
              Role
            </label>
            <select
              id="roles"
              value={roles}
              onChange={(e) => setRoles(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="STORE_ADMIN">Store Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              {/* Tambahkan role lain sesuai kebutuhan */}
            </select>
          </div>

          {error && (
            <p className="text-red-600 font-semibold text-sm">{error}</p>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-70"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
