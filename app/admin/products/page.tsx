import { supabaseServer } from "@/lib/supabaseServer"
import Link from "next/link"

/* ================= PAGE ================= */

export default async function AdminProductsPage() {
  const supabase = await supabaseServer()

  const { data: products } = await supabase
    .from("products")
    .select("id,name,price,image_url")
    .order("created_at", { ascending: false })

  return (
    <div style={{ maxWidth: 900 }}>

      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20
        }}
      >
        <h1>Product List</h1>

        <Link href="/admin/products/new">
          ➕ Add Product
        </Link>
      </div>

      <hr />

      {/* PRODUCTS */}
      {products?.map((p) => (
        <div
          key={p.id}
          style={{
            background: "white",
            padding: 15,
            borderRadius: 10,
            marginTop: 15,
            display: "flex",
            alignItems: "center",
            gap: 15
          }}
        >

          {/* IMAGE */}
          <img
            src={p.image_url || "/placeholder.png"}
            style={{
              width: 70,
              height: 70,
              objectFit: "cover",
              borderRadius: 8
            }}
          />

          {/* INFO */}
          <div style={{ flex: 1 }}>
            <b>{p.name}</b>
            <div>{p.price} RWF</div>
          </div>

          {/* EDIT */}
          <Link
            href={`/admin/products/edit/${p.id}`}
            style={{ marginRight: 15 }}
          >
            Edit
          </Link>

          {/* DELETE (POST FORM) */}
          <form
            action={`/admin/products/delete/${p.id}`}
            method="post"
          >
            <button
              style={{
                color: "red",
                background: "transparent",
                border: "none",
                cursor: "pointer"
              }}
            >
              Delete
            </button>
          </form>

        </div>
      ))}

      {products?.length === 0 && (
        <p style={{ marginTop: 30 }}>No products yet.</p>
      )}

    </div>
  )
}
