import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Bounce, ToastContainer } from "react-toastify";
import { auth } from "@/lib/auth";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SHOP.CO",
  description: "SHOP.CO",
    icons: {
    icon: [
      { url: "/logo.png" }, 
      { url: "/logo.png", type: "image/svg+xml" }, 
    ],
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
           {/* Header dengan logo */}
        
        {children}
        <ToastContainer
            position="bottom-right"
            autoClose={5000}
            draggable
            theme="dark"
            transition={Bounce}
            closeOnClick
          />
        </SessionProvider>
      </body>
    </html>
  );
}
