"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiUsers, FiGrid, FiLogOut, FiHome, FiMapPin, FiMenu, FiX } from "react-icons/fi";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function Sidebarsup() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menu = [
    { name: "Dashboard", href: "/super-admin", icon: <FiGrid size={20} /> },
    { name: "Kelola Store Admin", href: "/super-admin/kelola_store", icon: <FiHome size={20} /> },
    { name: "Semua Pengguna", href: "/super-admin/semuapengguna", icon: <FiUsers size={20} /> },
    { name: "Kelola Toko", href: "/super-admin/store_management", icon: <FiHome size={20} /> },
    
  ];

  return (
    <>
      {/* Mobile Hamburger Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-white shadow-md border"
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r shadow-lg z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0 md:block
        `}
      >
        <div className="h-full flex flex-col justify-between p-4">
          <div>
            <h2 className="text-xl font-bold mb-6">Super Admin</h2>
            <nav className="flex flex-col space-y-2">
              {menu.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)} // close on mobile
                  className={`flex items-center gap-3 px-4 py-2 rounded hover:bg-blue-100 ${
                    pathname === item.href
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              signOut({ callbackUrl: "/login" });
            }}
            className="flex items-center gap-3 text-red-600 hover:text-red-800 px-4 py-2 mt-4"
          >
            <FiLogOut size={20} />
            Keluar
          </button>
        </div>
      </div>
    </>
  );
}
