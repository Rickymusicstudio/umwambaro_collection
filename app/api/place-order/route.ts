import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function POST(req: NextRequest) {
  console.log("🚀 PLACE ORDER API HIT")

  try {
    const supabase = await supabaseServer()
    const body = await req.json()

    console.log("📦 BODY:", body)

    const { user_id, cart, phone, address } = body

    const total = cart.reduce(
      (sum: number, i: any) => sum + i.price * i.quantity,
      0
    )

    console.log("💰 TOTAL:", total)

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

    const message = `🛒 NEW ORDER

Phone: ${phone}
Address: ${address}
Total: ${total} RWF
Order ID: ${order.id}`

    console.log("📨 ABOUT TO CALL WHATSAPP")

    const waRes = await fetch(
      new URL("/api/whatsapp", req.url),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      }
    )

    const waData = await waRes.json()

    console.log("📨 WHATSAPP RESULT:", waData)

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error("🔥 CRASH:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
