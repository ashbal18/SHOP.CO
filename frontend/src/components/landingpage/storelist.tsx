"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import Link from "next/link"; // Import Link from next.js

type Store = {
  id: string;
  name: string;
  address: string;
  adminId: string;
  createdAt: string;
  updatedAt: string;
};

export default function StoreList() {
  const { data: session, status } = useSession();
  const loadingSession = status === "loading";

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.accessToken) return;

    const fetchStores = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/store", {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        setStores(res.data.stores ?? res.data);
      } catch (error) {
        console.error("Failed to load stores", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [session]);

  if (loadingSession) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>Loading session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>You need to log in first.</p>
      </div>
    );
  }

  return (
    <main className="flex-1 p-8 overflow-auto max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Store List</h1>

      {/* Button to search for nearest store */}
      <div className="mb-8">
        <Link
          href="/nearest-store"
          className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-300"
        >
          Search for Nearest Store
        </Link>
      </div>

      {loading ? (
        <p>Loading stores...</p>
      ) : stores.length === 0 ? (
        <p>No stores available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {stores.map((store) => (
            <div
              key={store.id}
              className="flex flex-col p-6 bg-white shadow-xl rounded-lg border-2 hover:scale-105 transition-transform"
            >
              <div className="flex flex-col justify-between space-y-2">
                <h2 className="text-xl font-semibold">{store.name}</h2>
                <p className="text-gray-500 text-sm">{store.address}</p>
              </div>

              <a
                href={`https://maps.google.com/?q=${store.address}`}
                target="_blank"
                className="mt-4 px-4 py-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
              >
                View on Map
              </a>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
