import { supabaseServer } from "@/lib/supabaseServer";

export default async function AdminProductsPage() {
  const supabase = supabaseServer();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div style={{ padding: 40 }}>
      <h1>Admin - Products</h1>

      <a href="/admin/products/new">➕ Add Product</a>

      <hr />

      {products?.map((p) => (
        <div
          key={p.id}
          style={{
            border: "1px solid #ddd",
            padding: 15,
            marginBottom: 10,
          }}
        >
          <b>{p.title}</b> - {p.price} RWF

          <form action={`/admin/products/delete/${p.id}`} method="post">
            <button style={{ color: "red" }}>Delete</button>
          </form>
        </div>
      ))}
    </div>
  );
}
