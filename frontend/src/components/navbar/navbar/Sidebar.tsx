"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { BsPersonBadge } from "react-icons/bs";
import { RiCoupon2Line } from "react-icons/ri";
import { TiTicket } from "react-icons/ti";
import { MdOutlinePayment } from "react-icons/md";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  const session = useSession();

  return (
    <div>
      {/* Sidebar */}
      {session.data?.user.role === "CUSTOMER" && (
        <>
          <nav
            className={`fixed top-0 left-0 h-screen w-64 bg-gradient-to-br from-gray-200 via-white-300 to-black-400 text-gray-800 p-6 transform transition-transform duration-300 ease-in-out z-40 pt-20 text-shadow-md font-semibold
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static md:w-64`}
          >
            <div className="text-2xl font-bold mb-8 text-center">Dashboard</div>
            <div className="flex flex-col space-y-6">
              <Link
                href={`/profile/`}
                className="flex items-center gap-3 rounded-md p-3 transition duration-300 hover:bg-gray-300"
              >
                <BsPersonBadge className="w-5 h-5" />
                My Profile
              </Link> 
              <Link href={`/profile/coupon`} className="flex items-center gap-3 rounded-md p-3 transition duration-300 hover:bg-gray-300">
              <RiCoupon2Line className="w-5 h-5" />
                My Coupon
              </Link>
              <Link href={`/profile/order`} className="flex items-center gap-3 rounded-md p-3 transition duration-300 hover:bg-gray-300">
              <TiTicket className="w-5 h-5" />
                My Order
              </Link>
              <Link href={`/profile/address`} className="flex items-center gap-3 rounded-md p-3 transition duration-300 hover:bg-gray-300">
              <MdOutlinePayment className="w-5 h-5" />
                My location
              </Link>
            </div>
          </nav>

          {/* Toggle Button (Mobile only) */}
          <button
            onClick={toggleSidebar}
            className="fixed bottom-4 right-4 z-50 bg-gray-200 p-3 rounded-full shadow-lg md:hidden"
            aria-label="Toggle Sidebar"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </>
      )}
    </div>
  );
}
