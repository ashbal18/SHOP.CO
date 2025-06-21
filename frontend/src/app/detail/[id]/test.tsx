// "use client";

// import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import Image from "next/image";
// import axios from "@/lib/axios";
// import { AxiosError } from "axios";
// import { toast } from "react-toastify";

// interface Store {
//   id: string;
//   name: string;
//   address: string;
// }

// interface Stock {
//   id: string;
//   quantity: number;
//   store: Store;
// }

// interface Category {
//   id: string;
//   name: string;
// }

// interface Product {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   imageUrl?: string;
//   category?: Category;
//   stocks?: Stock[];
// }

// export default function ProductDetailPage({
//   params,
// }: {
//   params: { id: string }; // langsung objek, bukan Promise
// }) {
//   // Get id from params
//   const { id } = params;
//   const { data: session, status } = useSession();

//   const [product, setProduct] = useState<Product | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProduct = async () => {
//       if (!id || status !== "authenticated") {
//         setLoading(false);
//         return;
//       }

//       try {
//         const token = session?.accessToken;

//         const res = await axios.get<Product>(`/product/${id}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         console.log("Product detail:", res.data);
//         setProduct(res.data);
//       } catch (err) {
//         console.error("Error fetching product:", err);
//         if (err instanceof AxiosError) {
//           toast.error(err.response?.data.message || "Failed to load product");
//         } else {
//           toast.error("Failed to load product");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProduct();
//   }, [id, session, status]);

//   if (loading) {
//     return <div className="p-10 text-center text-gray-600">Loading...</div>;
//   }

//   if (!product) {
//     return <div className="p-10 text-center text-red-500">Product not found</div>;
//   }

//   return (
//     <div className="bg-white max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
//       {/* LEFT: Image */}
//       <div>
//         <Image
//           src={product.imageUrl || "/default-product-image.png"}
//           alt={product.name || "Product Image"}
//           width={500}
//           height={500}
//           className="rounded-lg mx-auto"
//         />
//       </div>

//       {/* RIGHT: Detail */}
//       <div>
//         <p className="text-sm text-gray-500 mb-1">
//           Category: <span className="font-semibold">{product.category?.name}</span>
//         </p>
//         <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
//         <p className="text-gray-700 mb-4 text-base">{product.description}</p>

//         <div className="text-xl font-bold mb-6 text-black">
//           Rp {Number(product.price).toLocaleString("id-ID")}
//         </div>

//         <div className="mb-6">
//           <h2 className="text-lg font-semibold mb-2">Available at Store(s):</h2>
//           {product.stocks?.length ? (
//             product.stocks.map((stock) => (
//               <div
//                 key={stock.id}
//                 className="mb-4 p-4 border rounded-md bg-gray-50 shadow-sm"
//               >
//                 <p className="font-semibold text-gray-800">{stock.store.name}</p>
//                 <p className="text-sm text-gray-600">{stock.store.address}</p>
//                 <p className="text-sm mt-1">
//                   Stock:{" "}
//                   <span className="font-bold text-green-700">{stock.quantity}</span>
//                 </p>
//               </div>
//             ))
//           ) : (
//             <p className="text-sm text-red-500">No stock available</p>
//           )}
//         </div>

//         <div className="flex space-x-4">
//           <button className="px-6 py-2 border rounded hover:bg-gray-100">
//             Add to Cart
//           </button>
//           <button className="px-6 py-2 bg-black text-white rounded">
//             Buy Now
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
