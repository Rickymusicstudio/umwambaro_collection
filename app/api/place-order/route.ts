import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

/*
  Handles:
  - Create order
  - Calculate total
  - Send WhatsApp to Admin
*/

export async function POST(req: NextRequest) {
  console.log("🚀 PLACE ORDER API HIT")

  try {
    const supabase = await supabaseServer()
    const body = await req.json()

    console.log("📦 BODY:", body)

    const { user_id, cart, phone, address } = body

    if (!cart || cart.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      )
    }

    if (!phone || !address) {
      return NextResponse.json(
        { error: "Phone and address required" },
        { status: 400 }
      )
    }

    // ✅ Calculate total
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
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log("✅ ORDER CREATED:", order.id)

    // ✅ Build WhatsApp message
    const message = `
🛒 NEW ORDER - UMWAMBARO COLLECTIONS

📞 Phone: ${phone}
🏠 Address: ${address}

Items:
${cart.map((i: any) => `- ${i.name} x${i.quantity}`).join("\n")}

💰 Total: ${total} RWF
🆔 Order ID: ${order.id}
`

    console.log("📨 SENDING WHATSAPP...")

    // ✅ INTERNAL API CALL (NO DOMAIN NEEDED)
    const waRes = await fetch(
      new URL("/api/whatsapp", req.url),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      }
    )

    const waData = await waRes.json()

    console.log("📨 WHATSAPP RESPONSE:", waData)

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
