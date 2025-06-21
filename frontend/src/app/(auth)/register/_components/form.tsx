"use client";

import { Field, Form, Formik, FormikHelpers, FormikProps } from "formik";
import { useEffect, useState } from "react";
import * as yup from "yup";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react"; // Updated
import axios from "@/lib/axios";
import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";

// Validasi schema menggunakan Yup
const RegisterSchema = yup.object().shape({
  email: yup.string().email("Format email salah").required("Email wajib diisi"),
  password: yup.string().min(6, "Minimal 6 karakter").required("Password wajib diisi"),
  name: yup.string().required("Username wajib diisi"),
  referralCode: yup.string().optional(),
});

interface IRegisterForm {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
}

export default function FormRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // Trigger otomatis saat Google login berhasil
  useEffect(() => {
  const handleGoogleAuth = async () => {
    if (session?.user) {
      try {
        // Kirim data user Google ke backend
        await axios.post("/auth/google", {
          email: session.user.email,
          name: session.user.name,
        });

        toast.success("Akun Google berhasil didaftarkan, silakan login.");
        router.push("/login");
      } catch (error) {
        toast.error("Gagal mendaftar dengan Google.");
        console.error(error);
      }
    }
  };

  handleGoogleAuth();
}, [session, router]);


  const initialValues: IRegisterForm = {
    name: "",
    email: "",
    password: "",
    referralCode: "",
  };

  const onRegister = async (
    value: IRegisterForm,
    action: FormikHelpers<IRegisterForm>
  ) => {
    try {
      const { data } = await axios.post("/auth/register", value);
      toast.success(data.message);
      action.resetForm();
      router.push("/login");
    } catch (err) {
      console.log(err);
      toast.error("Terjadi kesalahan saat mendaftar.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Kiri */}
      <div className="lg:w-1/2 bg-gradient-to-r from-gray-300 p-10 flex flex-col justify-center items-center text-white">
        <h1 className="text-4xl text-black font-semibold mb-4">Welcome to Shop.co</h1>
        <p className="text-lg text-center mb-8 text-black">
          Daftar untuk memulai pengalaman belanja baju terbaik dan temukan penawaran spesial setiap hari!
        </p>
        <Image src="/main1.png" alt="Shop.co Logo" width={600} height={200} />
      </div>

      {/* Kanan */}
      <div className="lg:w-1/2 p-10 flex justify-center items-center">
        <Formik
          initialValues={initialValues}
          validationSchema={RegisterSchema}
          onSubmit={onRegister}
        >
          {(props: FormikProps<IRegisterForm>) => {
            const { touched, errors, isSubmitting } = props;
            return (
              <Form className="flex flex-col space-y-4 border px-10 pb-5 pt-5 border-gray-500 w-full max-w-sm">
                <div className="flex justify-center mb-6">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={150}
                    height={75}
                    className="object-contain"
                  />
                </div>

                <Field
                  placeholder="Email"
                  name="email"
                  type="email"
                  className="p-3 border border-gray-300 rounded-md shadow-md w-full"
                />
                {touched.email && errors.email && (
                  <div className="text-red-500 text-sm">{errors.email}</div>
                )}

                <div className="relative">
                  <Field
                    placeholder="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="p-3 pr-10 border border-gray-300 rounded-md shadow-md w-full"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <div className="text-red-500 text-sm">{errors.password}</div>
                )}

                <Field
                  placeholder="Name"
                  name="name"
                  type="text"
                  className="p-3 border border-gray-300 rounded-md shadow-md w-full"
                />
                {touched.name && errors.name && (
                  <div className="text-red-500 text-sm">{errors.name}</div>
                )}

                <Field
                  placeholder="Referral Code (optional)"
                  name="referralCode"
                  type="text"
                  className="p-3 border border-gray-300 rounded-md shadow-md w-full"
                />
                {touched.referralCode && errors.referralCode && (
                  <div className="text-red-500 text-sm">{errors.referralCode}</div>
                )}

                <button
                  className="bg-blue-500 text-white py-2 px-4 rounded-md mt-4 disabled:bg-gray-400"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Loading..." : "Daftar"}
                </button>

                <div className="flex items-center my-4">
                  <div className="flex-grow h-[1px] bg-gray-300" />
                  <span className="mx-2 text-sm text-gray-500">atau</span>
                  <div className="flex-grow h-[1px] bg-gray-300" />
                </div>

                {/* Tombol Login Google */}
                <button
                  type="button"
                  onClick={() => signIn("google")}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 w-full"
                >
                  <FcGoogle size={20} />
                  Daftar dengan Google
                </button>

                {/* Link login */}
                <div className="text-center mt-4">
                  <span className="text-sm text-gray-500">Sudah punya akun? </span>
                  <a href="/login" className="text-blue-500 hover:underline">
                    Login di sini
                  </a>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}
