"use client";

import axios from "@/lib/axios";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Props {
  token: string;
}

export default function VerifyPage({ token }: Props) {
  const [status, setStatus] = useState<"waiting" | "success" | "failed">("waiting");
  const router = useRouter();

  const onVerify = async () => {
    try {
      const { data } = await axios.patch(
        "/auth/verify",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(data.message);
      setStatus("success");

      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      console.log(err);
      setStatus("failed");
    }
  };

  useEffect(() => {
    onVerify();
  }, [token]);

  const renderContent = () => {
    if (status === "waiting") {
      return (
        <>
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Memverifikasi akun kamu...</h2>
          <p className="text-sm text-gray-500">Mohon tunggu sebentar.</p>
        </>
      );
    }

    if (status === "success") {
      return (
        <>
          <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-green-600">Verifikasi Berhasil!</h2>
          <p className="text-gray-700 mt-2">Kamu akan diarahkan ke halaman login...</p>
        </>
      );
    }

    return (
      <>
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-600">Verifikasi Gagal</h2>
        <p className="text-gray-700 mt-2">Token tidak valid atau sudah kedaluwarsa.</p>
      </>
    );
  };

  return (
    <div className="flex h-screen w-screen justify-center items-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-2xl text-center animate-fade-in">
        <div className="flex justify-center mb-4">
          <Image src="/logo.png" alt="Logo" width={120} height={60} />
        </div>
        {renderContent()}
      </div>
    </div>
  );
}
