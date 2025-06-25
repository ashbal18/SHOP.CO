"use client";

import { Field, Form, Formik, FormikHelpers, FormikProps } from "formik";
import { useState } from "react";
import * as yup from "yup";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Image from "next/image";
import { signIn } from "next-auth/react";
import axios from "@/lib/axios";
import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

const LoginSchema = yup.object().shape({
  email: yup.string().email("Format email salah").required("email wajib diisi"),
  password: yup.string().min(6, "Minimal 6 karakter").required("password wajib diisi"),
});

interface ILoginForm {
  email: string;
  password: string;
}

export default function FormLogin() {
  const [showPassword, setShowPassword] = useState(false);

  const initialValues: ILoginForm = {
    email: "",
    password: "",
  };

  const onLogin = async (value: ILoginForm, action: FormikHelpers<ILoginForm>) => {
    try {
      const { data } = await axios.post("/auth/login", value);
      const user = data.data;

      const res = await signIn("credentials", {
        redirect: false,
        id: user.id,
        email: user.email,
        password: value.password,
        name: user.name,
        avatar: user.avatar ?? "",
        referralCode: user.referralCode ?? "",
        referralBy: user.referredBy ?? "",
        role: user.role,
        storeId: user.storeId ?? null,
        accessToken: data.access_token,
        callbackUrl: "/",
      });

      if (res?.ok && res.url) {
        toast.success(data.message);
        action.resetForm();
        window.location.href = res.url;
      } else {
        toast.error("Email atau password salah");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat login.");
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", {
      prompt: "select_account", // akan selalu tampilkan dialog pemilihan akun
      callbackUrl: "/", // setelah login diarahkan ke halaman utama
    });
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Kiri - Gambar dan Info */}
      <div className="lg:w-1/2 bg-gradient-to-r from-gray-300 p-10 flex flex-col justify-center items-center text-white">
        <h1 className="text-4xl text-black font-semibold mb-4">Welcome back</h1>
        <p className="text-lg text-center mb-8 text-black">
          Temukan berbagai koleksi baju terbaru di toko baju Shop.co, belanja
          dengan mudah dan aman, dan dapatkan penawaran spesial setiap hari!
        </p>
        <Image src="/main1.png" alt="Logo" width={600} height={200} />
      </div>

      {/* Kanan - Form Login */}
      <div className="lg:w-1/2 p-10 flex justify-center items-center">
        <Formik initialValues={initialValues} validationSchema={LoginSchema} onSubmit={onLogin}>
          {(props: FormikProps<ILoginForm>) => {
            const { touched, errors, isSubmitting } = props;
            return (
              <Form className="flex flex-col border px-10 pb-5 pt-5 border-gray-500 w-full max-w-sm">
                <div className="flex justify-center mb-6">
                  <Image src="/logo.png" alt="Logo IG" width={150} height={75} />
                </div>

                {/* Email Field */}
                <Field
                  placeholder="Email"
                  name="email"
                  type="email"
                  className="mt-2 mb-1 p-2 border border-gray-300 placeholder:text-[14px] rounded-md shadow-md"
                />
                {touched.email && errors.email && (
                  <div className="text-red-500 text-[12px]">{errors.email}</div>
                )}

                {/* Password Field */}
                <div className="relative">
                  <Field
                    placeholder="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="mt-2 mb-1 p-2 pr-10 border border-gray-300 placeholder:text-[14px] rounded-md shadow-md w-full"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <div className="text-red-500 text-[12px]">{errors.password}</div>
                )}

                {/* Submit Button */}
                <button
                  className="text-white py-2 px-3 mt-2 rounded-md bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Loading..." : "Sign In"}
                </button>

                {/* Divider */}
                <div className="flex items-center my-3">
                  <div className="flex-grow h-[1px] bg-gray-300" />
                  <span className="mx-2 text-sm text-gray-500">or</span>
                  <div className="flex-grow h-[1px] bg-gray-300" />
                </div>

                {/* Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FcGoogle size={20} />
                  Login with Google
                </button>

                {/* Link ke Register */}
                <div className="text-center mt-4">
                  <span className="text-sm text-gray-500">Don't have an account? </span>
                  <Link href="/register" className="text-blue-500 hover:underline">Register here</Link>
                </div>

                {/* Link ke Lupa Password */}
                <div className="text-center mt-4">
                  <Link href="/resetpassreq" className="text-blue-500 hover:underline">Forget Password</Link>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}
