"use client";

import { useState } from "react";
import axios from "@/lib/axios";

type Destination = {
  city_id: string;
  city_name: string;
  province_name: string;
  type: "Kota" | "Kabupaten";
};

export default function RajaOngkirSearchPage() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const res = await axios.get("/rajaongkir/search", {
        params: { keyword },
      });

      if (res.data.success) {
        setResults(res.data.data);
      } else {
        setError("Tidak ada hasil ditemukan.");
      }
    } catch (err: any) {
      console.error("❌ Error:", err.message);
      setError("Gagal mengambil data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">🔍 Cari Kota dari Komerce API</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Contoh: padang"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading || !keyword.trim()}
        >
          {loading ? "Mencari..." : "Cari"}
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <ul className="space-y-2 mt-4">
        {results.map((dest) => (
          <li key={dest.city_id} className="border rounded p-2">
            {dest.type} {dest.city_name}, {dest.province_name}
          </li>
        ))}
      </ul>
    </div>
  );
}
