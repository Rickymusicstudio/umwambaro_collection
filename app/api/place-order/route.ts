import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

/*
  Handles:
  - Create order
  - Calculate total
  - Reserve products (NOT sell)
  - Send WhatsApp to Admin
  - Send WhatsApp to Customer
*/

export async function POST(req: NextRequest) {
  console.log("🚀 PLACE ORDER API HIT")

  try {
    const supabase = await supabaseServer()

    // Get logged in user
    const {
      data: { user }
    } = await supabase.auth.getUser()

    const email = user?.email || "No email"

    const body = await req.json()
    console.log("📦 BODY:", body)

    const { user_id, cart, phone, address } = body

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    if (!phone || !address) {
      return NextResponse.json(
        { error: "Phone and address required" },
        { status: 400 }
      )
    }

    // 🔒 CHECK IF ANY PRODUCT ALREADY SOLD
    for (const item of cart) {
      const { data: product } = await supabase
        .from("products")
        .select("status")
        .eq("id", item.id)
        .single()

      if (product?.status === "sold") {
        return NextResponse.json(
          { error: "One of the items is already sold" },
          { status: 400 }
        )
      }
    }

    // Calculate total
    const total = cart.reduce(
      (sum: number, i: any) => sum + i.price * i.quantity,
      0
    )

    console.log("💰 TOTAL:", total)

    // ✅ Create order
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id,
        total_amount: total,
        status: "pending",
        phone,
        address
      })
      .select()
      .single()

    if (error) {
      console.error("❌ ORDER ERROR:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("✅ ORDER CREATED:", order.id)

    // ✅ MARK PRODUCTS AS RESERVED (NOT SOLD)
    for (const item of cart) {
      await supabase
        .from("products")
        .update({
          status: "reserved"
        })
        .eq("id", item.id)
    }

    // Build item list text
    const itemsText = cart
      .map((i: any) => `${i.name} (${i.price} RWF x${i.quantity})`)
      .join(", ")

    const message =
      `NEW ORDER | ` +
      `Client Phone: ${phone} | ` +
      `Client Email: ${email} | ` +
      `Address: ${address} | ` +
      `Items: ${itemsText} | ` +
      `Total: ${total} RWF | ` +
      `Order ID: ${order.id}`

    console.log("📨 SENDING ADMIN WHATSAPP...")

    // Send to Admin
    await fetch(new URL("/api/whatsapp", req.url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: process.env.ADMIN_PHONE,
        message
      })
    })

    console.log("📨 SENDING CUSTOMER WHATSAPP...")

    // Send to Customer
    await fetch(new URL("/api/whatsapp", req.url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: phone,
        message
      })
    })

    return NextResponse.json({
      success: true,
      order_id: order.id
    })

  } catch (err: any) {
    console.error("🔥 SERVER ERROR:", err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
