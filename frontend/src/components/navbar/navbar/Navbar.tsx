"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react"; // Importing useSession for user session
import Image from "next/image";


export default function Navbar() {
  const [showPromo, setShowPromo] = useState(true);

  // Using useSession hook to get session data
  const { data: session } = useSession();

  return (
    <>
      {/* Promo Bar */}
      {showPromo && (
        <div className="bg-black text-white text-center text-sm py-2 px-4 relative">
          <span>
            Wellcome To Shop.co!{" "}
          </span>
        </div>
      )}

      {/* Main Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className="font-bold text-xl">SHOP.CO</Link>

          {/* Menu */}
          <ul className="hidden md:flex space-x-6 items-center">
            <li className="relative group">
              <button className="flex items-center space-x-1 hover:text-gray-700">
                <span>Shop</span>
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
            </li>
            <li>
              <Link href="/newarrivals" className="hover:text-gray-700">New Arrivals</Link>
            </li>
            <li>
              <Link href="/category" className="hover:text-gray-700">All Brands</Link>
            </li>
          </ul>

          {/* Search bar */}
          <div className="flex-1 max-w-lg mx-4 hidden md:block">
            <input
              type="search"
              placeholder="Search for products..."
              className="w-full border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link href="/shippingcart" aria-label="Cart" className="hover:text-gray-700">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.293-2.293a1 1 0 00-.707-.707L3 7m4 6l.6 3M16 17a2 2 0 11-4 0m6 0a2 2 0 11-4 0"
                ></path>
              </svg>
            </Link>

            {/* User Icon */}
            <div className="flex items-center space-x-4">
              {session ? (
                <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      className="focus:outline-none hover:cursor-pointer"
                      onClick={() => {
                      if (session.user.role === "SUPER_ADMIN") {
                        window.location.href = "/super-admin";
                      } else if (session.user.role === "ADMIN") {
                        window.location.href = "/admin-store";
                      } else {
                        window.location.href = "/profile";
                      }
                      }}
                    >
                      <Image
                      src={
                        session.user.avatar ||
                        "https://res.cloudinary.com/dexlqslwj/image/upload/v1744257672/blank-image_yfczs3_ogl5pp.jpg"
                      }
                      height={40}
                      width={40}
                      alt="avatar"
                      className="rounded-full"
                      />
                    </button>
                    <Link href="/" className="text-sm font-semibold hover:underline">
                    {session.user?.name}
                    </Link>
                    <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="text-sm text-gray-600 hover:text-gray-800 hover:underline hover:cursor-pointer"
                    >
                    Logout
                    </button>
                </div>
              ) : (
                // If user is not logged in, show login button
                <Link href="/login" className="hover:text-gray-700">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
