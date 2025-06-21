// "use client";

// import { useState, useEffect } from "react";
// import { useParams } from "next/navigation";
// import axios from "@/lib/axios"; // Adjust according to your project structure
// import { Loader2 } from "lucide-react";

// const ProductDetail = () => {
//   const [product, setProduct] = useState<any | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const params = useParams();
//   const id = params?.id; // Extract product ID from the URL

//   useEffect(() => {
//     if (!id) return; // Wait for the product ID to be available

//     const fetchProduct = async () => {
//       try {
//         console.log("Fetching product with ID:", id);
//         const response = await axios.get(`/product/${id}`); // Replace with actual API endpoint
//         setProduct(response.data); // Assuming the API returns product data
//       } catch (err: any) {
//         setError("Failed to load product details");
//         console.error(err);
//       } finally {
//         setIsLoading(false);
//       }
//     };
    

//     fetchProduct();
//   }, [id]); // Re-run when the product ID changes

//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen">
//         <Loader2 className="animate-spin h-10 w-10" />
//         <span>Loading product details...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen">
//         <p className="text-red-500">{error}</p>
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen">
//         <p className="text-gray-500">Product not found</p>
//       </div>
//     );
//   }

//   return (
//     <section className="w-full bg-white py-12 px-6">
//       <div className="max-w-7xl mx-auto">
//         <h2 className="text-3xl font-extrabold text-gray-900">{product.name}</h2>
//         <div className="flex flex-col sm:flex-row mt-8">
//           <div className="sm:w-1/2">
//             <img
//               src={product.imageUrl || "/default-product-image.png"} // Default image if none exists
//               alt={product.name}
//               className="w-full h-auto rounded-lg"
//             />
//           </div>
//           <div className="sm:w-1/2 sm:pl-8 mt-4 sm:mt-0">
//             <h3 className="text-lg text-gray-600">Description:</h3>
//             <p className="mt-2 text-gray-700">{product.description}</p>
//             <div className="flex items-center mt-4">
//               <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
//             </div>
//             <p className="mt-2 text-xl font-semibold text-gray-800">${product.price}</p>
//             <button className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg">
//               Add to Cart
//             </button>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default ProductDetail;
