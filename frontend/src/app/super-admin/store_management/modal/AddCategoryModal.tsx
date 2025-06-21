"use client";

import { useState, FormEvent } from "react";
import axios from "@/lib/axios";

interface Category {
  id: string;
  name: string;
}

interface AddCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (newCategory: Category) => void;
}

export default function AddCategoryModal({
  open,
  onClose,
  onAdd,
}: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Nama kategori tidak boleh kosong");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token") || "";
      const res = await axios.post(
        "/category",
        { name: name.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onAdd(res.data);
      setName("");
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal menambahkan kategori");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded w-80 shadow-lg"
      >
        <h2 className="text-xl font-semibold mb-4">Tambah Kategori</h2>

        <label className="block mb-4">
          Nama Kategori
          <input
            type="text"
            className="w-full border rounded px-2 py-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </label>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setName("");
              onClose();
            }}
            className="px-4 py-2 bg-gray-300 rounded"
            disabled={loading}
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Tambah"}
          </button>
        </div>
      </form>
    </div>
  );
}
