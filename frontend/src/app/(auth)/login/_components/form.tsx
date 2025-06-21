"use client";

import { Field, Form, Formik, FormikHelpers, FormikProps } from "formik";
import { useState } from "react";
import * as yup from "yup";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import axios from "@/lib/axios";
import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";

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

  const onLogin = async (
    value: ILoginForm,
    action: FormikHelpers<ILoginForm>
  ) => {
    try {
      const { data } = await axios.post("/auth/login", value);
      const user = data.data;

      await signIn("credentials", {
        redirectTo: "/",
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
      });

      toast.success(data.message);
      action.resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat login.");
    }
  };
  const handleGoogleLogin = async () => {
    try {
      const googleResponse = await signIn("google", {
        redirect: false,
      });

      if (!googleResponse || !googleResponse.ok) {
        throw new Error("Gagal login dengan Google.");
      }

      // Ambil session Google yang sudah login
      const session = await fetch("/api/auth/session").then((res) => res.json());

      const googleUser = session?.user;
      if (!googleUser || !googleUser.email || !googleUser.name) {
        throw new Error("Data user Google tidak ditemukan.");
      }

      const { data } = await axios.post("/auth/google", {
        email: googleUser.email,
        name: googleUser.name,
        avatar: googleUser.image || "",
      });

      const user = data.data;


      await signOut({ redirect: false });

      await signIn("credentials", {
        redirectTo: "/",
        id: user.id,
        email: user.email,
        password: user.generatedPassword, 
        name: user.name,
        avatar: user.avatar ?? "",
        referralCode: user.referralCode ?? "",
        referralBy: user.referredBy ?? "",
        role: user.role,
        accessToken: data.access_token,
      });

      toast.success("Login dengan Google berhasil.");
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat login dengan Google.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <div className="lg:w-1/2 bg-gradient-to-r from-gray-300 p-10 flex flex-col justify-center items-center text-white">
        <h1 className="text-4xl text-black font-semibold mb-4">Welcome back</h1>
        <p className="text-lg text-center mb-8 text-black">
          Temukan berbagai koleksi baju terbaru di toko baju Shop.co, belanja dengan mudah dan aman, dan dapatkan penawaran spesial setiap hari!
        </p>
        <Image src="/main1.png" alt="Logo" width={600} height={200} />
      </div>

      <div className="lg:w-1/2 p-10 flex justify-center items-center">
        <Formik
          initialValues={initialValues}
          validationSchema={LoginSchema}
          onSubmit={onLogin}
        >
          {(props: FormikProps<ILoginForm>) => {
            const { touched, errors, isSubmitting } = props;
            return (
              <Form className="flex flex-col border px-10 pb-5 pt-5 border-gray-500 w-full max-w-sm">
                <div className="flex justify-center mb-6">
                  <Image src="/logo.png" alt="Logo IG" width={150} height={75} />
                </div>

                <Field
                  placeholder="Email"
                  name="email"
                  type="email"
                  className="mt-2 mb-1 p-2 border border-gray-300 placeholder:text-[14px] rounded-md shadow-md"
                />
                {touched.email && errors.email && (
                  <div className="text-red-500 text-[12px]">{errors.email}</div>
                )}

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

                <button
                  className="text-white py-2 px-3 mt-2 rounded-md bg-blue-500 disabled:bg-gray-400 disabled:cursor-none text-sm"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Loading..." : "Sign In"}
                </button>

                <div className="flex items-center my-3">
                  <div className="flex-grow h-[1px] bg-gray-300" />
                  <span className="mx-2 text-sm text-gray-500">or</span>
                  <div className="flex-grow h-[1px] bg-gray-300" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FcGoogle size={20} />
                  Login with Google
                </button>

                <div className="text-center mt-4">
                  <span className="text-sm text-gray-500">Don't have an account? </span>
                  <a href="/register" className="text-blue-500 hover:underline">Register here</a>
                </div>
                <div className="text-center mt-4">
                  <a href="/resetpassreq" className="text-blue-500 hover:underline">Forget Password</a>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}
