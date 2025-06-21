"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar/navbar/Navbar";
import Footer from "@/components/navbar/navbar/footer";
import Sidebarsup from "@/components/navbar/navbar/Sidebarsup";
import axios from "@/lib/axios";

interface StoreAdmin {
  id: string;
  name: string;
  email: string;
  roles: string;
}

export default function StoreAdminListPage() {
  const [storeAdmins, setStoreAdmins] = useState<StoreAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState<StoreAdmin | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchStoreAdmins();
  }, []);

  const fetchStoreAdmins = async () => {
    try {
      setLoading(true);
      console.log("Fetching store admins...");
      const response = await axios.get("/store-admin");
      console.log("Response data:", response.data);
      setStoreAdmins(response.data);
    } catch (error) {
      console.error("Gagal mengambil data Store Admin:", error);
      alert("Gagal mengambil data Store Admin. Cek console untuk detail.");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (admin: StoreAdmin) => {
    console.log("Open edit modal for:", admin);
    setEditData(admin);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setEditData(null);
    setIsEditOpen(false);
  };

  const handleEditSubmit = async () => {
    if (!editData) return;
    console.log("Mengirim data edit:", editData);
    try {
      const res = await axios.put(`/store-admin/${editData.id}`, {
        name: editData.name,
        email: editData.email,
      });
      console.log("Response edit:", res.data);
      closeEditModal();
      fetchStoreAdmins();
    } catch (error) {
      console.error("Gagal mengupdate data Store Admin:", error);
      alert("Gagal mengupdate data Store Admin. Cek console untuk detail.");
    }
  };

  const openDeleteModal = (id: string) => {
    console.log("Open delete modal for id:", id);
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteId(null);
    setIsDeleteOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    console.log("Menghapus Store Admin dengan id:", deleteId);
    try {
      const res = await axios.delete(`/store-admin/${deleteId}`);
      console.log("Response delete:", res.data);
      closeDeleteModal();
      fetchStoreAdmins();
    } catch (error) {
      console.error("Gagal menghapus Store Admin:", error);
      alert("Gagal menghapus Store Admin. Cek console untuk detail.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex h-screen w-full">
        <div className="w-64 bg-gray-100 hidden md:block">
          <Sidebarsup />
        </div>
        <main className="flex-1 p-8 overflow-auto">
          <h1 className="text-3xl font-bold mb-6">Daftar Store Admin</h1>

          {loading ? (
            <p>Loading...</p>
          ) : storeAdmins.length === 0 ? (
            <p>Data Store Admin kosong.</p>
          ) : (
            <div className="grid gap-4">
              {storeAdmins.map((admin) => (
                <div
                  key={admin.id}
                  className="p-4 border rounded shadow bg-white"
                >
                  <p>
                    <strong>Nama:</strong> {admin.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {admin.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {admin.roles}
                  </p>
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => openEditModal(admin)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(admin.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer />

      {/* Modal Edit */}
      {isEditOpen && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">Edit Store Admin</h2>
            <label className="block mb-2">
              Nama:
              <input
                type="text"
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
                className="w-full border rounded px-2 py-1 mt-1"
              />
            </label>
            <label className="block mb-4">
              Email:
              <input
                type="email"
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
                className="w-full border rounded px-2 py-1 mt-1"
              />
            </label>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-80">
            <h2 className="text-xl font-bold mb-4">Konfirmasi Hapus</h2>
            <p>Apakah Anda yakin ingin menghapus Store Admin ini?</p>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
