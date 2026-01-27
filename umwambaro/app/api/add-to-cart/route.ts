import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";

export async function POST(req: Request) {
  const supabase = await supabaseServer();

  const formData = await req.formData();
  const product_id = formData.get("product_id") as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  let { data: cart } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!cart) {
    const { data: newCart } = await supabase
      .from("carts")
      .insert({ user_id: user.id })
      .select()
      .single();

    cart = newCart;
  }

  await supabase.from("cart_items").insert({
    cart_id: cart.id,
    product_id,
    quantity: 1,
  });

  return NextResponse.redirect(
    new URL("/cart", req.url)
  );
}
