"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type CartItemType = "PRODUCT" | "SERVICE";

type CartItem = {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
  image?: string;
  discountPercent?: number | null;
  type: CartItemType; // Novo campo para diferenciar produto de serviço
  durationMins?: number; // Para serviços
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  updateQuantity: (id: string, type: CartItemType, delta: number) => void;
  removeItem: (id: string, type: CartItemType) => void;
  clearCart: () => void;
  itemCount: number;
  products: CartItem[];
  services: CartItem[];
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (items.length) {
      localStorage.setItem("cart", JSON.stringify(items));
    } else {
      localStorage.removeItem("cart");
    }
  }, [items]);

  function addItem(newItem: Omit<CartItem, "quantity">) {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === newItem.id && item.type === newItem.type);
      if (existing) {
        // Para serviços, não incrementar quantidade, apenas manter 1
        if (newItem.type === "SERVICE") {
          return prev;
        }
        return prev.map((item) =>
          item.id === newItem.id && item.type === newItem.type
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  }

  function updateQuantity(id: string, type: CartItemType, delta: number) {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id && item.type === type
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(id: string, type: CartItemType) {
    setItems((prev) => prev.filter((item) => !(item.id === id && item.type === type)));
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const products = items.filter((item) => item.type === "PRODUCT");
  const services = items.filter((item) => item.type === "SERVICE");

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        itemCount,
        products,
        services,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
