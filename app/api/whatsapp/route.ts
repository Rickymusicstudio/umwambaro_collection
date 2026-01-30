import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

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
          to: process.env.ADMIN_PHONE,
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
    console.log("WHATSAPP TEMPLATE RESPONSE:", data)

    return NextResponse.json(data)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "WhatsApp error" }, { status: 500 })
  }
}
