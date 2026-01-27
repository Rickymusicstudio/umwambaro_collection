import Link from "next/link"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* SIDEBAR */}
      <aside
        style={{
          width: 230,
          background: "#febd69", // ✅ YELLOW SIDEBAR
          padding: 20,
        }}
      >
        <h2 style={{ marginBottom: 25, fontWeight: "bold" }}>
          Admin Panel
        </h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Link href="/admin" style={linkStyle}>Dashboard</Link>
          <Link href="/admin/products" style={linkStyle}>Products</Link>
          <Link href="/admin/orders" style={linkStyle}>Orders</Link>
          <Link href="/products" style={linkStyle}>Back to Shop</Link>
        </nav>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, padding: 30 }}>
        {children}
      </main>

    </div>
  )
}

const linkStyle: React.CSSProperties = {
  color: "black",
  textDecoration: "none",
  fontSize: 15,
  fontWeight: 500,
}
