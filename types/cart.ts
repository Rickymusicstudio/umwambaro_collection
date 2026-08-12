import type { Product } from "./product";

export interface CartItem {
  id: string;

  product: Product;

  quantity: number;

  color?: string;

  size?: string;
}

export interface CartContextType {
  items: CartItem[];

  totalItems: number;

  subtotal: number;

  addItem: (
    product: Product,
    quantity?: number,
    color?: string,
    size?: string
  ) => void;

  removeItem: (id: string) => void;

  updateQuantity: (
    id: string,
    quantity: number
  ) => void;

  clearCart: () => void;
}