"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";

const dummyCartItems = [
  {
    id: 1,
    name: "Gradient Graphic T-shirt",
    price: 145,
    image: "/polo1.jpg",
    color: "White",
    size: "Large",
    quantity: 1,
  },
  {
    id: 2,
    name: "Gradient Graphic T-shirt",
    price: 145,
    image: "/polo2.jpg",
    color: "Blue",
    size: "Xtra Large",
    quantity: 1,
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(dummyCartItems);

  const updateQuantity = (id: number, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const discount = subtotal * 0.2;
  const deliveryFee = 15;
  const total = subtotal - discount + deliveryFee;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <p className="text-sm text-gray-500 mb-2">Home &gt; <span className="text-black">Cart</span></p>
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SIDE - Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between bg-white rounded-xl p-4 shadow-sm border"
            >
              <div className="flex items-start space-x-4">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-semibold text-lg">{item.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Size: {item.size} <br />
                    Color: {item.color}
                  </p>
                  <p className="mt-2 font-bold text-lg">${item.price}</p>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center space-x-2 border rounded-full px-3 py-1">
                  <button onClick={() => updateQuantity(item.id, -1)} className="text-lg font-bold">−</button>
                  <span className="px-2">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="text-lg font-bold">+</button>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-red-500">
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE - Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border h-fit">
          <h3 className="text-xl font-bold mb-4">Order Summary</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal}</span>
            </div>
            <div className="flex justify-between text-red-500">
              <span>Discount (-20%)</span>
              <span>-${discount}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>${deliveryFee}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>

          {/* Promo Code */}
          <div className="flex items-center mt-4">
            <input
              type="text"
              placeholder="Add promo code"
              className="flex-grow border px-4 py-2 rounded-full text-sm mr-2"
            />
            <button className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm hover:bg-black">
              Apply
            </button>
          </div>

          {/* Checkout */}
          <button className="mt-6 w-full bg-black text-white py-3 rounded-full text-sm font-semibold hover:bg-gray-900 flex items-center justify-center">
            Go to Checkout &rarr;
          </button>
        </div>
      </div>

      {/* Continue Shopping */}
      <div className="mt-10 text-center">
        <Link href="/" className="text-blue-500 underline text-sm">
          &larr; Continue Shopping
        </Link>
      </div>
    </div>
  );
}
