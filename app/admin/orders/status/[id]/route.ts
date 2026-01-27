import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const formData = await request.formData()
    const status = formData.get("status") as string

    if (!status) {
      return NextResponse.json(
        { error: "Missing status" },
        { status: 400 }
      )
    }

    const supabase = supabaseServer()

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)

    if (error) {
      console.error(error)
      return NextResponse.json(
        { error: "Update failed" },
        { status: 500 }
      )
    }

    return NextResponse.redirect(
      new URL("/admin/orders", request.url)
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}
