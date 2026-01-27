import { supabaseServer } from "@/lib/supabaseServer"
import Link from "next/link"

export default async function AdminProductsPage() {

  const supabase = supabaseServer()

  const { data: products } = await supabase
    .from("products")
    .select("id,name,price,image_url")
    .order("created_at", { ascending: false })

  return (
    <div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 24 }}>Product List</h1>

        <Link href="/admin/products/new">
          ➕ Add Product
        </Link>
      </div>

      <hr style={{ margin: "20px 0" }} />

      {products?.map(p => (
        <div
          key={p.id}
          style={{
            display: "flex",
            gap: 15,
            alignItems: "center",
            background: "white",
            padding: 15,
            borderRadius: 8,
            marginBottom: 10
          }}
        >

          <img
            src={p.image_url || "/placeholder.png"}
            style={{
              width: 80,
              height: 80,
              objectFit: "cover",
              borderRadius: 6
            }}
          />

          <div style={{ flex: 1 }}>
            <b>{p.name}</b>
            <div>{p.price} RWF</div>
          </div>

          <form
            action={`/admin/products/delete/${p.id}`}
            method="post"
          >
            <button style={{ color: "red" }}>
              Delete
            </button>
          </form>

        </div>
      ))}

    </div>
  )
}
