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

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

type Sale = {
  productId: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
};

type CategorySale = {
  category: string;
  totalSold: number;
  totalRevenue: number;
};

type StockSummary = {
  totalAdded: number;
  totalRemoved: number;
  stockEnding: number;
};

type StockHistory = {
  productId: string;
  productName: string;
  type: string;
  quantity: number;
  description: string;
  date: string;
};

export default function SalesDataPage() {
  const { data: session, status } = useSession();
  const [sales, setSales] = useState<Sale[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySale[]>([]);
  const [stockSummary, setStockSummary] = useState<StockSummary>({
    totalAdded: 0,
    totalRemoved: 0,
    stockEnding: 0,
  });
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [year] = useState<number>(2025);
  const [month, setMonth] = useState<number>(6);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.accessToken || !session?.user?.storeId) return;
      setLoading(true);
      try {
        const [productRes, categoryRes, stockRes, historyRes] = await Promise.all([
          axios.get(`/report/sales/product`, {
            params: { year, month, storeId: session.user.storeId },
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }),
          axios.get(`/report/sales/category`, {
            params: { year, month, storeId: session.user.storeId },
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }),
          axios.get(`/report/sales/stock/summary`, {
            params: { year, month, storeId: session.user.storeId },
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }),
          axios.get(`/report/sales/stock/history`, {
            params: { year, month, storeId: session.user.storeId },
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }),
        ]);

        setSales(productRes.data);
        setCategorySales(categoryRes.data);
        setStockSummary(stockRes.data);
        setStockHistory(historyRes.data);
      } catch (err) {
        console.error("Gagal memuat data laporan:", err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") fetchData();
  }, [year, month, session, status]);

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalRevenue, 0);

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 pt-16">
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
          <Sidebarstore />
        </aside>

        <main className="flex-1 p-6 bg-gray-50 min-h-screen overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Laporan Penjualan & Stok</h1>
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

          {loading ? (
            <p>Loading data...</p>
          ) : (
            <>
              {/* Penjualan per Produk */}
              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Penjualan per Produk</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalRevenue" fill="#4f46e5" name="Pendapatan" />
                  </BarChart>
                </ResponsiveContainer>
              </section>

              {/* Penjualan per Kategori */}
              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Pendapatan per Kategori</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categorySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalRevenue" fill="#10b981" name="Pendapatan" />
                  </BarChart>
                </ResponsiveContainer>
              </section>

              {/* Ringkasan Stok */}
              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Ringkasan Stok</h2>
                <div className="bg-white p-4 rounded shadow">
                  <p>Total Masuk: {stockSummary.totalAdded}</p>
                  <p>Total Keluar: {stockSummary.totalRemoved}</p>
                  <p>Stok Akhir: {stockSummary.stockEnding}</p>
                </div>
              </section>

              {/* Histori Stok */}
              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Histori Perubahan Stok</h2>
                <div className="overflow-x-auto bg-white rounded shadow">
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-2 px-4 border">Tanggal</th>
                        <th className="py-2 px-4 border">Produk</th>
                        <th className="py-2 px-4 border">Tipe</th>
                        <th className="py-2 px-4 border">Jumlah</th>
                        <th className="py-2 px-4 border">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockHistory.map((entry, index) => (
                        <tr key={index}>
                          <td className="border px-4 py-2">
                            {new Date(entry.date).toLocaleDateString("id-ID")}
                          </td>
                          <td className="border px-4 py-2">{entry.productName}</td>
                          <td className="border px-4 py-2">{entry.type}</td>
                          <td className="border px-4 py-2">{entry.quantity}</td>
                          <td className="border px-4 py-2">{entry.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="text-right text-xl font-bold mt-6">
                Total Pendapatan Bulan Ini: Rp {totalRevenue.toLocaleString("id-ID")}
              </div>
            </>
          )}
          <Footer />
        </main>
      </div>
    </>
  );
}
