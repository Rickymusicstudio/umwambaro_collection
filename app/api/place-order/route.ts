import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";

export async function POST(req: Request) {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  const { data: cart } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: items } = await supabase
    .from("cart_items")
    .select("product_id, quantity, products(price)")
    .eq("cart_id", cart.id);

  const total = items.reduce(
    (sum, i) => sum + i.quantity * i.products.price,
    0
  );

  const { data: order } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      total_amount: total,
    })
    .select()
    .single();

  for (const item of items) {
    await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products.price,
    });
  }

  await supabase
    .from("cart_items")
    .delete()
    .eq("cart_id", cart.id);

  return NextResponse.redirect(
    new URL("/orders", req.url)
  );
}
