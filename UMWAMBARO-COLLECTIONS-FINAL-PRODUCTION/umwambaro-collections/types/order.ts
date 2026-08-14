import type { CartItem } from "./cart";

export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

export interface CustomerDetails {
  fullName: string;
  phone: string;
  email?: string;
  district: string;
  sector?: string;
  address: string;
  notes?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  paymentMethod: "cash_on_delivery";
  customer: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
}
