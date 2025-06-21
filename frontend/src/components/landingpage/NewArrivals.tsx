"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "@/lib/axios";
import { Loader2 } from "lucide-react";

type Product = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  finalPrice?: number;
  discount?: {
    id: string;
    amount: number;
    isPercentage: boolean;
    startDate: string;
    endDate: string;
  } | null;
  category?: { name: string };
  store: {
    id: string;
    name: string;
    address: string;
  };
};

export default function NewArrivalsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/product2/new-arrivals");
        setProducts(response.data);
      } catch (err) {
        setError("Failed to load top selling products");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="animate-spin h-10 w-10" />
        <span>Loading products...</span>
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

  const productsToShow = showAll ? products : products.slice(0, 4);

  return (
    <section className="w-full bg-white py-12 px-6">
      <div className="max-w-7xl mx-auto mt-16">
        <h2 className="text-3xl font-extrabold text-gray-900">New Arrivals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-8">
          {productsToShow.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
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
                  {product.description || "No description available"}
                </p>

                {product.finalPrice !== undefined && product.finalPrice < product.price ? (
                  <>
                    <p className="mt-2 text-xl font-semibold text-green-600">
                      Rp{product.finalPrice.toLocaleString()}
                    </p>
                    <p className="text-sm text-red-500 line-through">
                      Rp{product.price.toLocaleString()}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-xl font-semibold text-gray-800">
                    Rp{product.price.toLocaleString()}
                  </p>
                )}

                {product.discount && (
                  <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded">
                    {product.discount.isPercentage
                      ? `-${product.discount.amount}%`
                      : `-$${product.discount.amount.toLocaleString()}`}
                  </span>
                )}

                <p className="text-sm text-gray-500 mt-1 italic">
                  {product.category?.name || "Uncategorized"} •{" "}
                  {product.store?.name ?? "No Store"}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
            <Link
            href="/newarrivals"
            className="inline-block px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-300"
            >
            View All New Arrivals
            </Link>
        </div>
      </div>
    </section>
  );
}
