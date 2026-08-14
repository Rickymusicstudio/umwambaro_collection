"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Product } from "@/types/product";
import type { CartContextType, CartItem } from "@/types/cart";

export const CartContext = createContext<CartContextType | null>(null);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("umwambaro-cart");
      if (storedCart) setItems(JSON.parse(storedCart));
    } catch {
      localStorage.removeItem("umwambaro-cart");
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("umwambaro-cart", JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = (
    product: Product,
    quantity = 1,
    color?: string,
    size?: string
  ) => {
    if (product.stock <= 0 || quantity <= 0) return;

    setItems((current) => {
      const existing = current.find(
        (item) =>
          item.product.id === product.id &&
          item.color === color &&
          item.size === size
      );

      if (existing) {
        return current.map((item) =>
          item.id === existing.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + quantity,
                  item.product.stock
                ),
              }
            : item
        );
      }

      return [
        ...current,
        {
          id:
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `${Date.now()}-${product.id}`,
          product,
          quantity: Math.min(quantity, product.stock),
          color,
          size,
        },
      ];
    });
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.min(quantity, item.product.stock),
            }
          : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      ),
    [items]
  );

  const value = useMemo<CartContextType>(
    () => ({
      items,
      totalItems,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items, totalItems, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }
  return context;
}
