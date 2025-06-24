"use client";

import Navbar from "@/components/navbar/navbar/Navbar";
import Sidebar from "@/components/navbar/navbar/Sidebar";
import Footer from "@/components/navbar/navbar/footer";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

interface Store {
  name: string;
  address: string;
}

interface Voucher {
  code: string;
  percentage: number;
  maxDiscount: number;
}

interface Transaction {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  store: Store;
  voucher?: Voucher;
  items: OrderItem[];
}

export default function TransactionList() {
  const { data: session, status } = useSession();
  const loadingSession = status === "loading";

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!session?.accessToken) return;

    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/userOrder", {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        setTransactions(res.data.transactions ?? []);
      } catch (error) {
        console.error("Gagal mengambil transaksi", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [session]);

  if (loadingSession) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Memuat session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Silakan login terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex h-screen w-full">
        <Sidebar />

        <main className="flex-1 p-8 overflow-auto max-w-7xl mx-auto flex gap-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-6">Riwayat Transaksi</h1>

            {loading ? (
              <p>Memuat transaksi...</p>
            ) : transactions.length === 0 ? (
              <p>Belum ada transaksi.</p>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="mb-6 border p-4 rounded shadow flex justify-between items-start cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setSelectedTransaction(tx)}
                >
                  <div>
                    <p className="font-semibold text-lg">{tx.store.name}</p>
                    <p className="text-sm text-gray-600">{tx.store.address}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-600 font-medium">{tx.status}</p>
                    <p className="text-lg font-bold">
                      Rp{tx.totalAmount.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Detail transaksi yang diklik */}
          <div className="w-96 p-6 border rounded shadow bg-gray-50">
            <h2 className="text-2xl font-semibold mb-4">Detail Transaksi</h2>
            {selectedTransaction ? (
              <>
                <p className="mb-1">
                  <span className="font-semibold">Toko: </span>
                  {selectedTransaction.store.name}
                </p>
                <p className="mb-1 text-sm text-gray-600">{selectedTransaction.store.address}</p>
                <p className="mb-1">
                  <span className="font-semibold">Status: </span>
                  {selectedTransaction.status}
                </p>
                <p className="mb-1">
                  <span className="font-semibold">Tanggal: </span>
                  {new Date(selectedTransaction.createdAt).toLocaleString()}
                </p>

                {selectedTransaction.voucher && (
                  <p className="text-green-600 mt-2">
                    Voucher: {selectedTransaction.voucher.code}
                  </p>
                )}

                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Item:</h3>
                  {selectedTransaction.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 mb-2">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="text-sm">{item.product.name}</p>
                        <p className="text-xs text-gray-600">
                          {item.quantity} x Rp{item.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 font-bold text-xl">
                  Total: Rp{selectedTransaction.totalAmount.toLocaleString("id-ID")}
                </div>
              </>
            ) : (
              <p>Pilih transaksi untuk melihat detail.</p>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
