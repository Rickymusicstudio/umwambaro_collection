"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

type Order = {
  id: string
  total_amount: number
  created_at: string
}

export default function MyOrdersPage() {

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    setLoggedIn(true)

    const { data, error } = await supabase
      .from("orders")
      .select("id,total_amount,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (!error) {
      setOrders(data || [])
    }

    setLoading(false)
  }

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>

  if (!loggedIn) return <p style={{ padding: 20 }}>Please login.</p>

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>

      <h1 style={{ fontSize: 26, marginBottom: 20 }}>
        My Orders
      </h1>

      {orders.length === 0 && (
        <p>No orders yet.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

        {orders.map(o => {

          const shortId = o.id.slice(0, 8)

          return (
            <Link
              key={o.id}
              href={`/orders/${o.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >

              <div style={rowStyle}>

                <div style={iconBox}>📦</div>

                <div style={{ flex: 1 }}>

                  <div style={{ fontWeight: "bold" }}>
                    Order #{shortId}
                  </div>

                  <div style={{ fontSize: 13, color: "#666" }}>
                    {new Date(o.created_at).toLocaleString()}
                  </div>

                  <div style={{ marginTop: 4 }}>
                    {o.total_amount} RWF
                  </div>

                </div>

                <div style={viewBtn}>
                  View →
                </div>

              </div>

            </Link>
          )
        })}

      </div>

    </div>
  )
}

/* ================= STYLES ================= */

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: 14,
  background: "#f7f7f7",
  borderRadius: 14,
  cursor: "pointer",
  transition: "0.2s",
}

const iconBox: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 10,
  background: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 22
}

const viewBtn: React.CSSProperties = {
  background: "#111",
  color: "#fff",
  padding: "6px 12px",
  borderRadius: 10,
  fontSize: 12,
  whiteSpace: "nowrap"
}
