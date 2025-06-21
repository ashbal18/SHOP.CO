"use client";

import React from "react";
import Navbar from "@/components/navbar/navbar/Navbar";
import Sidebarstore from "@/components/navbar/navbar/SidebarAdminStore";
import Footer from "@/components/navbar/navbar/footer";

export default function DashboardProductPage() {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
          <Sidebarstore />
        </aside>

        {/* Konten utama */}
        <main className="flex-1 p-6 bg-gray-50 min-h-screen">
          <h1 className="text-3xl font-bold mb-6">Dashboard Admin Store</h1>
            <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4 mb-8">
            <svg
              className="w-12 h-12 text-blue-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h2 className="text-2xl font-semibold mb-1">Selamat Datang di Dashboard Produk!</h2>
              <p className="text-gray-600">
              Kelola produk tokomu dengan mudah. Tambahkan, edit, atau hapus produk sesuai kebutuhan.
              </p>
            </div>
            </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
