"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiUsers, FiGrid, FiLogOut, FiHome, FiMapPin } from "react-icons/fi";
import { signOut } from "next-auth/react";

export default function Sidebarstore() {
  const pathname = usePathname();

  const menu = [
    {
      name: "Dashboard",
      href: "/admin-store",
      icon: <FiGrid size={20} />,
    },
    {
      name: "Kelola Store Admin",
      href: "/admin-store/kelola-adminstore",
      icon: <FiUsers size={20} />,
    },
    {
      name: "Kelola Toko",
      href: "/admin-store/product",
      icon: <FiHome size={20} />,
    },
    {
      name: "Data Penjualan",
      href: "/admin-store/datastore",
      icon: <FiUsers size={20} />,
    },
    {
      name: "Diskon Manajemen",
      href: "/admin-store/discount-management",
      icon: <FiUsers size={20} />,
    },
  ];

  return (
    <div className="h-full flex flex-col justify-between p-4 bg-white border-r shadow-sm">
      <div>
        <h2 className="text-xl font-bold mb-6">Super Admin</h2>
        <nav className="flex flex-col space-y-2">
          {menu.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded hover:bg-blue-100 ${
                pathname === item.href
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "text-gray-700"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-3 text-red-600 hover:text-red-800 px-4 py-2 mt-4"
      >
        <FiLogOut size={20} />
        Keluar
      </button>
    </div>
  );
}
