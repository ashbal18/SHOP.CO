"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "@/lib/axios";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  // bisa tambah field lain kalau ada
}

interface EditProductModalProps {
  open: boolean;
  onClose: () => void;
  productToEdit: Product | null;
  onUpdate: (updatedProduct: Product) => void;
  categories: Category[];
}

export default function EditProductModal({
  open,
  onClose,
  productToEdit,
  onUpdate,
  categories,
}: EditProductModalProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Set form data saat productToEdit berubah
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCategoryId(productToEdit.categoryId);
      setPrice(productToEdit.price);
      setImageFile(null);
    }
  }, [productToEdit]);

  if (!open || !productToEdit) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name || !categoryId || !price || price <= 0) {
      alert("Mohon isi semua data dengan benar");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("categoryId", categoryId);
      formData.append("price", price.toString());
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await axios.put(`/product/${productToEdit.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      const updatedProduct: Product = res.data;
      onUpdate(updatedProduct);
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal update produk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded w-96 shadow-lg"
        encType="multipart/form-data"
      >
        <h2 className="text-xl font-semibold mb-4">Edit Produk</h2>

        <label className="block mb-2">
          Nama Produk
          <input
            type="text"
            className="w-full border rounded px-2 py-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label className="block mb-2">
          Kategori
          <select
            className="w-full border rounded px-2 py-1"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">-- Pilih kategori --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block mb-2">
          Harga
          <input
            type="number"
            className="w-full border rounded px-2 py-1"
            value={price}
            min={0}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
          />
        </label>

        <label className="block mb-4">
          Ganti Gambar Produk (kosongkan jika tidak ganti)
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
            disabled={loading}
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
