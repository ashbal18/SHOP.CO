"use client";

import Navbar from "@/components/navbar/navbar/Navbar";
import Sidebar from "@/components/navbar/navbar/Sidebar";
import Footer from "@/components/navbar/navbar/footer";
import { useSession } from "next-auth/react";
import { useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import { VscVerifiedFilled } from "react-icons/vsc";
import axios from "@/lib/axios";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  const [name, setName] = useState(session?.user?.name || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(session?.user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage("Password dan konfirmasi password tidak cocok.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (password) formData.append("password", password);
      if (avatarFile) formData.append("avatar", avatarFile);

      const token = session.accessToken;

      const res = await axios.patch("/users/update-profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // No need to set Content-Type, the browser handles it
        },
      });

      if (res.data.success) {
        setMessage("Profil berhasil diperbarui.");
        setPassword("");
        setConfirmPassword("");
        setAvatarFile(null);
      } else {
        setMessage(res.data.message || "Gagal memperbarui profil.");
      }
    } catch (error: any) {
      console.error(error);
      setMessage(error.response?.data?.message || "Terjadi kesalahan saat memperbarui profil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex h-screen w-full">
        <div className="w-64 bg-gray-100 hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 p-8 overflow-auto">
          <h1 className="text-3xl font-bold mb-6">Profil Saya</h1>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center gap-4">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Foto Profil"
                  width={150}
                  height={150}
                  className="rounded-full object-cover border-4 border-blue-500"
                  priority
                />
              ) : (
                <div className="w-36 h-36 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
                  No Image
                </div>
              )}
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <p>Verified</p>
                <VscVerifiedFilled size={24} />
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-1 max-w-xl space-y-6 bg-white p-6 rounded shadow"
            >
              <div>
                <label className="block mb-1 font-semibold">Nama Lengkap</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Email</label>
                <input
                  type="email"
                  value={session.user?.email || ""}
                  readOnly
                  className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Role</label>
                <input
                  type="text"
                  value={session.user?.role || ""}
                  readOnly
                  className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Referral Code</label>
                <input
                  type="text"
                  value={session.user?.referralCode || ""}
                  readOnly
                  className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Foto Profil</label>
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Kata Sandi Baru</label>
                <input
                  type="password"
                  placeholder="Isi jika ingin ganti password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Konfirmasi Kata Sandi</label>
                <input
                  type="password"
                  placeholder="Konfirmasi kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {message && (
                <p
                  className={`text-sm font-medium ${
                    message.includes("berhasil") ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
