import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "../../../lib/supabaseServer"

export async function POST(req: NextRequest) {
  const supabase = await supabaseServer()

  // Get logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Get user's cart
  const { data: cart } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!cart) {
    return new NextResponse("Cart not found", { status: 400 })
  }

  // Get cart items + product prices
  const { data: items } = await supabase
    .from("cart_items")
    .select("product_id, quantity, products(price)")
    .eq("cart_id", cart.id)

  const safeItems = items || []

  if (safeItems.length === 0) {
    return new NextResponse("Cart is empty", { status: 400 })
  }

  // Calculate total
  const total = safeItems.reduce(
    (sum, i) => sum + i.quantity * i.products[0].price,
    0
  )

  // Create order
  const { data: order } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      total_amount: total,
    })
    .select()
    .single()

  if (!order) {
    return new NextResponse("Order creation failed", { status: 500 })
  }

  // Insert order items
  for (const item of safeItems) {
    await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products[0].price,
    })
  }

  // Clear cart
  await supabase
    .from("cart_items")
    .delete()
    .eq("cart_id", cart.id)

  return NextResponse.redirect(new URL("/orders", req.url))
}
