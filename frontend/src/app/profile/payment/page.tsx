// 'use client'

// import axiosInstance from '@/lib/rajaongkir'
// import React, { useEffect, useState } from 'react'
//  // sesuaikan path jika berbeda

// type Destination = {
//   subdistrict_id: number
//   subdistrict_name: string
//   city_id: number
//   city_name: string
//   province_id: number
//   province_name: string
//   postal_code: string
// }

// export default function RajaOngkirTestPage() {
//   const [keyword, setKeyword] = useState('53131')
//   const [results, setResults] = useState<Destination[]>([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const fetchDestinations = async (keyword: string) => {
//     setLoading(true)
//     setError(null)
//     try {
//       const response = await axiosInstance.get('/destination/search', {
//         params: { keyword },
//       })
//       setResults(response.data.data || [])
//     } catch (err: any) {
//       setError(err?.response?.data?.message || err.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchDestinations(keyword)
//   }, [])

//   return (
//     <div className="p-6">
//       <h1 className="text-xl font-bold mb-4">Test RajaOngkir Komerce (dengan Axios)</h1>
//       <input
//         type="text"
//         className="border px-3 py-2 rounded mb-4"
//         value={keyword}
//         onChange={(e) => setKeyword(e.target.value)}
//         placeholder="Masukkan kode pos atau kata kunci"
//       />
//       <button
//         className="bg-blue-600 text-white px-4 py-2 rounded ml-2"
//         onClick={() => fetchDestinations(keyword)}
//         disabled={loading}
//       >
//         Cari
//       </button>

//       {loading && <p className="mt-4">Memuat data...</p>}
//       {error && <p className="mt-4 text-red-500">Error: {error}</p>}

//       <ul className="mt-6 space-y-2">
//         {results.map((item) => (
//           <li key={item.subdistrict_id} className="border p-3 rounded shadow">
//             <p><strong>Kecamatan:</strong> {item.subdistrict_name}</p>
//             <p><strong>Kota:</strong> {item.city_name}</p>
//             <p><strong>Provinsi:</strong> {item.province_name}</p>
//             <p><strong>Kode Pos:</strong> {item.postal_code}</p>
//           </li>
//         ))}
//       </ul>
//     </div>
//   )
// }
