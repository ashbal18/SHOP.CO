// components/Footer.tsx
"use client";

import { FaLinkedin, FaGithub, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700 pt-8">
      {/* Newsletter Section */}
      <div className="bg-black text-white p-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:px-16">
        <h2 className="text-xl font-bold uppercase max-w-md text-center md:text-left">
          SHOP.CO <br /> FIND YOUR STYLE
        </h2>
        <form className="flex w-full max-w-md space-x-2">
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-grow rounded-full py-2 px-4 text-black focus:outline-none focus:ring-2 focus:ring-white"
          />
        </form>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-6 gap-8">
        {/* Brand */}
        <div className="md:col-span-2">
          <h1 className="font-bold text-2xl mb-3">SHOP.CO</h1>
          <p className="text-sm mb-4">
            We have clothes that suits your style and which you’re proud to
            wear. From women to men.
          </p>
          <div className="flex space-x-3 mb-4">
            <a href="#" aria-label="Twitter" className="hover:text-black">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53..." />
              </svg>
            </a>
            {/* Tambahkan sosial lainnya jika perlu */}
          </div>
          <p className="text-xs text-gray-500">
            &copy; 2025 Shop.co, All Rights Reserved
          </p>
        </div>

        {/* Company */}
        <div>
          <h3 className="uppercase tracking-wider text-xs font-semibold mb-3">Company</h3>
          <ul className="space-y-1 text-sm">
            <li><a className="hover:underline">About</a></li>
            <li><a className="hover:underline">Features</a></li>
            <li><a className="hover:underline">Works</a></li>
            <li><a className="hover:underline">Career</a></li>
          </ul>
        </div>

        {/* FAQ */}
        <div>
          <h3 className="uppercase tracking-wider text-xs font-semibold mb-3">FAQ</h3>
          <ul className="space-y-1 text-sm">
            <li><a className="hover:underline">Account</a></li>
            <li><a className="hover:underline">Profile</a></li>
            <li><a className="hover:underline">Orders</a></li>
            <li><a className="hover:underline">Payments</a></li>
          </ul>
        </div>

        {/* Our Team (ganti Resources) */}
        <div>
          <h3 className="uppercase tracking-wider text-xs font-semibold mb-3">Our Team</h3>
          <div className="space-y-4 text-sm">
            {[
              {
              name: "Muhammad Ashbal Al Saddam",
              linkedin: "www.linkedin.com/in/muhammad-ashbal-al-saddam-a21a2a303",
              github: "https://github.com/ashbal18",
              instagram: "https://www.instagram.com/bal.adams_/",
              },
              {
              name: "Hilman Hanifan",
              linkedin: "https://www.linkedin.com/in/hilmanhanifan/",
              github: "https://github.com/hilmanhanifan",
              instagram: "https://instagram.com/hilmanhanifan",
              },
            ].map((member) => (
              <div key={member.name}>
              <p className="font-medium mb-1">{member.name}</p>
              <div className="flex space-x-3 text-lg text-gray-600">
                <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="hover:text-black"
                >
                <FaLinkedin />
                </a>
                <a
                href={member.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="hover:text-black"
                >
                <FaGithub />
                </a>
                <a
                href={member.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-black"
                >
                <FaInstagram />
                </a>
              </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
