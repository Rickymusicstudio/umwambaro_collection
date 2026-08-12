import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type OrderResult = {
  id: string;
  order_number: string;
  subtotal: number;
  shipping: number;
  total: number;
  existing?: boolean;
};

const itemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(50),
  color: z.string().trim().max(80).optional(),
  size: z.string().trim().max(40).optional(),
});

const orderSchema = z.object({
  clientOrderId: z.string().uuid(),
  customer: z.object({
    fullName: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(9).max(20),
    email: z.string().trim().email().max(160).optional().or(z.literal("")),
    district: z.string().trim().min(2).max(80),
    sector: z.string().trim().max(80).optional(),
    address: z.string().trim().min(3).max(300),
    notes: z.string().trim().max(500).optional(),
  }),
  items: z.array(itemSchema).min(1).max(30),
  shipping: z.number().int().min(0).max(100000),
  paymentMethod: z.literal("cash_on_delivery"),
});

function normalizeRwandaPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("250") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `250${digits.slice(1)}`;
  return digits;
}

export async function POST(request: Request) {
  try {
    const payload = orderSchema.parse(await request.json());
    const supabase = getSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
    }

    const { data, error } = await supabase.rpc("place_order", {
      p_client_order_id: payload.clientOrderId,
      p_customer: {
        fullName: payload.customer.fullName,
        phone: normalizeRwandaPhone(payload.customer.phone),
        email: payload.customer.email || null,
        district: payload.customer.district,
        sector: payload.customer.sector || null,
        address: payload.customer.address,
        notes: payload.customer.notes || null,
      },
      p_items: payload.items,
      p_shipping: payload.shipping,
      p_payment_method: payload.paymentMethod,
    });

    if (error) {
      console.error("Order creation failed:", error);
      const message = error.message.includes("Not enough stock")
        ? error.message
        : error.message.includes("no longer available")
          ? error.message
          : error.message.includes("Unsupported payment method")
            ? error.message
            : "We could not place your order. Please try again.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const order = data as OrderResult;

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.order_number,
        subtotal: Number(order.subtotal),
        shipping: Number(order.shipping),
        total: Number(order.total),
        existing: Boolean(order.existing),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Please check your order details and try again." }, { status: 400 });
    }

    console.error("Checkout API error:", error);
    return NextResponse.json({ error: "Unexpected checkout error. Please try again." }, { status: 500 });
  }
}
