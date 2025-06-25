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
  imageUrl: string;
  images?: string[];
  category: { name: string };
  stocks: { quantity: number };
  weight: number;
  storeId: string;
  store?: {
    id: string;
    city_id: string;
  };
  discount?: {
    id: string;
    type: "MANUAL" | "MIN_PURCHASE" | "BUY_ONE_GET_ONE";
    amount: number;
    isPercentage: boolean;
    startDate: string;
    endDate: string;
    minPurchase?: number;
    buyQuantity?: number;
    getQuantity?: number;
  } | null;
}

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
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

  const isDiscountActive = (discount: Product["discount"]) => {
    if (!discount) return false;
    const now = new Date();
    return now >= new Date(discount.startDate) && now <= new Date(discount.endDate);
  };

  const canApplyDiscount = () => {
    if (!product?.discount || !isDiscountActive(product.discount)) return false;

    const { type, minPurchase, buyQuantity } = product.discount;

    if (type === "MIN_PURCHASE") return quantity >= (minPurchase || 0);
    if (type === "BUY_ONE_GET_ONE") return quantity >= (buyQuantity || 1);

    return true;
  };

  const calculateFinalPrice = () => {
    if (!product) return 0;
    if (!canApplyDiscount()) return product.price;

    const { isPercentage, amount } = product.discount!;
    return isPercentage
      ? product.price - (product.price * amount) / 100
      : product.price - amount;
  };

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

  const finalPrice = calculateFinalPrice();
  const hasDiscount = finalPrice < product.price;
  const discount = product.discount;
  const eligible = canApplyDiscount();

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
            {hasDiscount ? (
              <>
                <span className="text-2xl font-bold text-green-600">
                  Rp{finalPrice.toLocaleString("id-ID")}
                </span>
                <span className="line-through text-gray-400 text-sm">
                  Rp{product.price.toLocaleString("id-ID")}
                </span>
                <span className="text-sm text-red-500 font-medium">
                  {discount?.isPercentage
                    ? `-${discount.amount}%`
                    : `-Rp${discount?.amount.toLocaleString("id-ID")}`}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-gray-900">
                Rp{product.price.toLocaleString("id-ID")}
              </span>
            )}
          </div>

          {/* Info Diskon */}
          {discount && isDiscountActive(discount) && !eligible && (
            <p className="text-sm text-red-600 italic">
              {discount.type === "MIN_PURCHASE" &&
                `Diskon aktif jika beli minimal ${discount.minPurchase} item.`}
              {discount.type === "BUY_ONE_GET_ONE" &&
                `Promo Beli ${discount.buyQuantity}, Gratis ${discount.getQuantity}.`}
              <br />
            </p>
          )}

          {discount?.type === "BUY_ONE_GET_ONE" &&
            isDiscountActive(discount) &&
            eligible && (
              <p className="text-sm text-yellow-600 italic">
                Promo: Beli {discount.buyQuantity} Gratis {discount.getQuantity}
              </p>
            )}

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

            <button
              className="w-full sm:w-auto bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition"
            >
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
                  price: finalPrice,
                  imageUrl: selectedImage,
                  quantity,
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
