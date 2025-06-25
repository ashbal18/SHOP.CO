"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar/navbar/Navbar";
import Sidebar from "@/components/navbar/navbar/Sidebar";
import Footer from "@/components/navbar/navbar/footer";
import axios from "@/lib/axios";
import { useSession } from "next-auth/react";

interface IPoint {
  id: string;
  amount: number;
  expiredAt: string;
}

interface IVoucher {
  id: string;
  percentage: number;
  maxDiscount: number;
  expiredAt: string;
}

export default function CustomerRewards() {
  const { data: session, status } = useSession();
  const [points, setPoints] = useState<IPoint[]>([]);
  const [voucher, setVoucher] = useState<IVoucher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      if (!session?.accessToken) return;

      try {
        const { data } = await axios.get("/rewards", {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        setPoints(data.points || []);
        setVoucher(data.voucher || null);
      } catch (error) {
        console.error("Error fetching rewards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Silakan login terlebih dahulu untuk melihat rewards Anda.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex w-full h-screen">
        <Sidebar />
        <main className="flex-1 p-6 mt-20 overflow-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Customer Rewards</h1>

          {/* POIN */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Customer Points</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {points.length > 0 ? (
                points.map((point) => (
                  <div
                    key={point.id}
                    className="bg-white shadow-md rounded-2xl p-5 border border-gray-200"
                  >
                    <p className="text-lg font-bold text-blue-600">
                      {point.amount.toLocaleString()} Poin
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Expired At:{" "}
                      <span className="text-red-500">
                        {new Date(point.expiredAt).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Belum ada poin tersedia.</p>
              )}
            </div>
          </section>

          {/* VOUCHER */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Customer Coupon</h2>
            {voucher ? (
              <div className="bg-white shadow-md rounded-2xl p-5 border border-gray-200 w-fit">
                <p className="text-lg font-semibold text-green-600">
                  Diskon: {voucher.percentage}% (Max {voucher.maxDiscount.toLocaleString()})
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Expired At:{" "}
                  <span className="text-red-500">
                    {new Date(voucher.expiredAt).toLocaleDateString()}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Tidak ada voucher tersedia.</p>
            )}
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
