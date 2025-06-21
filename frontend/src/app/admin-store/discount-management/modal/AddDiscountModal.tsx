"use client";

import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import axios from "@/lib/axios";
import { useSession } from "next-auth/react";

interface Product {
  id: string;
  name: string;
  storeId: string;
}

interface Store {
  id: string;
  name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDiscountAdded: (discount: any) => void;
}

export default function AddDiscountModal({
  isOpen,
  onClose,
  onDiscountAdded,
}: Props) {
  const { data: session } = useSession();

  const [name, setName] = useState("");
  const [type, setType] = useState<"MANUAL" | "MIN_PURCHASE" | "BUY_ONE_GET_ONE">("MANUAL");
  const [amount, setAmount] = useState<number>(0);
  const [isPercentage, setIsPercentage] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [storeId, setStoreId] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch stores saat modal dibuka
  useEffect(() => {
    const accessToken = session?.accessToken;
    if (!accessToken || !isOpen) return;

    const fetchStores = async () => {
      try {
        const res = await axios.get("/store", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setStores(res.data || []);
        if (session.user.role === "ADMIN" && "storeId" in session.user) {
          const userStore = res.data.find((store: Store) => store.id === (session.user as any).storeId);
          if (userStore) setStoreId(userStore.id);
        }
      } catch (err) {
        console.error("Gagal mengambil data toko:", err);
      }
    };

    fetchStores();
  }, [isOpen, session]);

  // Fetch produk berdasarkan storeId
  useEffect(() => {
    const accessToken = session?.accessToken;
    if (!accessToken || !storeId) return;

    const fetchProductsByStore = async () => {
      try {
        const res = await axios.get(`/product/store/${storeId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setProducts(res.data || []);
      } catch (err) {
        console.error("Gagal mengambil produk dari toko:", err);
      }
    };

    fetchProductsByStore();
  }, [storeId, session]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(
        "/discounts",
        {
          name,
          type,
          amount,
          isPercentage,
          startDate,
          endDate,
          productId: selectedProduct,
          storeId: storeId || (session?.user && (session.user as any).storeId),
        },
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      onDiscountAdded(res.data);
      onClose();
      resetForm();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Gagal menambahkan diskon.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setAmount(0);
    setIsPercentage(false);
    setStartDate("");
    setEndDate("");
    setSelectedProduct("");
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>

          <Dialog.Title className="text-xl font-bold mb-4">Tambah Diskon</Dialog.Title>

          <div className="space-y-4 max-h-[80vh] overflow-y-auto">
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              placeholder="Nama Diskon"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <select
              className="w-full border px-3 py-2 rounded"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              <option value="MANUAL">Manual</option>
              <option value="MIN_PURCHASE">Minimal Pembelian</option>
              <option value="BUY_ONE_GET_ONE">Beli 1 Gratis 1</option>
            </select>

            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              placeholder="Jumlah Diskon"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isPercentage}
                onChange={() => setIsPercentage(!isPercentage)}
              />
              <span>Persentase</span>
            </label>

            <div className="flex gap-2">
              <input
                type="date"
                className="w-1/2 border px-3 py-2 rounded"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="date"
                className="w-1/2 border px-3 py-2 rounded"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Pilih Produk:</label>
              <select
                className="w-full border px-3 py-2 rounded"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="">-- Pilih Produk --</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Pilih Toko:</label>
              <select
                className="w-full border px-3 py-2 rounded"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
              >
                <option value="">-- Pilih Toko --</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
