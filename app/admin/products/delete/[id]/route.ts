import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await supabaseServer();
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: "Missing product id" },
      { status: 400 }
    );
  }

  // 1️⃣ Delete order items referencing product
  const { error: orderItemsError } = await supabase
    .from("order_items")
    .delete()
    .eq("product_id", id);

  if (orderItemsError) {
    return NextResponse.json(
      { error: orderItemsError.message },
      { status: 500 }
    );
  }

  // 2️⃣ Delete product
  const { error: productError } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (productError) {
    return NextResponse.json(
      { error: productError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
