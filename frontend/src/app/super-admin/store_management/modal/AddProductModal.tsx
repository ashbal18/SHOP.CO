"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import axios from "@/lib/axios";
interface Category {
  id: string;
  name: string;
}

interface Store {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  storeId: string;
}

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (newProduct: Product) => void;
  categories: Category[];
  stores: Store[];      // Tambah prop stores
  token: string;
}

export default function AddProductModal({
  open,
  onClose,
  onAdd,
  categories,
  stores,
  token,
}: AddProductModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [selectedStoreId, setSelectedStoreId] = useState(""); // State pilihan store
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategoryId("");
    setPrice("");
    setQuantity("");
    setSelectedStoreId("");   // Reset pilihan store
    setImageFile(null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (
      !name.trim() ||
      !description.trim() ||
      !categoryId ||
      !price ||
      !quantity ||
      !selectedStoreId
    ) {
      alert("Mohon isi semua data dengan benar");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("categoryId", categoryId);
      formData.append("price", price.toString());
      formData.append("quantity", quantity.toString());
      formData.append("storeId", selectedStoreId); // Kirim storeId yg dipilih
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await axios.post("/product", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      onAdd(res.data);
      resetForm();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || "Gagal menambahkan produk");
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
        <h2 className="text-xl font-semibold mb-4">Tambah Produk Baru</h2>

        <label className="block mb-4">
          Nama Produk
          <input
            type="text"
            className="w-full border rounded px-2 py-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </label>

        <label className="block mb-4">
          Deskripsi Produk
          <textarea
            className="w-full border rounded px-2 py-1"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>

        <label className="block mb-4">
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

        <label className="block mb-4">
          Pilih Store
          <select
            className="w-full border rounded px-2 py-1"
            value={selectedStoreId}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            required
          >
            <option value="">-- Pilih store --</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block mb-4">
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
          Stok Awal
          <input
            type="number"
            className="w-full border rounded px-2 py-1"
            value={quantity}
            min={0}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
        </label>

        <label className="block mb-6">
          Gambar Produk
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={() => {
              resetForm();
              onClose();
            }}
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
