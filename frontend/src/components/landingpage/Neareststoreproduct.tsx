"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

type Store = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: number;
};

type Product = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  finalPrice: number;
  quantity: number;
  discount?: {
    id: string;
    amount: number;
    isPercentage: boolean;
    startDate: string;
    endDate: string;
  } | null;
};

export default function NearestProductsPage() {
  const { data: session, status } = useSession();
  const loadingSession = status === "loading";

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation tidak didukung browser Anda.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        if (!session?.accessToken) return;

        setLoading(true);
        try {
          const res = await axios.post(
            "/product/nearest",
            { latitude, longitude },
            {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            }
          );

          const data = res.data;
          setStore(data.nearestStore || null);
          setProducts(data.products || []);
        } catch (err) {
          console.error(err);
          setError("Gagal memuat data produk dari toko terdekat.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Izin lokasi ditolak. Tidak bisa memuat toko terdekat.");
      }
    );
  }, [session?.accessToken]);

  if (loadingSession) {
    return (
      <div className="text-center py-10">
        <Loader2 className="animate-spin h-6 w-6 mx-auto" />
        Memuat sesi...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-10">
        Silakan login untuk melihat produk terdekat.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="animate-spin h-6 w-6 mx-auto" />
        Memuat produk terdekat...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  const productsToShow = showAll ? products : products.slice(0, 4);

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Produk dari Toko Terdekat</h1>

      {store && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{store.name}</h2>
          <p className="text-gray-600">{store.address}</p>
          <p className="text-sm text-gray-500">
            Jarak:{" "}
            <span className="font-medium">{store.distance.toFixed(2)} km</span>
          </p>
        </div>
      )}

      <div className="w-full h-[400px] mb-6 rounded overflow-hidden">
        <MapContainer
          center={
            store?.latitude && store?.longitude
              ? [store.latitude, store.longitude]
              : userLocation
              ? [userLocation.lat, userLocation.lng]
              : [-6.2, 106.8]
          }
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]}>
              <Popup>Lokasi Anda</Popup>
            </Marker>
          )}
          {store?.latitude && store?.longitude && (
            <Marker position={[store.latitude, store.longitude]}>
              <Popup>{store.name}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">
          Tidak ada produk dari toko terdekat.
        </p>
      ) : (
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
{productsToShow.map((product) => (
  <Link
    key={product.id}
    href={`/detail/${product.id}`}
    className="border rounded-lg p-4 shadow-sm hover:shadow-md transition block"
  >
    <img
      src={product.imageUrl || "/default-product-image.png"}
      alt={product.name}
      className="w-full h-48 object-cover rounded-lg"
    />
    <div className="mt-4">
      <h3 className="font-semibold text-lg">{product.name}</h3>
      <p className="text-sm text-gray-600 truncate">
        {product.description || "Tidak ada deskripsi"}
      </p>

      {product.discount ? (
        <div className="mt-2">
          <p className="text-sm text-red-500 font-semibold">
            Diskon{" "}
            {product.discount.isPercentage
              ? `${product.discount.amount}%`
              : `Rp ${product.discount.amount.toLocaleString()}`}{" "}
            tersedia!
          </p>
          <p className="text-lg font-bold text-green-600">
            Rp {product.finalPrice.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 line-through">
            Rp {product.price.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">
            Berlaku s.d.{" "}
            {new Date(product.discount.endDate).toLocaleDateString("id-ID")}
          </p>
        </div>
      ) : (
        <p className="mt-2 text-xl font-semibold text-gray-800">
          Rp {product.price.toLocaleString()}
        </p>
      )}

      <p className="text-sm text-gray-500 mt-1 italic">
        Stok: {product.quantity}
      </p>
    </div>
  </Link>
))}
          </div>

          {products.length > 4 && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowAll((prev) => !prev)}
                className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition"
              >
                {showAll ? "Tampilkan Lebih Sedikit" : "Lihat Semua Produk"}
              </button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
