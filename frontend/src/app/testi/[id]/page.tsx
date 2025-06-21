"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/navbar/navbar/Navbar";
import Sidebarstore from "@/components/navbar/navbar/SidebarAdminStore";
import Footer from "@/components/navbar/navbar/footer";
import { useSession } from "next-auth/react";
import axios from "@/lib/axios";
import { Loader2, PlusCircle } from "lucide-react";
import AddDiscountModal from "@/app/admin-store/discount-management/modal/AddDiscountModal";


interface Discount {
  id: string;
  name: string;
  type: "MANUAL" | "MIN_PURCHASE" | "BUY_ONE_GET_ONE";
  amount: number;
  isPercentage: boolean;
  productId?: string;
  startDate: string;
  endDate: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

function isDiscountActive(endDate: string): boolean {
  return new Date(endDate).getTime() > Date.now();
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DiscountManagementPage() {
  const { data: session, status } = useSession();
  const loadingSession = status === "loading";

  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [productMap, setProductMap] = useState<Record<string, Product>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchDiscounts = async () => {
    if (!session?.accessToken || !session?.user?.id) {
      setError("Token atau storeId tidak ditemukan. Silakan login.");
      return;
    }

    console.log("Session data:", session);

    setIsLoading(true);
    try {
      const { data: discountData } = await axios.get(
        `/discounts/store/${session.user.id}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      console.log("Discount data from axios:", discountData);

      setDiscounts(discountData);

      const productIds = Array.from(
        new Set(discountData.map((d: Discount) => d.productId).filter(Boolean))
      );

      const productResponses: Product[] = await Promise.all(
        productIds.map((id) =>
          axios
            .get(`/product/${id}`, {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            })
            .then((res) => ({
              id: String(id),
              name: String(res.data.name),
              price: Number(res.data.price),
            }))
            .catch(() => ({
              id: String(id),
              name: "Produk tidak ditemukan",
              price: 0,
            }))
        )
      );

      const map: Record<string, Product> = {};
      productResponses.forEach((product) => {
        map[product.id] = product;
      });

      setProductMap(map);
    } catch (err: any) {
      setError(err.response?.data?.error || "Gagal mengambil data diskon.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingSession && session?.user?.id) {
      fetchDiscounts();
    }
  }, [session, loadingSession]);

  const calculateFinalPrice = (discount: Discount): string => {
    if (!discount.productId) return "-";
    const product = productMap[discount.productId];
    if (!product || !product.price) return "-";

    const originalPrice = product.price;
    let finalPrice = originalPrice;

    if (discount.isPercentage) {
      finalPrice = originalPrice - (originalPrice * discount.amount) / 100;
    } else {
      finalPrice = originalPrice - discount.amount;
    }

    return `Rp ${Math.max(finalPrice, 0).toLocaleString("id-ID")}`;
  };

  if (loadingSession) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading session...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center">
        Anda harus login sebagai Store Admin
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex w-full min-h-screen">
        <div className="w-64 bg-gray-100 hidden md:block">
          <Sidebarstore />
        </div>
        <main className="flex-1 p-6 bg-gray-50">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Manajemen Diskon
            </h1>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
            >
              <PlusCircle className="h-5 w-5" /> Tambah Diskon
            </button>
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 mb-4 text-gray-700">
              <Loader2 className="animate-spin h-5 w-5" />
              <span>Memuat diskon...</span>
            </div>
          )}
          {error && <p className="text-red-600 mb-4">{error}</p>}

          <div className="overflow-auto rounded-lg shadow border border-gray-200">
            <table className="min-w-full bg-white">
              <thead className="bg-blue-100 text-gray-700 text-sm font-semibold">
                <tr>
                  <th className="py-3 px-4 text-left border">Nama</th>
                  <th className="py-3 px-4 text-left border">Tipe</th>
                  <th className="py-3 px-4 text-left border">Jumlah</th>
                  <th className="py-3 px-4 text-left border">Produk</th>
                  <th className="py-3 px-4 text-left border">
                    Harga Setelah Diskon
                  </th>
                  <th className="py-3 px-4 text-left border">Periode</th>
                  <th className="py-3 px-4 text-left border">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-800 text-sm">
                {discounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-gray-500">
                      Belum ada diskon
                    </td>
                  </tr>
                ) : (
                  discounts.map((discount) => (
                    <tr key={discount.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 border">{discount.name}</td>
                      <td className="py-3 px-4 border">{discount.type}</td>
                      <td className="py-3 px-4 border">
                        {discount.isPercentage
                          ? `${discount.amount}%`
                          : `Rp ${discount.amount.toLocaleString("id-ID")}`}
                      </td>
                      <td className="py-3 px-4 border">
                        {discount.productId
                          ? productMap[discount.productId]?.name || "..."
                          : "-"}
                      </td>
                      <td className="py-3 px-4 border">
                        {calculateFinalPrice(discount)}
                      </td>
                      <td className="py-3 px-4 border">
                        {formatDate(discount.startDate)} -{" "}
                        {formatDate(discount.endDate)}
                      </td>
                      <td className="py-3 px-4 border">
                        {isDiscountActive(discount.endDate) ? (
                          <span className="text-green-600 font-semibold">
                            Aktif
                          </span>
                        ) : (
                          <span className="text-red-600 font-semibold">
                            Kedaluwarsa
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
      <Footer />

      <AddDiscountModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onDiscountAdded={(newDiscount: Discount) =>
          setDiscounts((prev) => [...prev, newDiscount])
        }
      />
    </>
  );
}
