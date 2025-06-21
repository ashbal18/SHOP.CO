"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/navbar/navbar/Navbar";
import Sidebarstore from "@/components/navbar/navbar/SidebarAdminStore";
import Footer from "@/components/navbar/navbar/footer";
import { useSession } from "next-auth/react";
import axios from "@/lib/axios";
import { Loader2, PlusCircle } from "lucide-react";
import AddDiscountModal from "./modal/AddDiscountModal";
import EditDiscountModal from "./modal/EditDiscountModal"; 
import DeleteConfirmModal from "./modal/DeleteConfirmModal";



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
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState<Discount | null>(
    null
  );

  const fetchDiscounts = async () => {
    if (!session?.accessToken || !session?.user?.id) {
      setError("Token atau storeId tidak ditemukan. Silakan login.");
      return;
    }

    setIsLoading(true);
    try {
      const { data: discountData } = await axios.get(
        `/discounts/store/${session.user.storeId}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

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

  const handleEdit = (discount: Discount) => {
    setSelectedDiscount(discount);
    setShowEditModal(true);
  };

  const handleDelete = (discount: Discount) => {
    setDiscountToDelete(discount);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!discountToDelete) return;

    try {
      await axios.delete(`/discounts/${discountToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      fetchDiscounts();
    } catch (error: any) {
      alert(error?.response?.data?.error || "Gagal menghapus diskon.");
    }
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
                  <th className="py-3 px-4 border">Nama</th>
                  <th className="py-3 px-4 border">Tipe</th>
                  <th className="py-3 px-4 border">Jumlah</th>
                  <th className="py-3 px-4 border">Produk</th>
                  <th className="py-3 px-4 border">Harga Normal</th>
                  <th className="py-3 px-4 border">Harga Setelah Diskon</th>
                  <th className="py-3 px-4 border">Periode</th>
                  <th className="py-3 px-4 border">Status</th>
                  <th className="py-3 px-4 border">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-gray-800 text-sm">
                {discounts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-6 text-gray-500">
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
                        {discount.productId &&
                        productMap[discount.productId]?.price
                          ? `Rp ${productMap[
                              discount.productId
                            ].price.toLocaleString("id-ID")}`
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
                      <td className="py-3 px-4 border space-x-2">
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() => handleEdit(discount)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => handleDelete(discount)}
                        >
                          Hapus
                        </button>
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
        onDiscountAdded={() => {
          fetchDiscounts();
          setShowModal(false);
        }}
      />

      {showEditModal && selectedDiscount && (
        <EditDiscountModal
          isOpen={showEditModal}
          discount={selectedDiscount}
          onClose={() => setShowEditModal(false)}
          onDiscountUpdated={() => {
            fetchDiscounts();
            setShowEditModal(false);
          }}
        />
      )}

      {showDeleteModal && discountToDelete && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          discountName={discountToDelete.name}
          title="Konfirmasi Hapus Diskon"
          message={`Apakah Anda yakin ingin menghapus diskon "${discountToDelete.name}"?`}
        />
      )}
    </>
  );
}
