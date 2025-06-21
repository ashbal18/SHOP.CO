"use client";

import Navbar from "@/components/navbar/navbar/Navbar";
import Footer from "@/components/navbar/navbar/footer";
import Sidebarsup from "@/components/navbar/navbar/Sidebarsup";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useSession } from "next-auth/react";
import AddStoreModal from "@/components/modal/addstore";
import EditStoreModal from "@/components/modal/editstore";

interface Store {
  id: string;
  name: string;
  address: string;
  city?: {
    city_name: string;
    province_name: string;
  };
  admin?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function SuperAdminKelolaToko() {
  const { data: session, status } = useSession();
  const [stores, setStores] = useState<Store[]>([]);
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

  const handleAddStore = (newStore: Store) => {
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

  const handleEditClick = (store: Store) => {
    setStoreToEdit(store);
    setIsEditModalOpen(true);
  };

  const handleUpdateStore = (updatedStore: Store) => {
    setStores((prev) =>
      prev.map((store) => (store.id === updatedStore.id ? updatedStore : store))
    );
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">Memeriksa sesi pengguna...</p>
      </div>
    );
  }

  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-red-600 text-lg font-semibold">
          Anda tidak memiliki akses ke halaman ini.
        </p>
      </div>
    );
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
            <span className="inline-block px-4 py-1 text-xs font-semibold text-white bg-purple-700 rounded-full uppercase tracking-wide select-none">
              {session.user?.role ?? "SUPER_ADMIN"}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              Daftar Toko
            </h1>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Tambah Toko
            </button>
          </div>

          {!loading && (
            <div className="mb-8 inline-block px-6 py-3 bg-green-100 text-green-900 rounded-lg shadow-sm font-semibold select-none">
              Total Toko: <span className="text-2xl">{stores.length}</span>
            </div>
          )}

          {loading ? (
            <p className="text-gray-600 text-center py-10 text-lg">Memuat data toko...</p>
          ) : stores.length === 0 ? (
            <p className="text-gray-600 text-center py-10 text-lg">Tidak ada toko yang ditemukan.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow-lg bg-white border border-gray-200">
              <table className="min-w-full table-auto border-collapse">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-2 border">#</th>
                    <th className="px-4 py-2 border">Nama Toko</th>
                    <th className="px-4 py-2 border">Nama Admin</th>
                    <th className="px-4 py-2 border">Alamat</th>
                    <th className="px-4 py-2 border">Kota</th>
                    <th className="px-4 py-2 border">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store, idx) => (
                    <tr key={store.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border text-center">{idx + 1}</td>
                      <td className="px-4 py-2 border">{store.name}</td>
                      <td className="px-4 py-2 border">{store.admin?.name ?? "-"}</td>
                      <td className="px-4 py-2 border">{store.address}</td>
                      <td className="px-4 py-2 border">
                        {store.city
                          ? `${store.city.city_name}, ${store.city.province_name}`
                          : "-"}
                      </td>
                      <td className="px-4 py-2 border text-center space-x-2">
                        <button
                          onClick={() => handleEditClick(store)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStore(store.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          🗑️ Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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