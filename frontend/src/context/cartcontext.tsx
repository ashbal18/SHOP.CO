import React, { createContext, useContext, useState } from "react";
import axios from "@/lib/axios"; // Ensure axios is correctly set up

// Cart Context
const CartContext = createContext<any>(null);

// Custom hook to use cart context
export const useCart = () => useContext(CartContext);

// CartProvider Component to wrap the application and manage cart state
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Add item to the cart
  const addToCart = async (item: any) => {
    try {
      const response = await axios.post("/cart/add", item);  // Adjust API endpoint as necessary
      setCartItems(response.data);  // Assuming the response returns the updated cart items
    } catch (error) {
      console.error("Error adding item to cart", error);
    }
  };

  // Update item quantity in the cart
  const updateQuantity = async (id: number, delta: number) => {
    try {
      const response = await axios.put(`/cart/update/${id}`, { quantity: delta });
      setCartItems(response.data);  // Assuming the response returns updated cart items
    } catch (error) {
      console.error("Error updating quantity", error);
    }
  };

  // Remove item from the cart
  const removeItem = async (id: number) => {
    try {
      const response = await axios.delete(`/cart/remove/${id}`);
      setCartItems(response.data);  // Assuming the response returns the updated cart items
    } catch (error) {
      console.error("Error removing item from cart", error);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeItem }}>
      {children}
    </CartContext.Provider>
  );
};
