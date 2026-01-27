import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return new NextResponse("Missing order id", { status: 400 })
  }

  const supabase = supabaseServer()

  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      status: "processing",
    })
    .eq("id", id)

  if (error) {
    console.error(error)
    return new NextResponse("Payment update failed", { status: 500 })
  }

  return NextResponse.json({ success: true })
}
