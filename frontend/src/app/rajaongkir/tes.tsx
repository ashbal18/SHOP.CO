"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import axios from "@/lib/axios";
import { useSession } from "next-auth/react";

interface CheckoutProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  color: string;
  size: string;
}

interface Address {
  address_id: string;
  address_name: string;
  address: string;
  city: string;
  province: string;
  is_primary: boolean;
  city_id?: string;
}

interface Reward {
  points: { id: string; amount: number; expiredAt: string }[];
  voucher?: {
    id: string;
    code: string;
    percentage: number;
    maxDiscount: number;
    expiredAt: string;
  };
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const [product, setProduct] = useState<CheckoutProduct | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [reward, setReward] = useState<Reward | null>(null);
  const [usePoints, setUsePoints] = useState(true);
  const [useVoucher, setUseVoucher] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingData, setShippingData] = useState<any>(null);
  const [selectedShippingOption, setSelectedShippingOption] = useState<any>(null);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [shippingLoading, setShippingLoading] = useState(false);

  const originCityId = "501"; // Kota asal tetap (misalnya Padang)

  useEffect(() => {
    const fetchData = async () => {
      const data = localStorage.getItem("checkout");
      if (data) setProduct(JSON.parse(data));

      if (session?.accessToken) {
        try {
          const [addressRes, rewardRes] = await Promise.all([
            axios.get("/address", {
              headers: { Authorization: `Bearer ${session.accessToken}` },
            }),
            axios.get("/rewards", {
              headers: { Authorization: `Bearer ${session.accessToken}` },
            }),
          ]);

          const addrs: Address[] = addressRes.data.addresses ?? addressRes.data;
          setAddresses(addrs);
          const primary = addrs.find((a) => a.is_primary);
          const selectedId = primary?.address_id || addrs[0]?.address_id || "";
          setSelectedAddressId(selectedId);
          setReward(rewardRes.data);
        } catch (err) {
          console.error("Gagal mengambil data:", err);
        }
      }

      setIsLoading(false);
    };

    fetchData();
  }, [session]);

  const fetchShippingCost = async (receiver_city_id: string) => {
    if (!originCityId || !receiver_city_id) return;
    setShippingLoading(true);
    try {
      const res = await axios.get("/rajaongkir/cost", {
        params: {
          shipper_destination_id: originCityId,
          receiver_destination_id: receiver_city_id,
          weight: product?.quantity || 1,
          item_value: product?.price || 0,
        },
      });
      setShippingData(res.data.data);
    } catch (err) {
      console.error("❌ Gagal hitung ongkir:", err);
      setShippingData(null);
    } finally {
      setShippingLoading(false);
    }
  };

  useEffect(() => {
    const selected = addresses.find((a) => a.address_id === selectedAddressId);
    if (selected?.city_id) {
      fetchShippingCost(selected.city_id);
    }
  }, [selectedAddressId, addresses]);

  const handleConfirm = () => {
    if (!selectedAddressId || !product || !selectedShippingOption) {
      alert("Pilih alamat, produk, dan opsi pengiriman.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      alert("Order berhasil dikonfirmasi ✅");
      localStorage.removeItem("checkout");
      setIsSubmitting(false);
    }, 1500);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  }

  if (!session || !session.accessToken) {
    return <p className="text-center mt-20">Silakan login untuk melanjutkan checkout.</p>;
  }

  if (!product) {
    return <p className="text-center mt-20">Produk tidak ditemukan di keranjang checkout.</p>;
  }

  const subtotal = product.price * product.quantity;
  const totalPoints = reward?.points?.reduce((acc, p) => acc + p.amount, 0) || 0;
  const pointDiscount = usePoints ? Math.min(subtotal, totalPoints * 1000) : 0;
  const voucher = reward?.voucher;
  const voucherDiscount =
    useVoucher && voucher
      ? Math.min((voucher.percentage / 100) * subtotal, voucher.maxDiscount)
      : 0;
  const totalDiscount = pointDiscount + voucherDiscount;
  const finalTotal = subtotal - totalDiscount;

  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
        {/* Alamat */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Pilih Alamat Pengiriman</h2>
          {addresses.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada alamat tersimpan.</p>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr.address_id}
                  className={`flex items-start justify-between border rounded-lg p-4 cursor-pointer gap-4 ${
                    selectedAddressId === addr.address_id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="radio"
                      name="address"
                      value={addr.address_id}
                      checked={selectedAddressId === addr.address_id}
                      onChange={() => setSelectedAddressId(addr.address_id)}
                      className="mt-1 accent-blue-600"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800">{addr.address_name}</span>
                      <span className="text-sm text-gray-500">
                        {addr.address}, {addr.city}, {addr.province}
                      </span>
                      {addr.is_primary && (
                        <span className="text-xs text-green-600 font-medium mt-1">Alamat Utama</span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Produk */}
        <div className="flex flex-col sm:flex-row gap-4">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-32 h-32 object-cover rounded-md"
          />
          <div className="flex-1 space-y-1">
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-sm text-gray-500">Color: {product.color}</p>
            <p className="text-sm text-gray-500">Size: {product.size}</p>
            <p className="text-sm text-gray-500">Quantity: {product.quantity}</p>
            <p className="text-sm text-gray-500">
              Price: Rp{product.price.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Reward */}
        {reward && (totalPoints > 0 || voucher) && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Gunakan Reward</h3>
            {totalPoints > 0 && (
              <div
                className={`border p-4 rounded-lg cursor-pointer ${
                  usePoints ? "bg-blue-50 border-blue-500" : "border-gray-200"
                }`}
                onClick={() => setUsePoints(!usePoints)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-blue-700">Poin</p>
                    <p className="text-sm">
                      Potongan Rp{pointDiscount.toLocaleString()} dari {totalPoints} poin
                    </p>
                  </div>
                  <input type="checkbox" checked={usePoints} readOnly className="accent-blue-600" />
                </div>
              </div>
            )}
            {voucher && (
              <div
                className={`border p-4 rounded-lg cursor-pointer ${
                  useVoucher ? "bg-green-50 border-green-500" : "border-gray-200"
                }`}
                onClick={() => setUseVoucher(!useVoucher)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-green-700">Voucher {voucher.code}</p>
                    <p className="text-sm">
                      {voucher.percentage}% hingga Rp{voucher.maxDiscount.toLocaleString()} (Diskon Rp
                      {voucherDiscount.toLocaleString()})
                    </p>
                  </div>
                  <input type="checkbox" checked={useVoucher} readOnly className="accent-green-600" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Opsi Pengiriman */}
        {shippingData && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Opsi Pengiriman</h3>
            {["calculate_reguler", "calculate_cargo", "calculate_instant"].map(
              (type) =>
                shippingData[type]?.length > 0 && (
                  <div key={type}>
                    <h4 className="text-md font-semibold capitalize mb-2">
                      {type.replace("calculate_", "")}
                    </h4>
                    <div className="grid gap-2">
                      {shippingData[type].map((option: any, index: number) => {
                        const optionId = `${type}-${index}`;
                        const isSelected = selectedShippingOption?.id === optionId;

                        return (
                          <label
                            key={optionId}
                            className={`flex items-center justify-between border p-3 rounded-md cursor-pointer ${
                              isSelected ? "border-blue-500 bg-blue-50" : "bg-gray-50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="shipping_option"
                                checked={isSelected}
                                onChange={() => {
                                  setSelectedShippingOption({ ...option, id: optionId });
                                  setShippingCost(option.shipping_cost_net);
                                }}
                                className="accent-blue-600 mt-1"
                              />
                              <div>
                                <div className="font-medium">
                                  {option.shipping_name} - {option.service_name}
                                </div>
                                <div>
                                  Ongkir: Rp{option.shipping_cost_net.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Estimasi: {option.etd || "-"}
                                </div>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )
            )}
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between text-lg font-medium">
          <span>Subtotal:</span>
          <span>Rp{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-lg font-medium text-red-600">
          <span>Diskon:</span>
          <span>-Rp{totalDiscount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-lg font-medium">
          <span>Ongkir:</span>
          <span>{shippingCost ? `Rp${shippingCost.toLocaleString()}` : "-"}</span>
        </div>
        <div className="flex justify-between text-xl font-bold border-t pt-3">
          <span>Total Bayar:</span>
          <span>Rp{(finalTotal + shippingCost).toLocaleString()}</span>
        </div>

        {/* Tombol Konfirmasi */}
        <button
          className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
          onClick={handleConfirm}
          disabled={isSubmitting || !selectedShippingOption}
        >
          {isSubmitting ? "Processing..." : "Confirm and Pay"}
        </button>
      </div>
    </section>
  );
}
