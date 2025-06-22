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
  const { data: session } = useSession();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  if (session?.user.role !== "CUSTOMER") return null;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 bg-white border border-gray-300 p-2 rounded-md shadow-md md:hidden"
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-300 shadow-md z-50 pt-20 px-6 transition-transform duration-300 transform
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static md:block`}
      >
        <div className="text-2xl font-bold mb-8 text-center">Dashboard</div>
        <nav className="flex flex-col gap-4 font-medium">
          <Link
            href="/profile"
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-100"
            onClick={closeSidebar}
          >
            <BsPersonBadge className="w-5 h-5" />
            My Profile
          </Link>
          <Link
            href="/profile/coupon"
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-100"
            onClick={closeSidebar}
          >
            <RiCoupon2Line className="w-5 h-5" />
            My Coupon
          </Link>
          <Link
            href="/profile/order"
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-100"
            onClick={closeSidebar}
          >
            <TiTicket className="w-5 h-5" />
            My Order
          </Link>
          <Link
            href="/profile/address"
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-100"
            onClick={closeSidebar}
          >
            <MdOutlinePayment className="w-5 h-5" />
            My Location
          </Link>
        </nav>
      </aside>
    </>
  );
}
