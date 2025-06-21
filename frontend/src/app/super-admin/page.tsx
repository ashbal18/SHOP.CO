"use client";

import Navbar from "@/components/navbar/navbar/Navbar";
import Footer from "@/components/navbar/navbar/footer";
import Sidebarsup from "@/components/navbar/navbar/Sidebarsup";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import AddStoreAdminModal, {
  StoreAdmin,
} from "@/components/modal/addadminstore";
import EditStoreAdminModal from "@/components/modal/EditStoreAdminMod";

import { useSession } from "next-auth/react";
import DeleteStoreAdminModal from "@/components/modal/DeleteConfirmMod";

export default function StoreAdminListPage() {
  const { data: session, status } = useSession();
  const [storeAdmins, setStoreAdmins] = useState<StoreAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<StoreAdmin | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<StoreAdmin | null>(null);

  useEffect(() => {
    const fetchStoreAdmins = async () => {
      try {
        const response = await axios.get("/store-admin");
        setStoreAdmins(response.data);
      } catch (error) {
        console.error("Gagal mengambil data Store Admin:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "SUPER_ADMIN") {
      fetchStoreAdmins();
    }
  }, [session]);

  const handleAddUser = (newUser: StoreAdmin) => {
    setStoreAdmins((prev) => [...prev, newUser]);
  };

  const handleUpdateAdmin = (updatedAdmin: StoreAdmin) => {
    setStoreAdmins((prev) =>
      prev.map((admin) => (admin.id === updatedAdmin.id ? updatedAdmin : admin))
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
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        <aside className="w-full md:w-64 bg-white border-r border-gray-200 hidden md:block">
          <Sidebarsup />
        </aside>

        <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 max-w-full">
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md max-w-md">
            <p className="text-gray-500 text-sm mb-1">
              Selamat datang di dashboard Super Admin,
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">
              {session.user?.name ?? "Super Admin"}
            </h2>
            <span className="inline-block px-4 py-1 text-xs font-semibold text-white bg-purple-700 rounded-full uppercase tracking-wide select-none">
              {session.user?.role ?? "SUPER_ADMIN"}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Daftar Pengguna
            </h1>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tambah Store Admin
            </button>
          </div>

          {!loading && (
            <div className="mb-8 inline-block px-6 py-3 bg-blue-100 text-blue-900 rounded-lg shadow-sm font-semibold select-none">
              Total Store Admin:{" "}
              <span className="text-2xl">{storeAdmins.length}</span>
            </div>
          )}

          {loading ? (
            <p className="text-gray-600 text-center py-10 text-lg">
              Memuat data...
            </p>
          ) : storeAdmins.length === 0 ? (
            <p className="text-gray-600 text-center py-10 text-lg">
              Tidak ada Store Admin yang ditemukan.
            </p>
          ) : (
            <div className="w-full overflow-x-auto rounded-lg shadow-lg bg-white border border-gray-200">
              <table className="min-w-[700px] w-full table-auto border-collapse">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold text-sm">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold text-sm">
                      Nama
                    </th>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold text-sm">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold text-sm">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold text-sm hidden sm:table-cell">
                      Toko
                    </th>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold text-sm">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {storeAdmins.map((admin, index) => (
                    <tr
                      key={admin.id}
                      className="border-b last:border-0 hover:bg-blue-50 transition-colors duration-200"
                    >
                      <td className="px-4 py-3 text-sm">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {admin.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {admin.email}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 uppercase">
                          {admin.roles}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm hidden sm:table-cell">
                        {admin.store ? admin.store.name : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm space-x-4">
                        <button
                          onClick={() => {
                            setSelectedAdmin(admin);
                            setIsEditModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setAdminToDelete(admin);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      <Footer />

      <AddStoreAdminModal
        isOpen={isAddModalOpen}
        setIsOpen={setIsAddModalOpen}
        handleAddUser={handleAddUser}
      />

      <EditStoreAdminModal
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        admin={selectedAdmin}
        onUpdate={handleUpdateAdmin}
      />

      <DeleteStoreAdminModal
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        admin={adminToDelete}
        onSuccess={() =>
          setStoreAdmins((prev) =>
            prev.filter((admin) => admin.id !== adminToDelete?.id)
          )
        }
      />
    </>
  );
}
