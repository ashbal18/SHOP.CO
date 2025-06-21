// "use client";

// import { useState, ChangeEvent, FormEvent, useEffect, useRef } from "react";
// import axios from "@/lib/axios"; // pastikan path axios benar
// import { useSession } from "next-auth/react";

// interface AddressFormData {
//   address_name: string;
//   address: string;
//   subdistrict: string;
//   city: string;
//   province: string;
//   postcode: string;
//   is_primary: boolean;
// }

// interface CreateAddressModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSuccess: () => void;
// }

// export default function CreateAddressModal({ isOpen, onClose, onSuccess }: CreateAddressModalProps) {
//   const { data: session } = useSession();

//   const [formData, setFormData] = useState<AddressFormData>({
//     address_name: "",
//     address: "",
//     subdistrict: "",
//     city: "",
//     province: "",
//     postcode: "",
//     is_primary: false,
//   });
//   const [message, setMessage] = useState<string | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const modalRef = useRef<HTMLDivElement>(null);

//   // Tutup modal saat klik di luar konten modal
//   useEffect(() => {
//     function handleOutsideClick(e: MouseEvent) {
//       if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
//         onClose();
//       }
//     }
//     if (isOpen) {
//       document.addEventListener("mousedown", handleOutsideClick);
//     } else {
//       document.removeEventListener("mousedown", handleOutsideClick);
//     }
//     return () => {
//       document.removeEventListener("mousedown", handleOutsideClick);
//     };
//   }, [isOpen, onClose]);

//   // Reset form dan pesan saat modal dibuka
//   useEffect(() => {
//     if (isOpen) {
//       setFormData({
//         address_name: "",
//         address: "",
//         subdistrict: "",
//         city: "",
//         province: "",
//         postcode: "",
//         is_primary: false,
//       });
//       setMessage(null);
//     }
//   }, [isOpen]);

//   const handleChange = (
//     e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const target = e.target;
//     const { name, value, type } = target;
//     const checked = (target as HTMLInputElement).checked;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setMessage(null);

//     try {
//       if (!session?.accessToken) {
//         setMessage("Token tidak ditemukan, silakan login ulang.");
//         setIsSubmitting(false);
//         return;
//       }

//       const res = await axios.post("/address", formData, {
//         headers: {
//           Authorization: `Bearer ${session.accessToken}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (res.status === 201 || res.status === 200) {
//         setMessage("Alamat berhasil dibuat ✅");
//         onSuccess();
//         setTimeout(() => {
//           onClose();
//           setMessage(null);
//         }, 1500);
//       } else {
//         setMessage("Gagal membuat alamat.");
//       }
//     } catch (error: any) {
//       console.error(error);
//       setMessage(
//         error.response?.data?.message || "Terjadi kesalahan saat membuat alamat."
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <>
//       {/* Backdrop */}
//       <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center" />

//       {/* Modal */}
//       <div
//         ref={modalRef}
//         className="fixed z-50 max-w-xl w-full bg-white rounded-lg shadow-lg p-6 mx-4 md:mx-0"
//         role="dialog"
//         aria-modal="true"
//         aria-labelledby="modal-title"
//       >
//         <div className="flex justify-between items-center mb-4">
//           <h2 id="modal-title" className="text-xl font-bold">
//             Buat Alamat Baru
//           </h2>
//           <button
//             onClick={onClose}
//             aria-label="Close modal"
//             className="text-gray-500 hover:text-gray-700 focus:outline-none"
//           >
//             &#x2715;
//           </button>
//         </div>

//         {message && (
//           <p
//             className={`mb-4 text-center px-4 py-2 rounded ${
//               message.includes("berhasil")
//                 ? "bg-green-100 text-green-700"
//                 : "bg-red-100 text-red-700"
//             }`}
//           >
//             {message}
//           </p>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4 text-left">
//           <div>
//             <label
//               htmlFor="address_name"
//               className="block mb-1 font-semibold text-gray-700"
//             >
//               Nama Alamat
//             </label>
//             <input
//               type="text"
//               id="address_name"
//               name="address_name"
//               value={formData.address_name}
//               onChange={handleChange}
//               required
//               className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//           </div>

//           <div>
//             <label
//               htmlFor="address"
//               className="block mb-1 font-semibold text-gray-700"
//             >
//               Alamat
//             </label>
//             <textarea
//               id="address"
//               name="address"
//               rows={3}
//               value={formData.address}
//               onChange={handleChange}
//               required
//               className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//           </div>

//           <div>
//             <label
//               htmlFor="subdistrict"
//               className="block mb-1 font-semibold text-gray-700"
//             >
//               Kecamatan
//             </label>
//             <input
//               type="text"
//               id="subdistrict"
//               name="subdistrict"
//               value={formData.subdistrict}
//               onChange={handleChange}
//               className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//           </div>

//           <div>
//             <label
//               htmlFor="city"
//               className="block mb-1 font-semibold text-gray-700"
//             >
//               Kota
//             </label>
//             <input
//               type="text"
//               id="city"
//               name="city"
//               value={formData.city}
//               onChange={handleChange}
//               required
//               className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//           </div>

//           <div>
//             <label
//               htmlFor="province"
//               className="block mb-1 font-semibold text-gray-700"
//             >
//               Provinsi
//             </label>
//             <input
//               type="text"
//               id="province"
//               name="province"
//               value={formData.province}
//               onChange={handleChange}
//               required
//               className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//           </div>

//           <div>
//             <label
//               htmlFor="postcode"
//               className="block mb-1 font-semibold text-gray-700"
//             >
//               Kode Pos
//             </label>
//             <input
//               type="text"
//               id="postcode"
//               name="postcode"
//               value={formData.postcode}
//               onChange={handleChange}
//               className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//           </div>

//           <div className="flex items-center">
//             <input
//               type="checkbox"
//               id="is_primary"
//               name="is_primary"
//               checked={formData.is_primary}
//               onChange={handleChange}
//               className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
//             />
//             <label
//               htmlFor="is_primary"
//               className="ml-2 block text-sm text-gray-700 select-none"
//             >
//               Jadikan alamat utama
//             </label>
//           </div>

//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="w-full rounded bg-indigo-600 py-3 px-4 text-white font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
//           >
//             {isSubmitting ? "Menyimpan..." : "Buat Alamat"}
//           </button>
//         </form>
//       </div>
//     </>
//   );
// }
