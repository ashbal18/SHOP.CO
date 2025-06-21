"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import axios from "@/lib/axios";

interface CheckoutProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  color: string;
  size: string;
  weight: number;
  storeId: string;
  originCityId: string;
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
  const [originCityId, setOriginCityId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = localStorage.getItem("checkout");
      if (data) {
        const parsed = JSON.parse(data);
        setProduct(parsed);
        setOriginCityId(parsed.originCityId ?? null);
      }

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
    if (!originCityId || !receiver_city_id || !product) return;
    try {
      const res = await axios.get("/rajaongkir/cost", {
        params: {
          shipper_destination_id: originCityId,
          receiver_destination_id: receiver_city_id,
          weight: product.quantity * 1000,
          item_value: product.price,
        },
      });
      setShippingData(res.data.data);
    } catch (err) {
      console.error("❌ Gagal hitung ongkir:", err);
      setShippingData(null);
    }
  };

  useEffect(() => {
    const selected = addresses.find((a) => a.address_id === selectedAddressId);
    if (selected?.city_id) fetchShippingCost(selected.city_id);
  }, [selectedAddressId, addresses, product]);

  const handleConfirm = async () => {
    if (!selectedAddressId || !product || !selectedShippingOption) {
      alert("Pilih alamat, produk, dan opsi pengiriman.");
      return;
    }

    setIsSubmitting(true);

    const subtotal = product.price * product.quantity;
    const totalPoints = reward?.points.reduce((a, p) => a + p.amount, 0) || 0;
    const pointDiscount = usePoints ? Math.min(subtotal, totalPoints * 1000) : 0;
    const voucher = reward?.voucher;
    const voucherDiscount = useVoucher && voucher
      ? Math.min((voucher.percentage / 100) * subtotal, voucher.maxDiscount)
      : 0;
    const totalDiscount = pointDiscount + voucherDiscount;
    const finalTotal = subtotal - totalDiscount;

    try {
      const payload = {
        storeId: product.storeId,
        shippingAddress: selectedAddressId,
        totalAmount: finalTotal + shippingCost,
        voucherId: useVoucher && voucher ? voucher.id : null,
        usePoints,
        shippingCost,
        shippingOption: {
          shippingName: selectedShippingOption.shipping_name,
          serviceName: selectedShippingOption.service_name,
          etd: selectedShippingOption.etd,
        },
        items: [
          {
            productId: product.id,
            quantity: product.quantity,
            price: product.price,
          },
        ],
      };

      const res = await axios.post("/transaction", payload, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      const invoiceUrl = res.data.invoice?.invoiceUrl;
      if (invoiceUrl) {
        localStorage.removeItem("checkout");
        window.location.href = invoiceUrl;
      } else {
        alert("Gagal membuat invoice.");
      }
    } catch (error) {
      console.error("❌ Gagal kirim transaksi:", error);
      alert("Terjadi kesalahan saat mengirim transaksi.");
    } finally {
      setIsSubmitting(false);
    }
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
    <section className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {/* Alamat Pengiriman */}
      <div className="mb-8">
        <h2 className="font-semibold text-lg mb-3">Pilih Alamat Pengiriman</h2>
        {addresses.length === 0 ? (
          <p className="text-gray-500 text-sm">Belum ada alamat tersimpan.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {addresses.map((addr) => {
              const selected = selectedAddressId === addr.address_id;
              return (
                <label
                  key={addr.address_id}
                  className={`relative border rounded-lg p-4 cursor-pointer transition duration-150 ${
                    selected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="alamat"
                    value={addr.address_id}
                    checked={selected}
                    onChange={() => setSelectedAddressId(addr.address_id)}
                    className="absolute top-3 left-3 accent-blue-600"
                  />
                  <div className="pl-6">
                    <p className="text-sm font-medium text-gray-800">{addr.address_name}</p>
                    <p className="text-sm text-gray-600 leading-tight">
                      {addr.address}, {addr.city}, {addr.province}
                    </p>
                    {addr.is_primary && (
                      <span className="text-xs font-semibold text-green-600 mt-2 inline-block">
                        Alamat Utama
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Produk */}
      <div className="mb-6 flex gap-4 items-center border rounded-lg p-4">
        <img src={product.imageUrl} alt={product.name} className="w-24 h-24 object-cover rounded-md" />
        <div>
          <p className="font-semibold">{product.name}</p>
          <p className="text-sm text-gray-500">Qty: {product.quantity}</p>
          <p className="text-sm text-gray-500">Harga: Rp{product.price.toLocaleString()}</p>
        </div>
      </div>

      {/* Reward */}
      {reward && (
        <div className="mb-6 space-y-3">
          {totalPoints > 0 && (
            <label>
              <input type="checkbox" checked={usePoints} onChange={() => setUsePoints(!usePoints)} className="mr-2" />
              Gunakan Poin ({totalPoints} poin - Diskon Rp{pointDiscount.toLocaleString()})
            </label>
          )}
          {voucher && (
            <label>
              <input type="checkbox" checked={useVoucher} onChange={() => setUseVoucher(!useVoucher)} className="mr-2" />
              Gunakan Voucher {voucher.code} - Diskon Rp{voucherDiscount.toLocaleString()}
            </label>
          )}
        </div>
      )}

      {/* Pengiriman */}
      {shippingData &&
        ["calculate_reguler", "calculate_cargo", "calculate_instant"].map((type) => {
          const options = shippingData[type] || [];
          if (!Array.isArray(options) || options.length === 0) return null;

          return (
            <div key={type} className="mb-4">
              <p className="font-semibold capitalize">{type.replace("calculate_", "")}</p>
              {options.map((option: any, i: number) => {
                const id = `${type}-${i}`;
                return (
                  <label
                    key={id}
                    className={`block border rounded-lg p-3 mt-2 cursor-pointer ${
                      selectedShippingOption?.id === id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping_option"
                      checked={selectedShippingOption?.id === id}
                      onChange={() => {
                        setSelectedShippingOption({ ...option, id });
                        setShippingCost(option.shipping_cost_net / 1000);
                      }}
                      className="mr-2"
                    />
                    {option.shipping_name} - {option.service_name} | Estimasi: {option.etd} | Rp
                    {(option.shipping_cost_net / 1000).toLocaleString()}
                  </label>
                );
              })}
            </div>
          );
        })}

      {/* Ringkasan */}
      <div className="border-t pt-4 mt-4 space-y-2 text-lg">
        <p>Subtotal: Rp{subtotal.toLocaleString()}</p>
        <p className="text-red-600">Diskon: -Rp{totalDiscount.toLocaleString()}</p>
        <p>Ongkir: Rp{shippingCost.toLocaleString()}</p>
        <p className="font-bold text-xl">Total Bayar: Rp{(finalTotal + shippingCost).toLocaleString()}</p>
      </div>

      {/* Tombol Bayar */}
      <button
        onClick={handleConfirm}
        disabled={isSubmitting || !selectedShippingOption}
        className="w-full bg-black text-white mt-6 py-3 rounded hover:bg-gray-800 disabled:opacity-50"
      >
        {isSubmitting ? "Memproses..." : "Konfirmasi & Bayar"}
      </button>
    </section>
  );
}
