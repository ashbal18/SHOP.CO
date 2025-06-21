"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import axios from "@/lib/axios";
import { useSession } from "next-auth/react";
import AddCategoryModal from "./modal/AddCategoryModal";
import Navbar from "@/components/navbar/navbar/Navbar";
import Sidebarsup from "@/components/navbar/navbar/Sidebarsup";
import Footer from "@/components/navbar/navbar/footer";
import AddProductModal from "./modal/AddProductModal";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  imageUrl?: string;
  rating?: number;
  price: number;
  oldPrice?: number;
  categoryId: string;
}

interface Store {
  id: string;
  name: string;
}

export default function TopSellingSection() {
  const { data: session, status } = useSession();
  const token = session?.accessToken || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // State untuk filter kategori
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const [prodRes, catRes, storeRes] = await Promise.all([
          axios.get<Product[]>("/product/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get<Category[]>("/category", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get<Store[]>("/store", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
        setStores(storeRes.data);
      } catch (err: any) {
        setError("Gagal memuat data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleAddCategory = (newCategory: Category) => {
    setCategories((prev) => [...prev, newCategory]);
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [...prev, newProduct]);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="animate-spin h-10 w-10" />
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Filter produk berdasarkan kategori jika ada yang dipilih
  const filteredProducts = selectedCategoryId
    ? products.filter((p) => p.categoryId === selectedCategoryId)
    : products;

  return (
    <>
      <Navbar />
      <div className="flex w-full min-h-screen">
        <div className="w-64 bg-gray-100 hidden md:block">
          <Sidebarsup />
        </div>
        <main className="flex-1 p-8 bg-white overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-extrabold text-gray-900">TOP SELLING</h2>
              <div className="space-x-4">
                <button
                  onClick={() => setIsAddCategoryOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  + Tambah Kategori
                </button>
                <button
                  onClick={() => setIsAddProductOpen(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  + Tambah Produk
                </button>
              </div>
            </div>

            {/* Filter Kategori */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Filter by Category</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className={`px-4 py-2 rounded ${
                    selectedCategoryId === null
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={`px-4 py-2 rounded ${
                      selectedCategoryId === category.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-8">
              {filteredProducts.length === 0 ? (
                <p className="text-center col-span-full">Tidak ada produk untuk kategori ini.</p>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <Link href={`/detail/${product.id}`}>
                      <img
                        src={product.imageUrl || "/default-product-image.png"}
                        alt={product.name}
                        className="w-full h-auto rounded-lg cursor-pointer"
                      />
                    </Link>
                    <div className="mt-4">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                        <span className="ml-2 text-gray-500">({product.rating || 0})</span>
                      </div>
                      <p className="mt-2 text-xl font-semibold text-gray-800">
                        ${product.price.toLocaleString()}
                        {product.oldPrice && (
                          <span className="line-through text-red-500 ml-2">
                            ${product.oldPrice.toLocaleString()}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 text-center">
              <button className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-300">
                View All
              </button>
            </div>
          </div>
        </main>
      </div>
      <Footer />

      {/* Modals */}
      <AddCategoryModal
        open={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onAdd={handleAddCategory}
      />

      <AddProductModal
        open={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onAdd={handleAddProduct}
        categories={categories}
        stores={stores}
        token={token}
      />
    </>
  );
}
