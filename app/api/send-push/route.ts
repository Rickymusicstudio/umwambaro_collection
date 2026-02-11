import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { token, title, body } = await req.json()

  const res = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      Authorization: `key=${process.env.FCM_SERVER_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: token,
      notification: {
        title,
        body,
        sound: "default"
      },
      android: {
        priority: "high"
      }
    }),
  })

  const data = await res.json()

  return NextResponse.json(data)
}
