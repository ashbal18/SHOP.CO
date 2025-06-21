// "use client";

// import { Field, Form, Formik, FormikHelpers, FormikProps } from "formik";
// import { useState } from "react";
// import * as yup from "yup";
// import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
// import Image from "next/image";
// import { signIn } from "next-auth/react"; // Import signIn for Google login

// import { toast } from "react-toastify";
// import { FcGoogle } from "react-icons/fc";
// import { useRouter } from "next/navigation"; // Import useRouter for redirect
// import axios from "@/lib/axios";

// // Schema untuk validasi form menggunakan Yup
// const RegisterSchema = yup.object().shape({
//   email: yup.string().email("Format email salah").required("email wajib diisi"),
//   password: yup
//     .string()
//     .min(6, "Minimal 6 karakter")
//     .required("password wajib diisi"),
//   name: yup.string().required("username wajib diisi"),
//   referralCode: yup.string().optional(), // Menambahkan validasi kode referral (optional)
// });

// interface IRegisterForm {
//   name: string;
//   email: string;
//   password: string;
//   referralCode?: string; // Tambahkan referralCode sebagai optional
// }

// export default function FormAdd() {
//   const [showPassword, setShowPassword] = useState(false); // Untuk toggle password visibility
//   const initialValues: IRegisterForm = {
//     name: "",
//     email: "",
//     password: "",
//     referralCode: "", // Default kosong
//   };
//   const router = useRouter(); // Initialize useRouter for redirect

//   // Fungsi untuk handle submit form
//   const onRegister = async (
//     value: IRegisterForm,
//     action: FormikHelpers<IRegisterForm>
//   ) => {
//     try {
//       const { data } = await axios.post("/super-admin", value);
//       toast.success(data.message);
//       action.resetForm();

//       // Redirect ke halaman login setelah registrasi berhasil
//       router.push("/login"); // Redirect to login page
//     } catch (err) {
//       console.log(err);
//       toast.error("Terjadi kesalahan saat mendaftar.");
//     }
//   };

//   return (
//     <div className="flex flex-col lg:flex-row min-h-screen">
//       {/* Left Section */}
//       <div className="lg:w-1/2 bg-gradient-to-r from-gray-300 p-10 flex flex-col justify-center items-center text-white">
//         <h1 className="text-4xl text-black font-semibold mb-4">Welcome to Shop.co</h1>
//         <p className="text-lg text-center mb-8 text-black">
//           Daftar untuk memulai pengalaman belanja baju terbaik dan temukan penawaran spesial setiap hari!
//         </p>

//         <Image src="/main1.png" alt="Shop.co Logo" width={600} height={200} />
//       </div>

//       {/* Right Section - Register Form */}
//       <div className="lg:w-1/2 p-10 flex justify-center items-center">
//         <Formik
//           initialValues={initialValues}
//           validationSchema={RegisterSchema}
//           onSubmit={onRegister}
//         >
//           {(props: FormikProps<IRegisterForm>) => {
//             const { touched, errors, isSubmitting } = props;
//             return (
//               <Form className="flex flex-col space-y-4 border px-10 pb-5 pt-5 border-gray-500 w-full max-w-sm">
//                 <div className="flex justify-center mb-6">
//                   <Image
//                     src="/logo.png"
//                     alt="Logo"
//                     width={150}
//                     height={75}
//                     className="object-contain"
//                   />
//                 </div>

//                 <Field
//                   placeholder="Email"
//                   name="email"
//                   type="email"
//                   className="p-3 border border-gray-300 rounded-md shadow-md w-full"
//                 />
//                 {touched.email && errors.email && (
//                   <div className="text-red-500 text-sm">{errors.email}</div>
//                 )}

//                 <div className="relative">
//                   <Field
//                     placeholder="Password"
//                     name="password"
//                     type={showPassword ? "text" : "password"}
//                     className="p-3 pr-10 border border-gray-300 rounded-md shadow-md w-full"
//                   />
//                   <button
//                     type="button"
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     {showPassword ? (
//                       <AiFillEyeInvisible size={20} />
//                     ) : (
//                       <AiFillEye size={20} />
//                     )}
//                   </button>
//                 </div>
//                 {touched.password && errors.password && (
//                   <div className="text-red-500 text-sm">{errors.password}</div>
//                 )}

//                 <Field
//                   placeholder="Name"
//                   name="name"
//                   type="text"
//                   className="p-3 border border-gray-300 rounded-md shadow-md w-full"
//                 />
//                 {touched.name && errors.name && (
//                   <div className="text-red-500 text-sm">{errors.name}</div>
//                 )}

//                 {/* Referral Code (Optional) */}
//                 <Field
//                   placeholder="Referral Code (optional)"
//                   name="referralCode"
//                   type="text"
//                   className="p-3 border border-gray-300 rounded-md shadow-md w-full"
//                 />
//                 {touched.referralCode && errors.referralCode && (
//                   <div className="text-red-500 text-sm">{errors.referralCode}</div>
//                 )}

//                 <button
//                   className="bg-blue-500 text-white py-2 px-4 rounded-md mt-4 disabled:bg-gray-400"
//                   type="submit"
//                   disabled={isSubmitting}
//                 >
//                   {isSubmitting ? "Loading..." : "Daftar"}
//                 </button>

//                 {/* Divider */}
//                 <div className="flex items-center my-4">
//                   <div className="flex-grow h-[1px] bg-gray-300" />
//                   <span className="mx-2 text-sm text-gray-500">atau</span>
//                   <div className="flex-grow h-[1px] bg-gray-300" />
//                 </div>

//                 {/* Google Login Button */}
//                 <button
//                   type="button"
//                   onClick={() => signIn("google", { callbackUrl: "/" })}
//                   className="flex items-center justify-center gap-2 py-2 px-3 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 w-full"
//                 >
//                   <FcGoogle size={20} />
//                   Daftar dengan Google
//                 </button>

//                 {/* Login Link */}
//                 <div className="text-center mt-4">
//                   <span className="text-sm text-gray-500">Already have an account? </span>
//                   <a href="/login" className="text-blue-500 hover:underline">
//                     Login here
//                   </a>
//                 </div>
//               </Form>
//             );
//           }}
//         </Formik>
//       </div>
//     </div>
//   );
// }
