"use client";

import { Field, Form, Formik, FormikHelpers, FormikProps } from "formik";
import { useState } from "react";
import * as yup from "yup";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { toast } from "react-toastify";
import axios from "@/lib/axios";

const RegisterSchema = yup.object().shape({
  email: yup.string().email("Format email salah").required("Email wajib diisi"),
  password: yup
    .string()
    .min(6, "Minimal 6 karakter")
    .required("Password wajib diisi"),
  name: yup.string().required("Username wajib diisi"),
  referralCode: yup.string().optional(),
});

interface IRegisterForm {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
}


export interface Store {
  id: string;
  name: string;
  location: string;
}
// Import tipe StoreAdmin dari halaman induk (atau definisikan juga di sini)
export interface StoreAdmin {
  id: string;
  name: string;
  email: string;
  roles: string;
  store?: {
    name: string;
    location: string;
  } | null;
}

interface AddStoreAdminModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleAddUser: (userData: StoreAdmin) => void; // menerima tipe StoreAdmin lengkap
}

export default function AddStoreAdminModal({
  isOpen,
  setIsOpen,
  handleAddUser,
}: AddStoreAdminModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const initialValues: IRegisterForm = {
    name: "",
    email: "",
    password: "",
  };

  if (!isOpen) return null;

  const onSubmit = async (
    value: IRegisterForm,
    action: FormikHelpers<IRegisterForm>
  ) => {
    try {
      const response = await axios.post("/super-admin", value);

      if (response.status === 201) {
        // Asumsi response.data berisi data StoreAdmin lengkap yang baru dibuat
        const newStoreAdmin: StoreAdmin = response.data;
        handleAddUser(newStoreAdmin);
        toast.success("Store Admin berhasil ditambahkan!");
        action.resetForm();
        setIsOpen(false);
      } else {
        toast.error("Terjadi kesalahan saat mendaftar.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat mendaftar.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Tambah Store Admin</h2>
          <button
            className="text-gray-600 text-xl"
            onClick={() => setIsOpen(false)}
          >
            &times;
          </button>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={RegisterSchema}
          onSubmit={onSubmit}
        >
          {(props: FormikProps<IRegisterForm>) => {
            const { touched, errors, isSubmitting } = props;
            return (
              <Form className="flex flex-col space-y-4">
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
                    {showPassword ? (
                      <AiFillEyeInvisible size={20} />
                    ) : (
                      <AiFillEye size={20} />
                    )}
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

                <button
                  className="bg-blue-500 text-white py-2 px-4 rounded-md mt-4 disabled:bg-gray-400"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Loading..." : "Daftar"}
                </button>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}
