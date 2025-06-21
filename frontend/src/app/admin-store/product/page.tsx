"use client"

import React, { useEffect, useState } from "react";
import Navbar from "@/components/navbar/navbar/Navbar";
import Sidebarstore from "@/components/navbar/navbar/SidebarAdminStore";
import Footer from "@/components/navbar/navbar/footer";
import { useSession } from "next-auth/react";
import axios from "@/lib/axios";
import { Loader2 } from "lucide-react";

interface Store {
  id: string;
  name: string;
  address: string;
}

interface Stock {
  id: string;
  quantity: number;
  store: Store;
}

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: Category;
  stocks: Stock[];
  status?: "active" | "inactive"; // bisa ditambahkan jika ada di DB
}

export default function StoreProductPage() {
  const { data: session, status } = useSession();
  const loadingSession = status === "loading";

  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (loadingSession) return;

    if (!session?.accessToken) {
      setError("Token tidak ditemukan. Silakan login terlebih dahulu.");
      return;
    }

    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get("/product", {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        setProducts(response.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || err.message || "Gagal mengambil data produk."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [session, loadingSession]);

  if (loadingSession) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>Loading session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>Anda harus login dulu.</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex h-screen w-full">
        <div className="w-64 bg-gray-100 hidden md:block">
          <Sidebarstore />
        </div>
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          <h1 className="text-3xl font-bold mb-6">Produk Toko Anda</h1>

          {isLoading && (
            <div className="flex items-center gap-2 mb-4 text-gray-700">
              <Loader2 className="animate-spin h-5 w-5" />
              <span>Memuat produk...</span>
            </div>
          )}
          {error && <p className="text-red-600 mb-4">{error}</p>}

          <table className="min-w-full bg-white rounded shadow overflow-x-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border">Nama Produk</th>
                <th className="py-2 px-4 border">Deskripsi</th>
                <th className="py-2 px-4 border">Kategori</th>
                <th className="py-2 px-4 border">Harga (Rp)</th>
                <th className="py-2 px-4 border">Stok per Toko</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    Belum ada produk
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 align-top">
                    <td className="border px-4 py-2">{product.name}</td>
                    <td className="border px-4 py-2">{product.description}</td>
                    <td className="border px-4 py-2">{product.category?.name || "-"}</td>
                    <td className="border px-4 py-2">
                      {product.price.toLocaleString("id-ID")}
                    </td>
                    <td className="border px-4 py-2">
                      {product.stocks.length === 0 ? (
                        "-"
                      ) : (
                        <ul className="list-disc list-inside">
                          {product.stocks.map((stock) => (
                            <li key={stock.id}>
                              <strong>{stock.store.name}:</strong> {stock.quantity}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </main>
      </div>
      <Footer />
    </>
  );
}
