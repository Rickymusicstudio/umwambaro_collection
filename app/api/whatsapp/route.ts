import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    // ✅ Receive both phone and message
    const { message, phone } = await req.json()

    if (!phone || !message) {
      return NextResponse.json(
        { error: "Phone and message are required" },
        { status: 400 }
      )
    }

    const res = await fetch(
      `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone, // ✅ Now using passed phone
          type: "template",
          template: {
            name: "jaspers_market_order_confirmation_v1",
            language: { code: "en_US" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: "New Order" },
                  { type: "text", text: message },
                  { type: "text", text: "Online Store" }
                ]
              }
            ]
          }
        })
      }
    )

    const data = await res.json()
    console.log("📨 WHATSAPP TEMPLATE RESPONSE:", data)

    if (!res.ok) {
      console.error("❌ WHATSAPP FAILED")
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error("🔥 WHATSAPP ERROR:", err)
    return NextResponse.json(
      { error: "WhatsApp error" },
      { status: 500 }
    )
  }
}
