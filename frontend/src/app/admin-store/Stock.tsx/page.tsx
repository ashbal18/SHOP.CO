// import React, { useState } from "react";
// import Layout from "../components/Layout";
// import { Product } from "./Products";

// interface StockManagementProps {
//   products: Product[];
//   onUpdateStock: (id: number, amount: number) => void;
// }

// const StockManagement: React.FC<StockManagementProps> = ({ products, onUpdateStock }) => {
//   const [selectedProductId, setSelectedProductId] = useState<number>(products[0]?.id || 0);
//   const [stockChange, setStockChange] = useState<number>(0);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onUpdateStock(selectedProductId, stockChange);
//     setStockChange(0);
//   };

//   return (
//     <Layout>
//       <h2 className="text-2xl font-semibold mb-6">Manajemen Stok</h2>
//       <form onSubmit={handleSubmit} className="max-w-md bg-white p-6 rounded shadow-md">
//         <div className="mb-4">
//           <label className="block mb-1">Pilih Produk</label>
//           <select
//             value={selectedProductId}
//             onChange={(e) => setSelectedProductId(Number(e.target.value))}
//             className="w-full border px-3 py-2 rounded"
//           >
//             {products.map((p) => (
//               <option key={p.id} value={p.id}>
//                 {p.name} (Stok: {p.stock})
//               </option>
//             ))}
//           </select>
//         </div>
//         <div className="mb-4">
//           <label className="block mb-1">Tambah/Kurangi Stok</label>
//           <input
//             type="number"
//             value={stockChange}
//             onChange={(e) => setStockChange(Number(e.target.value))}
//             className="w-full border px-3 py-2 rounded"
//             placeholder="Masukkan jumlah (+ untuk tambah, - untuk kurangi)"
//           />
//         </div>
//         <button
//           type="submit"
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           Update Stok
//         </button>
//       </form>

//       <div className="mt-10 overflow-x-auto">
//         <table className="min-w-full bg-white border rounded-md">
//           <thead>
//             <tr>
//               <th className="px-4 py-2 border">Produk</th>
//               <th className="px-4 py-2 border">Stok</th>
//             </tr>
//           </thead>
//           <tbody>
//             {products.map((p) => (
//               <tr key={p.id}>
//                 <td className="border px-4 py-2">{p.name}</td>
//                 <td className="border px-4 py-2">{p.stock}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </Layout>
//   );
// };

// export default StockManagement;
