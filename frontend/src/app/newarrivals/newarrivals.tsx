"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import axios from "@/lib/axios";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

export default function Newarrivals() {
  const { data: session, status } = useSession();
  const loadingSession = status === "loading";

  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStoreId, setSelectedStoreId] = useState("all");

  useEffect(() => {
    if (!session?.accessToken) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productRes, storeRes] = await Promise.all([
          axios.get("/product2/new-arrivals"),
          axios.get("/store", {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }),
        ]);

        setProducts(productRes.data);
        setStores(storeRes.data.stores ?? storeRes.data);
      } catch (err) {
        setError("Failed to load data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const uniqueCategories = useMemo(() => {
    const categories = products.map((p: any) => p.category?.name || "Unknown");
    return ["all", ...Array.from(new Set(categories))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      const matchName = product.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        selectedCategory === "all" || product.category?.name === selectedCategory;
      const matchStore =
        selectedStoreId === "all" || product.store?.id === selectedStoreId;

      return matchName && matchCategory && matchStore;
    });
  }, [products, search, selectedCategory, selectedStoreId]);

  if (loadingSession || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="animate-spin h-10 w-10" />
        <span>Loading products...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-red-500">
        You must be logged in to view products.
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

  return (
    <section className="w-full bg-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6">ALL PRODUCTS</h2>

        {/* FILTER */}
        <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-8">
          <input
            type="text"
            placeholder="Search product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-4 py-2 rounded-md w-full md:w-1/3"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border px-4 py-2 rounded-md w-full md:w-1/4"
          >
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>

          <select
            value={selectedStoreId}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="border px-4 py-2 rounded-md w-full md:w-1/4"
          >
            <option value="all">All Stores</option>
            {stores.map((store: any) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        {/* PRODUCT LIST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {filteredProducts.map((product: any) => {
            const totalStock =
              Array.isArray(product.stocks)
                ? product.stocks.reduce((sum: number, s: any) => sum + (s.quantity || 0), 0)
                : 0;

            return (
              <div
                key={product.id}
                className="border rounded-lg p-4 cursor-pointer shadow-sm hover:shadow-md transition"
              >
                <Link href={`/detail/${product.id}`}>
                  <img
                    src={product.imageUrl || "/default-product-image.png"}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </Link>
                <div className="mt-4">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-600 truncate">
                    {product.description}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-gray-800">
                    ${product.price}
                  </p>
                  <p className="text-sm text-gray-500">
                    Stok: <span className="font-medium">{totalStock}</span>
                  </p>
                  <p className="text-xs text-gray-500 italic">
                    {product.category?.name} • {product.store?.name ?? "No Store"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="mt-10 text-center text-gray-500">No products found.</div>
        )}
      </div>
    </section>
  );
}
