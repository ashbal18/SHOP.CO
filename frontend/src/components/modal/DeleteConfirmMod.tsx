"use client";

import { useState } from "react";
import axios from "@/lib/axios";
import { useSession } from "next-auth/react";

export interface StoreAdmin {
  id: string;
  name: string;
}

interface DeleteStoreAdminModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  admin: StoreAdmin | null;
  onSuccess?: () => void;
}

export default function DeleteStoreAdminModal({
  isOpen,
  setIsOpen,
  admin,
  onSuccess,
}: DeleteStoreAdminModalProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!admin) return;
    if (!session?.accessToken) {
      setError("Akses token tidak ditemukan");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.delete(`/super-admin/${admin.id}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      onSuccess?.();
      setIsOpen(false);
    } catch (err: any) {
      console.error("Gagal menghapus Store Admin:", err);
      setError(err.response?.data?.message || "Terjadi kesalahan saat menghapus Store Admin.");
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
        className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Konfirmasi Penghapusan</h2>

        {error && <p className="text-red-600 mb-3">{error}</p>}

        <p className="text-sm text-gray-700">
          Apakah Anda yakin ingin menghapus <span className="font-semibold">{admin.name}</span>? 
          Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
            disabled={loading}
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
            disabled={loading}
          >
            {loading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
