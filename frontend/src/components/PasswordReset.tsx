"use client";

import { Field, Form, Formik, FormikHelpers, FormikProps } from "formik";
import { useState } from "react";
import * as yup from "yup";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Image from "next/image";
import { toast } from "react-toastify";
import axios from "@/lib/axios";

// Validation schema using Yup
const ResetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), undefined], "Passwords must match")
    .required("Confirm password is required"),
});

interface IResetPasswordForm {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordVerification() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Initial values for the form
  const initialValues: IResetPasswordForm = {
    password: "",
    confirmPassword: "",
  };

  // Handle reset password
  const onResetPassword = async (
    value: IResetPasswordForm,
    action: FormikHelpers<IResetPasswordForm>
  ) => {
    const token = window.location.pathname.split("/")[2]; // Extract token from the URL

    try {
      const { data } = await axios.post(
        "/auth/reset-password-verify",
        value,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(data.message); // Success message
      action.resetForm(); // Reset the form fields
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while resetting the password.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Section */}
      <div className="lg:w-1/2 bg-gradient-to-r from-gray-300 p-10 flex flex-col justify-center items-center text-white">
        <h1 className="text-4xl text-black font-semibold mb-4">Reset Password</h1>
        <p className="text-lg text-center mb-8 text-black">
          Please enter your new password and confirm it.
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
                {/* Password Field */}
                <div className="relative">
                  <Field
                    placeholder="New Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="mt-2 mb-1 p-2 pr-10 border border-gray-300 placeholder:text-[14px] rounded-md shadow-md w-full"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <AiFillEyeInvisible size={20} />
                    ) : (
                      <AiFillEye size={20} />
                    )}
                  </button>
                </div>
                {touched.password && errors.password ? (
                  <div className="text-red-500 text-[12px]">{errors.password}</div>
                ) : null}

                {/* Confirm Password Field */}
                <div className="relative">
                  <Field
                    placeholder="Confirm Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="mt-2 mb-1 p-2 pr-10 border border-gray-300 placeholder:text-[14px] rounded-md shadow-md w-full"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <AiFillEyeInvisible size={20} />
                    ) : (
                      <AiFillEye size={20} />
                    )}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword ? (
                  <div className="text-red-500 text-[12px]">{errors.confirmPassword}</div>
                ) : null}

                {/* Submit Button */}
                <button
                  className="text-white py-2 px-3 mt-2 rounded-md bg-blue-500 disabled:bg-gray-400 disabled:cursor-none text-sm"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Reset Password"}
                </button>

                {/* Divider */}
                <div className="flex items-center my-3">
                  <div className="flex-grow h-[1px] bg-gray-300" />
                  <span className="mx-2 text-sm text-gray-500">or</span>
                  <div className="flex-grow h-[1px] bg-gray-300" />
                </div>

                {/* Register Link */}
                <div className="text-center mt-4">
                  <span className="text-sm text-gray-500">Remembered your password? </span>
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
