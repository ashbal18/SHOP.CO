// "use client";
// import { useState, useEffect } from "react";
// import { useParams } from "next/navigation"; // To access the product ID from the URL
// import axios from "@/lib/axios";
// import Image from "next/image";
// import { FaStar } from "react-icons/fa";
// import { AxiosError } from "axios";
// import NewArrivalsSection from "../landingpage/ProductGrid";
// import TopSellingSection from "../landingpage/topselling";

// export default function ProductDetailPage() {
//   const [product, setProduct] = useState<any | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showSection, setShowSection] = useState<string>("newArrivals");
//   const params = useParams();
//   const id = params?.id; // Get the product ID from the URL

//   useEffect(() => {
//     if (id) {
//       const fetchProduct = async () => {
//         try {
//           setIsLoading(true);
//           const response = await axios.get(`/product/${id}`); 
//           setProduct(response.data); 
//         } catch (err) {
//           setError("Failed to load product details");
//           console.error(err);
//         } finally {
//           setIsLoading(false);
//         }
//       };

//       fetchProduct();
//     }
//   }, [id]);

//   // If the product is still loading
//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen">
//         <div className="animate-spin h-10 w-10 border-4 border-t-4 border-gray-500 rounded-full"></div>
//         <span>Loading product details...</span>
//       </div>
//     );
//   }

//   // If there's an error in loading the product
//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen">
//         <p className="text-red-500">{error}</p>
//       </div>
//     );
//   }

//   if (!product) return null; // If no product data is fetched

//   return (
//     <div className="bg-white">
//       {/* Main Section */}
//       <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
//         {/* Left Images */}
//         <div>
//           <div className="grid grid-cols-4 gap-3 mb-4">
//             {product.images?.map((img: string, i: number) => (
//               <Image
//                 key={i}
//                 src={img}
//                 alt={`thumb-${i}`}
//                 width={80}
//                 height={80}
//                 className={`rounded cursor-pointer border ${
//                   product.selectedImage === img ? "border-black" : "border-gray-200"
//                 }`}
//                 onClick={() => setProduct({ ...product, selectedImage: img })}
//               />
//             ))}
//           </div>
//           <Image
//             src={product.selectedImage || (product.images && product.images[0]) || "/placeholder.png"}
//             alt="Product"
//             width={500}
//             height={500}
//             className="rounded-lg mx-auto"
//           />
//         </div>

//         {/* Right Info */}
//         <div>
//           <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
//           <div className="flex items-center mb-2 text-yellow-500">
//             {[...Array(5)].map((_, i) => (
//               <FaStar
//                 key={i}
//                 className={
//                   i < Math.floor(product.rating)
//                     ? "text-yellow-400"
//                     : "text-gray-300"
//                 }
//               />
//             ))}
//             <span className="ml-2 text-gray-600">({product.reviews} Reviews)</span>
//           </div>

//           <div className="mb-4 text-xl">
//             <span className="font-bold text-black">${product.price}</span>
//             {product.originalPrice && (
//               <>
//                 <span className="ml-2 line-through text-gray-500">
//                   ${product.originalPrice}
//                 </span>
//                 <span className="ml-2 text-red-500 font-semibold">
//                   {`-${Math.round(
//                     ((product.originalPrice - product.price) /
//                       product.originalPrice) *
//                       100
//                   )}%`}
//                 </span>
//               </>
//             )}
//           </div>

//           <p className="text-gray-700 mb-4 text-sm max-w-lg">
//             {product.description}
//           </p>

//           {/* Colors */}
//           <div className="mb-4">
//             <h3 className="font-semibold mb-1">Choose Color:</h3>
//             <div className="flex space-x-2">
//               {product.colors?.map((color: string, idx: number) => (
//                 <div
//                   key={idx}
//                   onClick={() => setProduct({ ...product, selectedColor: color })}
//                   className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
//                     product.selectedColor === color ? "border-black" : "border-gray-300"
//                   }`}
//                   style={{ backgroundColor: color }}
//                 />
//               ))}
//             </div>
//           </div>

//           {/* Sizes */}
//           <div className="mb-4">
//             <h3 className="font-semibold mb-1">Choose Size:</h3>
//             <div className="flex space-x-2">
//               {product.sizes?.map((size: string, idx: number) => (
//                 <button
//                   key={idx}
//                   onClick={() => setProduct({ ...product, selectedSize: size })}
//                   className={`px-4 py-1 border rounded ${
//                     product.selectedSize === size ? "bg-black text-white" : "bg-white"
//                   }`}
//                 >
//                   {size}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="flex space-x-4 mb-4">
//             <button className="px-6 py-2 border rounded hover:bg-gray-100">
//               Add to Cart
//             </button>
//             <button className="px-6 py-2 bg-black text-white rounded">
//               Buy Now
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Section Toggle Buttons */}
//       <div className="text-center mb-6">
//         <button
//           onClick={() => setShowSection("newArrivals")}
//           className={`px-6 py-3 ${showSection === "newArrivals" ? "bg-black text-white" : "bg-gray-300 text-black"} rounded-full hover:bg-gray-800 transition-colors duration-300`}
//         >
//           New Arrivals
//         </button>
//         <button
//           onClick={() => setShowSection("topSelling")}
//           className={`ml-4 px-6 py-3 ${showSection === "topSelling" ? "bg-black text-white" : "bg-gray-300 text-black"} rounded-full hover:bg-gray-800 transition-colors duration-300`}
//         >
//           Top Selling
//         </button>
//       </div>

//       {/* Conditional Rendering Based on Selected Section */}
//       {showSection === "newArrivals" && <NewArrivalsSection />}
//       {showSection === "topSelling" && <TopSellingSection />}
//     </div>
//   );
// }
