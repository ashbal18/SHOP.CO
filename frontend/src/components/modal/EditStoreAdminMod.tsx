"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useSession } from "next-auth/react";

export interface StoreAdmin {
  id: string;
  name: string;
  email: string;
  roles: string;
}

interface EditStoreAdminModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  admin: StoreAdmin | null;
  onUpdate: (updatedAdmin: StoreAdmin) => void;
}

export default function EditStoreAdminModal({
  isOpen,
  setIsOpen,
  admin,
  onUpdate,
}: EditStoreAdminModalProps) {
  const { data: session } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (admin) {
      setName(admin.name);
      setEmail(admin.email);
      setError("");
    }
  }, [admin]);

  const handleSubmit = async () => {
    if (!session?.accessToken) {
      console.error("Akses token tidak ditemukan");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.patch(
        `/super-admin/${admin?.id}`,
        { name, email },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      onUpdate(res.data.user);
      setIsOpen(false);
    } catch (err: any) {
      console.error("Gagal mengupdate Store Admin:", err);
      setError(err.response?.data?.message || "Terjadi kesalahan saat mengupdate admin.");
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = () => setIsOpen(false);
  if (!isOpen || !admin) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Edit Store Admin</h2>

        {error && <p className="text-red-600 mb-3">{error}</p>}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
            disabled={loading}
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
