"use client";

import Navbar from "@/components/navbar/navbar/Navbar";
import Footer from "@/components/navbar/navbar/footer";
import Sidebarsup from "@/components/navbar/navbar/Sidebarsup";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useSession } from "next-auth/react";
import EditStoreModal from "@/components/modal/editstore";
import AddStoreModal from "@/components/modal/addstore";
import { Store, StoreResponse } from "@/types/store";


export default function SuperAdminKelolaToko() {
  const { data: session, status } = useSession();
  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [storeToEdit, setStoreToEdit] = useState<Store | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      if (!session?.accessToken) return;
      setLoading(true);
      try {
        const response = await axios.get("/store", {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        setStores(response.data);
      } catch (error) {
        console.error("Gagal mengambil data toko:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "SUPER_ADMIN") {
      fetchStores();
    }
  }, [session]);

  const handleAddStore = (newStore: StoreResponse) => {
    setStores((prev) => [...prev, newStore]);
  };

  const handleDeleteStore = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus toko ini?")) return;
    try {
      await axios.delete(`/store/${id}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      setStores((prev) => prev.filter((store) => store.id !== id));
    } catch (error) {
      console.error("Gagal menghapus toko:", error);
      alert("Terjadi kesalahan saat menghapus toko.");
    }
  };

  const handleEditClick = (store: StoreResponse) => {
    const storeFormatted: Store = {
      id: store.id,
      name: store.name,
      address: store.address,
      adminId: store.admin?.id || "",
      city_id: store.city?.id.toString() || "",
      latitude: 0, 
      longitude: 0,
    };
    setStoreToEdit(storeFormatted);
    setIsEditModalOpen(true);
  };

  const handleUpdateStore = (updatedStore: Store) => {
    setStores((prev) =>
      prev.map((store) => (store.id === updatedStore.id ? { ...store, ...updatedStore } : store))
    );
  };

  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return <div className="flex items-center justify-center h-screen text-red-600">Tidak punya akses.</div>;
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50">
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
          <Sidebarsup />
        </aside>

        <main className="flex-1 p-8 max-w-full">
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md max-w-md">
            <p className="text-gray-500 text-sm mb-1">Kelola data toko Anda,</p>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">
              {session.user?.name ?? "Super Admin"}
            </h2>
            <span className="inline-block px-4 py-1 text-xs font-semibold text-white bg-purple-700 rounded-full uppercase">
              {session.user?.role ?? "SUPER_ADMIN"}
            </span>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold">Daftar Toko</h1>
            <button onClick={() => setIsAddModalOpen(true)} className="bg-green-600 px-4 py-2 text-white rounded">Tambah Toko</button>
          </div>

          {loading ? (
            <p className="text-gray-600 text-center">Memuat data toko...</p>
          ) : stores.length === 0 ? (
            <p className="text-gray-600 text-center">Tidak ada toko yang ditemukan.</p>
          ) : (
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">#</th>
                  <th className="border px-4 py-2">Nama Toko</th>
                  <th className="border px-4 py-2">Nama Admin</th>
                  <th className="border px-4 py-2">Alamat</th>
                  <th className="border px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store, idx) => (
                  <tr key={store.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 text-center">{idx + 1}</td>
                    <td className="border px-4 py-2">{store.name}</td>
                    <td className="border px-4 py-2">{store.admin?.name || "-"}</td>
                    <td className="border px-4 py-2">{store.address}</td>
                    <td className="border px-4 py-2 text-center space-x-2">
                      <button onClick={() => handleEditClick(store)} className="text-blue-600">✏️</button>
                      <button onClick={() => handleDeleteStore(store.id)} className="text-red-600">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <AddStoreModal
            open={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAdd={handleAddStore}
            token={session?.accessToken ?? ""}
          />

          <EditStoreModal
            open={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onUpdate={handleUpdateStore}
            token={session?.accessToken ?? ""}
            storeToEdit={storeToEdit}
          />
        </main>
      </div>
      <Footer />
    </>
  );
}
