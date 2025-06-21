"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar/navbar/Navbar";
import Sidebarstore from "@/components/navbar/navbar/SidebarAdminStore";
import Footer from "@/components/navbar/navbar/footer";

interface Sale {
  id: number;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  date: string; // ISO date string
  total: number;
  status: "completed" | "pending" | "canceled";
}

export default function SalesDataPage() {
  const [sales, setSales] = useState<Sale[]>([
    {
      id: 1,
      productName: "Sepatu Sneakers",
      quantity: 2,
      pricePerUnit: 350000,
      date: "2025-06-01",
      total: 700000,
      status: "completed",
    },
    {
      id: 2,
      productName: "Kaos Polo",
      quantity: 1,
      pricePerUnit: 150000,
      date: "2025-06-02",
      total: 150000,
      status: "pending",
    },
    {
      id: 3,
      productName: "Sepatu Sneakers",
      quantity: 1,
      pricePerUnit: 350000,
      date: "2025-06-03",
      total: 350000,
      status: "canceled",
    },
  ]);

  // Hitung total pendapatan (hanya completed)
  const totalRevenue = sales
    .filter((s) => s.status === "completed")
    .reduce((sum, s) => sum + s.total, 0);

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 pt-16">
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
          <Sidebarstore />
        </aside>

        <main className="flex-1 p-6 bg-gray-50 min-h-screen overflow-auto">
          <h1 className="text-3xl font-bold mb-6">Data Penjualan Toko</h1>

          <div className="overflow-x-auto bg-white rounded shadow mb-6">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border">ID</th>
                  <th className="py-2 px-4 border">Produk</th>
                  <th className="py-2 px-4 border">Jumlah</th>
                  <th className="py-2 px-4 border">Harga Satuan (Rp)</th>
                  <th className="py-2 px-4 border">Tanggal</th>
                  <th className="py-2 px-4 border">Total (Rp)</th>
                  <th className="py-2 px-4 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      Tidak ada data penjualan
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{sale.id}</td>
                      <td className="border px-4 py-2">{sale.productName}</td>
                      <td className="border px-4 py-2">{sale.quantity}</td>
                      <td className="border px-4 py-2">
                        {sale.pricePerUnit.toLocaleString()}
                      </td>
                      <td className="border px-4 py-2">
                        {new Date(sale.date).toLocaleDateString("id-ID")}
                      </td>
                      <td className="border px-4 py-2">{sale.total.toLocaleString()}</td>
                      <td
                        className={`border px-4 py-2 capitalize font-semibold ${
                          sale.status === "completed"
                            ? "text-green-600"
                            : sale.status === "pending"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {sale.status}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="text-right text-xl font-bold">
            Total Pendapatan: Rp {totalRevenue.toLocaleString()}
          </div>

          <Footer />
        </main>
      </div>
    </>
  );
}
