import { supabaseServer } from "@/lib/supabaseServer"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await req.formData()
    const payment_status = formData.get("payment_status")

    if (!payment_status) {
      return NextResponse.json(
        { error: "Missing payment_status" },
        { status: 400 }
      )
    }

    const supabase = supabaseServer()

    const { error } = await supabase
      .from("orders")
      .update({ payment_status })
      .eq("id", params.id)

    if (error) {
      console.error(error)
      return NextResponse.json(
        { error: "Update failed" },
        { status: 500 }
      )
    }

    return NextResponse.redirect(
      new URL("/admin/orders", req.url)
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}
