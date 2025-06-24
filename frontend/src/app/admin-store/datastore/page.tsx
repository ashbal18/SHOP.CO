"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/navbar/navbar/Navbar";
import Sidebarstore from "@/components/navbar/navbar/SidebarAdminStore";
import Footer from "@/components/navbar/navbar/footer";
import axios from "@/lib/axios";
import { useSession } from "next-auth/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

interface Sale {
  productId: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
}

interface CategorySale {
  category: string;
  totalSold: number;
  totalRevenue: number;
}

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function SalesDataPage() {
  const { data: session, status } = useSession();
  const [sales, setSales] = useState<Sale[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySale[]>([]);
  const [loading, setLoading] = useState(true);
  const [year] = useState<number>(2025);
  const [month, setMonth] = useState<number>(6); // default Juni

  useEffect(() => {
    const fetchSales = async () => {
      if (!session?.accessToken || !session?.user?.storeId) {
        console.error("Token atau storeId tidak ditemukan.");
        return;
      }

      setLoading(true);
      try {
        const [productRes, categoryRes] = await Promise.all([
          axios.get(`/report/sales/product`, {
            params: { year, month, storeId: session.user.storeId },
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }),
          axios.get(`/report/sales/category`, {
            params: { year, month, storeId: session.user.storeId },
            headers: { Authorization: `Bearer ${session.accessToken}` },
          })
        ]);

        setSales(productRes.data);
        setCategorySales(categoryRes.data);
      } catch (error: any) {
        console.error("Gagal fetch sales:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchSales();
    }
  }, [year, month, session, status]);

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalRevenue, 0);

  if (status === "loading") {
    return <div className="p-8 text-center text-lg">Memuat session...</div>;
  }

  if (!session?.user) {
    return <div className="p-8 text-center text-red-600">Anda tidak memiliki akses.</div>;
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 pt-16">
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
          <Sidebarstore />
        </aside>

        <main className="flex-1 p-6 bg-gray-50 min-h-screen overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Data Penjualan Produk</h1>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="border border-gray-300 rounded px-3 py-1"
            >
              {MONTHS.map((m, index) => (
                <option key={index} value={index + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Tabel Data Produk */}
          <div className="overflow-x-auto bg-white rounded shadow mb-6">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border">No</th>
                  <th className="py-2 px-4 border">Produk</th>
                  <th className="py-2 px-4 border">Jumlah Terjual</th>
                  <th className="py-2 px-4 border">Total Pendapatan (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4">Memuat data...</td>
                  </tr>
                ) : sales.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4">Tidak ada data penjualan</td>
                  </tr>
                ) : (
                  sales.map((sale, index) => (
                    <tr key={sale.productId} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{index + 1}</td>
                      <td className="border px-4 py-2">{sale.name}</td>
                      <td className="border px-4 py-2">{sale.totalSold}</td>
                      <td className="border px-4 py-2">{sale.totalRevenue.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Chart Produk */}
          <div className="bg-white rounded shadow p-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">Grafik Pendapatan per Produk</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={sales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `Rp ${(+value).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="totalRevenue" fill="#4f46e5" name="Pendapatan (Rp)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Kategori */}
          <div className="bg-white rounded shadow p-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">Grafik Pendapatan per Kategori</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={categorySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => `Rp ${(+value).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="totalRevenue" fill="#10b981" name="Pendapatan (Rp)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-right text-xl font-bold">
            Total Pendapatan Bulan Ini: Rp {totalRevenue.toLocaleString()}
          </div>

          <Footer />
        </main>
      </div>
    </>
  );
}