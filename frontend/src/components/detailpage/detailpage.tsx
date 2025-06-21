"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "@/lib/axios";
import { Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  finalPrice?: number;
  discount?: {
    id: string;
    amount: number;
    isPercentage: boolean;
    startDate: string;
    endDate: string;
  } | null;
  imageUrl: string;
  images?: string[];
  category: {
    name: string;
  };
  stocks: {
    quantity: number;
  };
  weight: number; // ✅ tambahkan jika tersedia
  storeId: string;
  store?: {
    id: string;
    city_id: string;
  };
}

const availableColors = ["#4B4A40", "#2C2D3C", "#3D4C48"];
const availableSizes = ["Small", "Medium", "Large", "X-Large"];

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>(availableColors[0]);
  const [selectedSize, setSelectedSize] = useState<string>("Large");
  const [quantity, setQuantity] = useState<number>(1);

  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/product/${id}`);
        setProduct(response.data);
        setSelectedImage(response.data.imageUrl);
      } catch (err) {
        setError("Failed to load product details");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="animate-spin h-10 w-10" />
        <span>Loading product...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500">{error || "Product not found."}</p>
      </div>
    );
  }

  return (
    <section className="w-full px-4 py-10 lg:py-16 bg-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* LEFT - Images */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md">
            <img
              src={selectedImage || "/default-product-image.png"}
              alt="Selected product"
              className="w-full rounded-xl shadow-lg object-cover"
            />
          </div>
          <div className="flex gap-4 mt-4">
            {product.images?.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`thumb-${i}`}
                className={`w-20 h-20 object-cover rounded-md border-2 cursor-pointer ${
                  selectedImage === img ? "border-black" : "border-gray-300"
                }`}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
        </div>

        {/* RIGHT - Info */}
        <div className="space-y-6">
          <h1 className="text-3xl font-extrabold text-gray-900">{product.name}</h1>
          <p className="text-gray-700">{product.description}</p>
          <p className="text-gray-500 text-sm">{product.category.name}</p>

          {/* Price */}
          <div className="flex items-center gap-4">
            {product.finalPrice !== undefined && product.finalPrice < product.price ? (
              <>
                <span className="text-2xl font-bold text-green-600">
                  Rp{product.finalPrice.toLocaleString()}
                </span>
                <span className="line-through text-gray-400 text-sm">
                  Rp{product.price.toLocaleString()}
                </span>
                <span className="text-sm text-red-500 font-medium">
                  {product.discount && product.discount.isPercentage
                    ? `-${product.discount.amount}%`
                    : product.discount
                    ? `-Rp${product.discount.amount.toLocaleString()}`
                    : ""}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-gray-900">
                Rp{product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Quantity & Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
            <div className="flex items-center border rounded-md px-3 py-2 w-fit">
              <button
                className="text-xl font-bold px-2"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                -
              </button>
              <span className="px-2">{quantity}</span>
              <button
                className="text-xl font-bold px-2"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>

            <button className="w-full sm:w-auto bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition">
              Add to Cart
            </button>

            <button
              className="w-full sm:w-auto border px-6 py-3 rounded-md hover:bg-gray-200 transition"
              onClick={() => {
                if (!product.store?.city_id) {
                  alert("Lokasi asal toko tidak ditemukan.");
                  return;
                }

                const checkoutData = {
                  id: product.id,
                  name: product.name,
                  price: product.finalPrice ?? product.price,
                  imageUrl: selectedImage,
                  quantity,
                  color: selectedColor,
                  size: selectedSize,
                  storeId: product.store?.id ?? "",
                  weight: product.weight ?? 1000, 
                  originCityId: product.store.city_id, 
                };

                localStorage.setItem("checkout", JSON.stringify(checkoutData));
                window.location.href = "/checkout";
              }}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
