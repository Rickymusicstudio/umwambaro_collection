import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeRwandaPhone } from "@/lib/format";

type OrderResult = {
  id: string;
  order_number: string;
  subtotal: number;
  shipping: number;
  total: number;
  existing?: boolean;
};

// Optional fields may arrive as null (e.g. carts saved by the old store), so accept null too.
const optionalText = (max: number) => z.string().trim().max(max).nullish().transform((v) => v || undefined);

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
    email: z.string().trim().email().max(160).nullish().or(z.literal("")),
    district: z.string().trim().min(2).max(80),
    sector: optionalText(80),
    address: z.string().trim().min(3).max(300),
    notes: optionalText(500),
  }),
  items: z.array(itemSchema).min(1).max(30),
  // delivery fee is calculated in the database from the district
  paymentMethod: z.literal("cash_on_delivery"),
});

export async function POST(request: Request) {
  try {
    const payload = orderSchema.parse(await request.json());
    // If a customer is logged in, act as them so the order appears in their account.
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || undefined;
    const supabase = getSupabaseServerClient(token);

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
      p_payment_method: payload.paymentMethod,
    });

    if (error) {
      console.error("Order creation failed:", error);
      const known = ["Not enough stock", "no longer available", "Unsupported payment method", "do not deliver"];
      const message = known.some((k) => error.message.includes(k))
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
      console.error("Checkout validation failed:", error.issues);
      const field = String(error.issues[0]?.path.at(-1) ?? "");
      const labels: Record<string, string> = { fullName: "name", phone: "phone number", email: "email", district: "district", address: "address", productId: "cart", quantity: "cart" };
      const what = labels[field];
      return NextResponse.json({ error: what ? `Please check your ${what} and try again.` : "Please check your order details and try again." }, { status: 400 });
    }

    console.error("Checkout API error:", error);
    return NextResponse.json({ error: "Unexpected checkout error. Please try again." }, { status: 500 });
  }
}
