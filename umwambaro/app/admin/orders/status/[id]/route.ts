import { supabaseServer } from "@/lib/supabaseServer"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ await params
    const { id } = await params

    const formData = await req.formData()
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
