// "use client";

// import { useSession } from "next-auth/react";
// import { useEffect, useState } from "react";
// import axios from "@/lib/axios";
// import dynamic from "next/dynamic";
// import "leaflet/dist/leaflet.css";

// const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
// const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
// const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
// const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

// type Store = {
//   id: string;
//   name: string;
//   address: string;
//   latitude?: number;
//   longitude?: number;
//   distance?: number;
// };

// type Product = {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   imageUrl?: string;
// };

// function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
//   const R = 6371;
//   const dLat = deg2rad(lat2 - lat1);
//   const dLon = deg2rad(lon2 - lon1);
//   const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//             Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
//             Math.sin(dLon / 2) * Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// }

// function deg2rad(deg: number): number {
//   return deg * (Math.PI / 180);
// }

// export default function NearestStorePage() {
//   const { data: session, status } = useSession();
//   const loadingSession = status === "loading";

//   const [stores, setStores] = useState<Store[]>([]);
//   const [selectedStore, setSelectedStore] = useState<Store | null>(null);
//   const [storeProducts, setStoreProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

//   useEffect(() => {
//     if (!navigator.geolocation) {
//       setError("Geolocation not supported.");
//       return;
//     }
//     navigator.geolocation.getCurrentPosition(
//       pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
//       () => setError("Unable to access your location.")
//     );
//   }, []);

//   useEffect(() => {
//     if (!session?.accessToken || !userLocation) return;

//     const fetchStores = async () => {
//       setLoading(true);
//       try {
//         const res = await axios.get("/store/", {
//           headers: { Authorization: `Bearer ${session.accessToken}` },
//         });
//         const storeList: Store[] = res.data.stores ?? res.data;
//         const storesWithDistance = storeList.map(store => {
//           const { latitude, longitude } = store;
//           const distance = latitude && longitude
//             ? getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, latitude, longitude)
//             : undefined;
//           return { ...store, distance };
//         });
//         storesWithDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
//         setStores(storesWithDistance);
//       } catch (err) {
//         console.error(err);
//         setError("Failed to load stores.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStores();
//   }, [session?.accessToken, userLocation]);

//   const fetchStoreProducts = async (storeId: string) => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`/product/store/${storeId}`, {
//         headers: { Authorization: `Bearer ${session?.accessToken}` },
//       });
//       setStoreProducts(res.data.products ?? res.data);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to load products.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSelectStore = (store: Store) => {
//     setSelectedStore(store);
//     fetchStoreProducts(store.id);
//   };

//   if (loadingSession) return <p>Loading session...</p>;
//   if (!session) return <p>You must be logged in.</p>;
//   if (loading) return <p>Loading...</p>;
//   if (error) return <p className="text-red-500">{error}</p>;

//   return (
//     <main className="max-w-7xl mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-6">Nearest Stores</h1>

//       <div style={{ height: "400px", width: "100%" }} className="mb-8">
//         <MapContainer center={userLocation ?? { lat: -6.2, lng: 106.8 }} zoom={13} style={{ height: "100%", width: "100%" }}>
//           <TileLayer
//             attribution='&copy; OpenStreetMap contributors'
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           />
//           {userLocation && (
//             <Marker position={[userLocation.lat, userLocation.lng]}>
//               <Popup>You are here</Popup>
//             </Marker>
//           )}
//           {stores.map((store) =>
//             store.latitude && store.longitude ? (
//               <Marker key={store.id} position={[store.latitude, store.longitude]}>
//                 <Popup>
//                   <strong>{store.name}</strong>
//                   <br />
//                   {store.address}
//                   {store.distance !== undefined && (
//                     <>
//                       <br />
//                       <span>{store.distance.toFixed(2)} km</span>
//                     </>
//                   )}
//                   <br />
//                   <button
//                     className="text-blue-600 underline"
//                     onClick={() => handleSelectStore(store)}
//                   >
//                     View Products
//                   </button>
//                 </Popup>
//               </Marker>
//             ) : null
//           )}
//         </MapContainer>
//       </div>

//       <h2 className="text-2xl font-semibold mb-4">Store List</h2>
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
//         {stores.map((store) => (
//           <div key={store.id} className="p-4 border rounded-lg shadow hover:shadow-md">
//             <h3 className="text-lg font-bold">{store.name}</h3>
//             <p>{store.address}</p>
//             {store.distance !== undefined && (
//               <p className="text-sm text-gray-600">{store.distance.toFixed(2)} km away</p>
//             )}
//             <button
//               onClick={() => handleSelectStore(store)}
//               className="mt-2 text-blue-600 underline"
//             >
//               View Products
//             </button>
//           </div>
//         ))}
//       </div>

//       {selectedStore && (
//         <section>
//           <h2 className="text-xl font-bold mb-4">Products from {selectedStore.name}</h2>
//           {storeProducts.length === 0 ? (
//             <p>No products found for this store.</p>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//               {storeProducts.map((product) => (
//                 <div key={product.id} className="border p-4 rounded-lg shadow hover:shadow-md">
//                   {product.imageUrl && (
//                     <img
//                       src={product.imageUrl}
//                       alt={product.name}
//                       className="h-40 w-full object-cover rounded mb-2"
//                     />
//                   )}
//                   <h3 className="text-lg font-semibold">{product.name}</h3>
//                   <p className="text-gray-600">{product.description}</p>
//                   <p className="font-bold mt-1">Rp {product.price.toLocaleString()}</p>
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>
//       )}
//     </main>
//   );
// }
