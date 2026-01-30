"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

/* ================= PAGE ================= */

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [productsCount, setProductsCount] = useState(0)

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    const { data: ordersData } = await supabase
      .from("orders")
      .select("id,status,total_amount,created_at")
      .order("created_at", { ascending: false })

    const { data: products } = await supabase
      .from("products")
      .select("id")

    setOrders(ordersData || [])
    setProductsCount(products?.length || 0)
  }

  /* ================= STATS ================= */

  const totalOrders = orders.length

  const pendingOrders =
    orders.filter(o => o.status === "pending").length

  const revenue =
    orders
      .filter(o => o.status === "paid")
      .reduce((sum, o) => sum + o.total_amount, 0)

  const recentOrders = orders.slice(0, 5)

  /* ================= UI ================= */

  return (
    <div>

      <h1 style={{ fontSize: 26, fontWeight: "bold" }}>
        Dashboard
      </h1>

      {/* ================= STATS ================= */}

      <div style={grid}>
        <StatCard title="Total Orders" value={totalOrders} />
        <StatCard title="Pending Orders" value={pendingOrders} />
        <StatCard title="Revenue (RWF)" value={revenue} />
        <StatCard title="Products" value={productsCount} />
      </div>

      {/* ================= RECENT ORDERS ================= */}

      <h2 style={{ marginTop: 40, marginBottom: 10 }}>
        Recent Orders
      </h2>

      <div style={{ overflowX: "auto" }}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Order ID</th>
              <th style={th}>Total</th>
              <th style={th}>Status</th>
              <th style={th}>Date</th>
            </tr>
          </thead>

          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id}>
                <td style={td}>{o.id}</td>
                <td style={td}>{o.total_amount} RWF</td>
                <td style={td}>
                  <StatusBadge status={o.status} />
                </td>
                <td style={td}>
                  {new Date(o.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

/* ================= COMPONENTS ================= */

function StatCard({
  title,
  value
}: {
  title: string
  value: number
}) {
  return (
    <div style={card}>
      <p style={{ color: "#555" }}>{title}</p>
      <h2 style={{ fontSize: 28 }}>{value}</h2>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  let color = "#aaa"
  if (status === "pending") color = "#f59e0b"
  if (status === "paid") color = "#22c55e"
  if (status === "delivered") color = "#3b82f6"
  if (status === "cancelled") color = "#ef4444"

  return (
    <span
      style={{
        background: color,
        color: "white",
        padding: "4px 10px",
        borderRadius: 12,
        fontSize: 13
      }}
    >
      {status}
    </span>
  )
}

/* ================= STYLES ================= */

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 20,
  marginTop: 20
}

const card: React.CSSProperties = {
  background: "white",
  padding: 24,
  borderRadius: 10,
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
}

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  background: "white"
}

const th: React.CSSProperties = {
  padding: 12,
  border: "1px solid #ddd",
  textAlign: "left",
  background: "#f8f8f8"
}

const td: React.CSSProperties = {
  padding: 12,
  border: "1px solid #eee"
}
