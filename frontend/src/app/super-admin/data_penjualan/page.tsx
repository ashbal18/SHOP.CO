"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/navbar/navbar/Navbar";
import Footer from "@/components/navbar/navbar/footer";
import Sidebarsup from "@/components/navbar/navbar/Sidebarsup";
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
import { Loader2 } from "lucide-react";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

type Store = { id: string; name: string };
type Sale = { productId: string; name: string; totalSold: number; totalRevenue: number };
type CategorySale = { category: string; totalSold: number; totalRevenue: number };
type StockSummary = { totalAdded: number; totalRemoved: number; stockEnding: number };
type StockHistory = { productId: string; productName: string; type: string; quantity: number; description: string; date: string };
type StoreMonthlySales = { storeId: string; storeName: string; monthlySales: { month: number; totalAmount: number }[] };
type ProductStockData = { productId: string; productName: string; storeId: string; storeName: string; stock: number; totalSold: number };
type MonthlySalesChartRow = {
  month: number;
} & {
  [storeId: string]: number | string;
};

export default function SalesDataSuperAdminPage() {
  const { data: session, status } = useSession();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [sales, setSales] = useState<Sale[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySale[]>([]);
  const [stockSummary, setStockSummary] = useState<StockSummary>({ totalAdded: 0, totalRemoved: 0, stockEnding: 0 });
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);
  const [monthlySalesPerStore, setMonthlySalesPerStore] = useState<StoreMonthlySales[]>([]);
  const [productStockData, setProductStockData] = useState<ProductStockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [year] = useState<number>(2025);
  const [month, setMonth] = useState<number>(6);

  useEffect(() => {
    const fetchStores = async () => {
      if (!session?.accessToken) return;
      try {
        const res = await axios.get("/store", {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        const data = res.data?.stores ?? res.data;
        setStores(data);
        if (data.length > 0) setSelectedStoreId(data[0].id);
      } catch (err) {
        console.error("Gagal ambil daftar toko:", err);
      }
    };
    if (status === "authenticated") fetchStores();
  }, [session, status]);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.accessToken || !selectedStoreId) return;
      setLoading(true);
      try {
        const [productRes, categoryRes, stockRes, historyRes, productStockRes] = await Promise.all([
          axios.get(`/report/sales/product`, {
            params: { year, month, storeId: selectedStoreId },
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }),
          axios.get(`/report/sales/category`, {
            params: { year, month, storeId: selectedStoreId },
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }),
          axios.get(`/report/sales/stock/summary`, {
            params: { year, month, storeId: selectedStoreId },
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }),
          axios.get(`/report/sales/stock/history`, {
            params: { year, month, storeId: selectedStoreId },
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }),
          axios.get(`/report/product-stock`, {
            params: { year, month, storeId: selectedStoreId },
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }),
        ]);

        setSales(productRes.data);
        setCategorySales(categoryRes.data);
        setStockSummary(stockRes.data);
        setStockHistory(historyRes.data);
        setProductStockData(productStockRes.data);
      } catch (err) {
        console.error("Gagal memuat data laporan:", err);
      } finally {
        setLoading(false);
      }
    };
    if (status === "authenticated" && selectedStoreId) fetchData();
  }, [year, month, selectedStoreId, session?.accessToken, status]);

  useEffect(() => {
    const fetchMonthlySales = async () => {
      if (!session?.accessToken || !stores.length) return;
      try {
        const promises = stores.map(async (store) => {
          const res = await axios.get("/report/sales/monthly", {
            params: { year, storeId: store.id },
            headers: { Authorization: `Bearer ${session.accessToken}` },
          });
          return {
            storeId: store.id,
            storeName: store.name,
            monthlySales: res.data,
          };
        });
        const results = await Promise.all(promises);
        setMonthlySalesPerStore(results);
      } catch (error) {
        console.error("Gagal ambil sales bulanan per toko:", error);
      }
    };
    if (status === "authenticated") fetchMonthlySales();
  }, [stores, session?.accessToken, status, year]);

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalRevenue, 0);

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 pt-16">
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
          <Sidebarsup />
        </aside>
        <main className="flex-1 p-6 bg-gray-50 min-h-screen overflow-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold">Laporan Penjualan & Stok</h1>
            <div className="flex gap-2">
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1"
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="border border-gray-300 rounded px-3 py-1"
              >
                {MONTHS.map((m, index) => (
                  <option key={index} value={index + 1}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
              <span className="ml-2">Memuat laporan...</span>
            </div>
          ) : (
            <>
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

              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Stok & Terjual per Produk</h2>
                <div className="overflow-x-auto bg-white rounded shadow">
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-2 px-4 border">Produk</th>
                        <th className="py-2 px-4 border">Toko</th>
                        <th className="py-2 px-4 border">Stok</th>
                        <th className="py-2 px-4 border">Terjual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productStockData.map((entry, index) => (
                        <tr key={index}>
                          <td className="border px-4 py-2">{entry.productName}</td>
                          <td className="border px-4 py-2">{entry.storeName}</td>
                          <td className="border px-4 py-2">{entry.stock}</td>
                          <td className="border px-4 py-2">{entry.totalSold}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Ringkasan Stok</h2>
                <div className="bg-white p-4 rounded shadow">
                  <p>Total Masuk: {stockSummary.totalAdded}</p>
                  <p>Total Keluar: {stockSummary.totalRemoved}</p>
                  <p>Stok Akhir: {stockSummary.stockEnding}</p>
                </div>
              </section>

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
                          <td className="border px-4 py-2">{new Date(entry.date).toLocaleDateString("id-ID")}</td>
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

              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Perbandingan Penjualan Bulanan Semua Toko</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={Array.from({ length: 12 }, (_, i): MonthlySalesChartRow => {
                      const monthNumber = i + 1;
                      const row: MonthlySalesChartRow = monthlySalesPerStore.reduce((acc, store) => {
                        const found = store.monthlySales.find((ms) => ms.month === monthNumber);
                        return {
                          ...acc,
                          [store.storeId]: found ? found.totalAmount : 0,
                        };
                      }, { month: monthNumber });
                      return row;
                    })}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" type="number" domain={[1, 12]} tickFormatter={(m) => MONTHS[Number(m) - 1]} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {monthlySalesPerStore.map((store, index) => (
                      <Bar
                        key={store.storeId}
                        dataKey={store.storeId}
                        name={store.storeName}
                        fill={`hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
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
