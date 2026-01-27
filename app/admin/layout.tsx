import Link from "next/link"

/* ================= LAYOUT ================= */

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
          width: 220,
          background: "#111",
          color: "white",
          padding: 20,
        }}
      >
        <h2 style={{ marginBottom: 30 }}>Admin Panel</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: 15 }}>

          <Link href="/admin/dashboard" style={linkStyle}>
            Dashboard
          </Link>

          {/* PRODUCTS DROPDOWN */}
          <details>

            <summary style={summaryStyle}>
              Products
            </summary>

            <div style={subMenuStyle}>

              <Link href="/admin/products" style={subLinkStyle}>
                Product List
              </Link>

              <Link href="/admin/products/new" style={subLinkStyle}>
                Add Product
              </Link>

            </div>
          </details>

          <Link href="/admin/orders" style={linkStyle}>
            Orders
          </Link>

        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          padding: 30,
          background: "#f5f5f5",
        }}
      >
        {children}
      </main>

    </div>
  )
}

/* ================= STYLES ================= */

const linkStyle: React.CSSProperties = {
  color: "white",
  textDecoration: "none",
  fontSize: 15,
}

const summaryStyle: React.CSSProperties = {
  cursor: "pointer",
  fontSize: 15,
  color: "white",
}

const subMenuStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  marginLeft: 15,
  marginTop: 10,
}

const subLinkStyle: React.CSSProperties = {
  color: "#ccc",
  textDecoration: "none",
  fontSize: 14,
}
