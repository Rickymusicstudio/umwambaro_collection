"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [productsCount, setProductsCount] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
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

  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === "pending").length

  const revenue = orders
    .filter(o => o.status === "paid")
    .reduce((s, o) => s + o.total_amount, 0)

  const recentOrders = orders.slice(0, 5)

  return (
    <div>

      <h1 style={{ fontSize: 26, fontWeight: "bold" }}>
        Dashboard
      </h1>

      <div style={grid}>
        <StatCard title="Total Orders" value={totalOrders} />
        <StatCard title="Pending Orders" value={pendingOrders} />
        <StatCard title="Revenue (RWF)" value={revenue} />
        <StatCard title="Products" value={productsCount} />
      </div>

      <h2 style={{ marginTop: 40 }}>Recent Orders</h2>

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
          {recentOrders.map(o => (
            <tr key={o.id}>
              <td style={td}>{o.id}</td>
              <td style={td}>{o.total_amount} RWF</td>
              <td style={td}><StatusBadge status={o.status} /></td>
              <td style={td}>
                {new Date(o.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}

/* ---------------- */

function StatCard({ title, value }: { title: string, value: number }) {
  return (
    <div style={card}>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  let color = "#999"
  if (status === "pending") color = "#f59e0b"
  if (status === "paid") color = "#22c55e"
  if (status === "delivered") color = "#3b82f6"
  if (status === "cancelled") color = "#ef4444"

  return (
    <span style={{
      background: color,
      color: "white",
      padding: "4px 10px",
      borderRadius: 10
    }}>
      {status}
    </span>
  )
}

/* ---------------- */

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
  gap: 20,
  marginTop: 20
}

const card: React.CSSProperties = {
  background: "white",
  padding: 24,
  borderRadius: 10
}

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 10
}

const th: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: 10,
  background: "#f5f5f5"
}

const td: React.CSSProperties = {
  border: "1px solid #eee",
  padding: 10
}
