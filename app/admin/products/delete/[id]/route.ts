import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await supabaseServer();

  // 🔥 params must be awaited in new Next.js
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: "Missing product id" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id); // or product_id

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
