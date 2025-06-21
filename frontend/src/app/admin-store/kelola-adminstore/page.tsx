"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar/navbar/Navbar";
import Sidebarstore from "@/components/navbar/navbar/SidebarAdminStore";
import Footer from "@/components/navbar/navbar/footer";
import { useSession } from "next-auth/react";
import axios from "@/lib/axios"; // sesuaikan path sesuai struktur project
import Image from "next/image";

interface Store {
  id: string;
  name: string;
  address: string;
}

interface AdminStore {
  id: string | number;
  name: string;
  email: string;
  roles: string | string[];
  avatar: string;
  isVerify: boolean;
  createdAt: string;
  store?: Store | null;
}

export default function AdminStorePage() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  const [admins, setAdmins] = useState<AdminStore[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!session?.accessToken) {
      setError("Token tidak ditemukan. Silakan login terlebih dahulu.");
      return;
    }

    const fetchAdmins = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await axios.get("/store-admins", {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        const currentUserEmail = session.user?.email;
        const adminsFromApi: AdminStore[] = res.data.admins;

        // Filter admins yang sesuai dengan user yang login (berdasarkan email)
        const filteredAdmins = adminsFromApi.filter(
          (admin) =>
            (Array.isArray(admin.roles)
              ? admin.roles.includes("ADMIN") || admin.roles.includes("SUPER_ADMIN")
              : admin.roles === "ADMIN" || admin.roles === "SUPER_ADMIN") &&
            admin.store !== null &&
            admin.email === currentUserEmail
        );

        setAdmins(filteredAdmins);
      } catch (err: any) {
        setError(
          err.response?.data?.message || err.message || "Terjadi kesalahan saat mengambil data."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, [session, loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>Loading session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>Anda harus login dulu.</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex h-screen w-full">
        <div className="w-64 bg-gray-100 hidden md:block">
          <Sidebarstore />
        </div>
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          <h1 className="text-3xl font-bold mb-6">Kelola Admin Store</h1>

          {isLoading && <p>Loading data admin toko...</p>}
          {error && <p className="text-red-600 mb-4">{error}</p>}

          <table className="min-w-full bg-white rounded shadow overflow-x-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border">Nama Admin</th>
                <th className="py-2 px-4 border">Email</th>
                <th className="py-2 px-4 border">Role</th>
                <th className="py-2 px-4 border">Avatar</th>
                <th className="py-2 px-4 border">Nama Toko</th>
                <th className="py-2 px-4 border">Alamat Toko</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    Belum ada admin toko
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{admin.name}</td>
                    <td className="border px-4 py-2">{admin.email}</td>
                    <td className="border px-4 py-2">
                      {Array.isArray(admin.roles) ? admin.roles.join(", ") : admin.roles}
                    </td>
                    <td className="border px-4 py-2">
                      <Image
                        src={admin.avatar}
                        alt={`Avatar ${admin.name}`}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    </td>
                    <td className="border px-4 py-2">{admin.store?.name || "-"}</td>
                    <td className="border px-4 py-2">{admin.store?.address || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </main>
      </div>
      <Footer />
    </>
  );
}
