"use client";

import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import axios from "@/lib/axios";
import { useSession } from "next-auth/react";

type DiscountType = "MANUAL" | "MIN_PURCHASE" | "BUY_ONE_GET_ONE";

interface Discount {
  id: string;
  name: string;
  amount: number;
  isPercentage: boolean;
  startDate: string;
  endDate: string;
  type: DiscountType;
  productId: string;
  minPurchase?: number | null;
  maxDiscount?: number | null;
  buyQuantity?: number | null;
  getQuantity?: number | null;
}

interface EditDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  discount: Discount;
  onDiscountUpdated: () => void;
}

type DiscountPayload = {
  name: string;
  type: DiscountType;
  amount: number;
  isPercentage: boolean;
  productId: string;
  startDate: string;
  endDate: string;
  minPurchase?: number | null;
  maxDiscount?: number | null;
  buyQuantity?: number | null;
  getQuantity?: number | null;
};

export default function EditDiscountModal({
  isOpen,
  onClose,
  discount,
  onDiscountUpdated,
}: EditDiscountModalProps) {
  const { data: session } = useSession();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [isPercentage, setIsPercentage] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState<DiscountType>("MANUAL");
  const [productId, setProductId] = useState("");

  const [minPurchase, setMinPurchase] = useState<number | null>(null);
  const [maxDiscount, setMaxDiscount] = useState<number | null>(null);
  const [buyQuantity, setBuyQuantity] = useState<number | null>(null);
  const [getQuantity, setGetQuantity] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (discount) {
      setName(discount.name || "");
      setAmount(discount.amount || 0);
      setIsPercentage(discount.isPercentage || false);
      setStartDate(discount.startDate || "");
      setEndDate(discount.endDate || "");
      setType(discount.type || "MANUAL");
      setProductId(discount.productId || "");

      setMinPurchase(discount.minPurchase ?? null);
      setMaxDiscount(discount.maxDiscount ?? null);
      setBuyQuantity(discount.buyQuantity ?? null);
      setGetQuantity(discount.getQuantity ?? null);
    }
  }, [discount]);

  // Reset field opsional saat type berubah
  useEffect(() => {
    setMinPurchase(null);
    setMaxDiscount(null);
    setBuyQuantity(null);
    setGetQuantity(null);
  }, [type]);

  const handleUpdate = async () => {
    if (!name || !startDate || !endDate || !productId) {
      alert("Mohon lengkapi semua data utama.");
      return;
    }

    if (type === "MIN_PURCHASE" && (minPurchase == null || maxDiscount == null)) {
      alert("Isi minimal pembelian dan maksimum diskon.");
      return;
    }

    if (type === "BUY_ONE_GET_ONE" && (buyQuantity == null || getQuantity == null)) {
      alert("Isi jumlah beli dan jumlah gratis.");
      return;
    }

    setLoading(true);
    try {
      const payload: DiscountPayload = {
        name,
        type,
        amount,
        isPercentage,
        productId,
        startDate,
        endDate,
      };

      if (type === "MIN_PURCHASE") {
        payload.minPurchase = minPurchase;
        payload.maxDiscount = maxDiscount;
      }

      if (type === "BUY_ONE_GET_ONE") {
        payload.buyQuantity = buyQuantity;
        payload.getQuantity = getQuantity;
      }

      await axios.put(`/discounts/${discount.id}`, payload, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      onDiscountUpdated();
      onClose();
    } catch (error) {
      console.error("Gagal update diskon", error);
      alert("Terjadi kesalahan saat memperbarui diskon.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative z-10">
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800">
            <X className="h-5 w-5" />
          </button>

          <Dialog.Title className="text-lg font-bold mb-4">Edit Diskon</Dialog.Title>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Nama Diskon</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Tipe Diskon</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DiscountType)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
              >
                <option value="MANUAL">Manual</option>
                <option value="MIN_PURCHASE">Minimal Pembelian</option>
                <option value="BUY_ONE_GET_ONE">Beli Satu Gratis Satu</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Jumlah</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPercentage}
                onChange={(e) => setIsPercentage(e.target.checked)}
              />
              <label>Diskon dalam bentuk persentase</label>
            </div>

            <div>
              <label className="block text-sm font-medium">Tanggal Mulai</label>
              <input
                type="date"
                value={startDate?.slice(0, 10)}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Tanggal Berakhir</label>
              <input
                type="date"
                value={endDate?.slice(0, 10)}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
              />
            </div>

            {type === "MIN_PURCHASE" && (
              <>
                <div>
                  <label className="block text-sm font-medium">Minimal Pembelian</label>
                  <input
                    type="number"
                    value={minPurchase ?? ""}
                    onChange={(e) => setMinPurchase(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Maksimum Diskon</label>
                  <input
                    type="number"
                    value={maxDiscount ?? ""}
                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                  />
                </div>
              </>
            )}

            {type === "BUY_ONE_GET_ONE" && (
              <>
                <div>
                  <label className="block text-sm font-medium">Jumlah Beli</label>
                  <input
                    type="number"
                    value={buyQuantity ?? ""}
                    onChange={(e) => setBuyQuantity(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Jumlah Gratis</label>
                  <input
                    type="number"
                    value={getQuantity ?? ""}
                    onChange={(e) => setGetQuantity(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                  />
                </div>
              </>
            )}

            <button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
