import { NextRequest } from "next/server"
import { redirect } from "next/navigation"
import { supabaseServer } from "@/lib/supabaseServer"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return new Response("Missing product id", { status: 400 })
  }

  const supabase = supabaseServer()

  // Delete order items first
  const { error: itemsError } = await supabase
    .from("order_items")
    .delete()
    .eq("product_id", id)

  if (itemsError) {
    console.log(itemsError)
    return new Response("Failed deleting order items", { status: 500 })
  }

  // Then delete product
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)

  if (error) {
    console.log(error)
    return new Response("Delete failed", { status: 500 })
  }

  redirect("/admin/products")
}
