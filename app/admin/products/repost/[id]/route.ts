import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await supabaseServer();

  const { error } = await supabase
    .from("products")
    .update({
      status: "available",
      is_active: true,
    })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json(error, { status: 500 });
  }

  return NextResponse.redirect(
    new URL("/admin/products", req.url)
  );
}
