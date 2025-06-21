"use client";

import { Field, Form, Formik, FormikHelpers, FormikProps } from "formik";
import { useState } from "react";
import * as yup from "yup";
import Image from "next/image";
import axios from "@/lib/axios";
import { toast } from "react-toastify";


// Validation schema using Yup
const ResetPasswordSchema = yup.object().shape({
  email: yup.string().email("Invalid email format").required("Email is required"),
});

interface IResetPasswordForm {
  email: string;
}

export default function ResetPasswordRequest() {
  const [showPassword, setShowPassword] = useState(false);

  // Initial values for the form
  const initialValues: IResetPasswordForm = {
    email: "",
  };

  // Handle reset password request
  const onResetPassword = async (
    value: IResetPasswordForm,
    action: FormikHelpers<IResetPasswordForm>
  ) => {
    try {
      const { data } = await axios.post("/auth/reset-password-request", value);
      toast.success(data.message);  // Success message
      action.resetForm();  // Reset the form fields
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while sending the reset request.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Section */}
      <div className="lg:w-1/2 bg-gradient-to-r from-gray-300 p-10 flex flex-col justify-center items-center text-white">
        <h1 className="text-4xl text-black font-semibold mb-4">Password Reset</h1>
        <p className="text-lg text-center mb-8 text-black">
          Please enter your email address to receive a password reset link.
        </p>
        <Image src="/main1.png" alt="Logo" width={600} height={200} />
      </div>

      {/* Right Section - Form */}
      <div className="lg:w-1/2 p-10 flex justify-center items-center">
        <Formik
          initialValues={initialValues}
          validationSchema={ResetPasswordSchema}
          onSubmit={onResetPassword}
        >
          {(props: FormikProps<IResetPasswordForm>) => {
            const { touched, errors, isSubmitting } = props;
            return (
              <Form className="flex flex-col border px-10 pb-5 pt-5 border-gray-500 w-full max-w-sm">
                <div className="flex justify-center mb-6">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={150}
                    height={75}
                  />
                </div>
                {/* Email Field */}
                <Field
                  placeholder="Email"
                  name="email"
                  type="email"
                  className="mt-2 mb-1 p-2 border border-gray-300 placeholder:text-[14px] rounded-md shadow-md"
                />
                {touched.email && errors.email ? (
                  <div className="text-red-500 text-[12px]">{errors.email}</div>
                ) : null}

                {/* Submit Button */}
                <button
                  className="text-white py-2 px-3 mt-2 rounded-md bg-blue-500 disabled:bg-gray-400 disabled:cursor-none text-sm"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>

                {/* Divider */}
                <div className="flex items-center my-3">
                  <div className="flex-grow h-[1px] bg-gray-300" />
                  <span className="mx-2 text-sm text-gray-500">or</span>
                  <div className="flex-grow h-[1px] bg-gray-300" />
                </div>
                {/* Register Link */}
                <div className="text-center mt-4">
                  <a href="/login" className="text-blue-500 hover:underline">
                    Login here
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
