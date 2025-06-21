"use client";

import { useState, useEffect } from "react";

interface EditStockFormProps {
  stockToEdit: {
    id: string;
    productName: string;
    quantity: number;
    store: { id: string; name: string };
  } | null;
  onUpdate: (updatedStock: {
    id: string;
    productName: string;
    quantity: number;
    store: { id: string; name: string };
  }) => void;
}

export default function EditStockForm({ stockToEdit, onUpdate }: EditStockFormProps) {
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [storeName, setStoreName] = useState("");

  useEffect(() => {
    if (stockToEdit) {
      setProductName(stockToEdit.productName);
      setQuantity(stockToEdit.quantity);
      setStoreName(stockToEdit.store.name);
    }
  }, [stockToEdit]);

  if (!stockToEdit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName || !storeName || quantity <= 0) {
      alert("Harap lengkapi semua data dengan benar.");
      return;
    }

    onUpdate({
      id: stockToEdit.id,
      productName,
      quantity,
      store: {
        id: stockToEdit.store.id,
        name: storeName,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg shadow mt-6">
      <h2 className="text-lg font-semibold">Edit Stok</h2>
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
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Simpan Perubahan
      </button>
    </form>
  );
}
