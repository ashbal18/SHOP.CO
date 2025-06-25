"use client";

import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios";
import axios from "axios"; // untuk `isAxiosError`

interface Product {
  id: string;
  name: string;
  storeId: string;
}

interface Store {
  id: string;
  name: string;
}

type DiscountType = "MANUAL" | "MIN_PURCHASE" | "BUY_ONE_GET_ONE";

interface Discount {
  id: string;
  name: string;
  type: DiscountType;
  amount: number;
  isPercentage: boolean;
  startDate: string;
  endDate: string;
  productId: string;
  storeId: string;
}

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER" | "SUPERADMIN";
  storeId?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDiscountAdded: (discount: Discount) => void;
}

interface DiscountPayload {
  name: string;
  type: DiscountType;
  amount: number;
  isPercentage: boolean;
  startDate: string;
  endDate: string;
  productId: string;
  storeId: string;
  minPurchase?: number;
  maxDiscount?: number;
  buyQuantity?: number;
  getQuantity?: number;
}

export default function AddDiscountModal({
  isOpen,
  onClose,
  onDiscountAdded,
}: Props) {
  const { data: session } = useSession();
  const user = session?.user as SessionUser;

  const [name, setName] = useState("");
  const [type, setType] = useState<DiscountType>("MANUAL");
  const [amount, setAmount] = useState<number>(0);
  const [isPercentage, setIsPercentage] = useState(false);
  const [minPurchase, setMinPurchase] = useState<number>(0);
  const [maxDiscount, setMaxDiscount] = useState<number>(0);
  const [buyQuantity, setBuyQuantity] = useState<number>(0);
  const [getQuantity, setGetQuantity] = useState<number>(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [storeId, setStoreId] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch toko
  useEffect(() => {
    const accessToken = session?.accessToken;
    if (!accessToken || !isOpen) return;

    const fetchStores = async () => {
      try {
        const res = await axiosInstance.get<Store[]>("/store", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const storeData = res.data || [];
        setStores(storeData);

        if (user?.role === "ADMIN" && user?.storeId) {
          setStoreId(user.storeId);
        }
      } catch (err) {
        console.error("Gagal mengambil toko:", err);
      }
    };

    fetchStores();
  }, [isOpen, session, user]);

  // Fetch produk toko
  useEffect(() => {
    const accessToken = session?.accessToken;
    if (!accessToken || !storeId) return;

    const fetchProducts = async () => {
      try {
        const res = await axiosInstance.get<Product[]>(`/product/store/${storeId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setProducts(res.data || []);
      } catch (err) {
        console.error("Gagal mengambil produk:", err);
      }
    };

    fetchProducts();
  }, [storeId, session]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const payload: DiscountPayload = {
      name,
      type,
      amount,
      isPercentage,
      startDate,
      endDate,
      productId: selectedProduct,
      storeId: storeId || user?.storeId || "",
    };

    if (type === "MIN_PURCHASE") {
      payload.minPurchase = minPurchase;
      payload.maxDiscount = maxDiscount;
    }

    if (type === "BUY_ONE_GET_ONE") {
      payload.buyQuantity = buyQuantity;
      payload.getQuantity = getQuantity;
    }

    try {
      const res = await axiosInstance.post<Discount>("/discounts", payload, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      onDiscountAdded(res.data);
      onClose();
      resetForm();
    } catch (err: unknown) {
      console.error("Gagal membuat diskon:", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Terjadi kesalahan saat menyimpan.");
      } else {
        setError("Terjadi kesalahan tidak diketahui.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setAmount(0);
    setIsPercentage(false);
    setMinPurchase(0);
    setMaxDiscount(0);
    setBuyQuantity(0);
    setGetQuantity(0);
    setStartDate("");
    setEndDate("");
    setSelectedProduct("");
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
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
              onChange={(e) => setType(e.target.value as DiscountType)}
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

            {type === "MIN_PURCHASE" && (
              <>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Minimal Pembelian (Rp)"
                  value={minPurchase}
                  onChange={(e) => setMinPurchase(Number(e.target.value))}
                />
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Diskon Maksimal (Rp)"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(Number(e.target.value))}
                />
              </>
            )}

            {type === "BUY_ONE_GET_ONE" && (
              <>
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Jumlah Beli"
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(Number(e.target.value))}
                />
                <input
                  type="number"
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Jumlah Gratis"
                  value={getQuantity}
                  onChange={(e) => setGetQuantity(Number(e.target.value))}
                />
              </>
            )}

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
