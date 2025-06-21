"use client";

import { useState } from "react";

interface AddStockFormProps {
  onAdd: (stock: {
    id: string;
    productName: string;
    quantity: number;
    store: { id: string; name: string };
  }) => void;
}

export default function AddStockForm({ onAdd }: AddStockFormProps) {
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [storeName, setStoreName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName || !storeName || quantity <= 0) {
      alert("Harap lengkapi semua data dengan benar.");
      return;
    }

    const newStock = {
      id: Date.now().toString(),
      productName,
      quantity,
      store: {
        id: `store-${Math.random().toString(36).substr(2, 9)}`,
        name: storeName,
      },
    };

    onAdd(newStock);
    setProductName("");
    setQuantity(0);
    setStoreName("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold">Tambah Stok Baru</h2>
      <div>
        <label className="block text-sm font-medium">Nama Produk</label>
        <input
          type="text"
          className="w-full mt-1 border px-3 py-2 rounded"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Jumlah</label>
        <input
          type="number"
          className="w-full mt-1 border px-3 py-2 rounded"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          min={1}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Nama Toko</label>
        <input
          type="text"
          className="w-full mt-1 border px-3 py-2 rounded"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Tambah Stok
      </button>
    </form>
  );
}
