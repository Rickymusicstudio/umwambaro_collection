"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

/* ================= TYPES ================= */

type Order = {
  id: string
  total_amount: number
  created_at: string
}

type OrderItemRow = {
  id: string
  price: number
  quantity: number
  product_id: string
}

type Product = {
  id: string
  name: string
  image_url: string | null
}

type MergedItem = {
  id: string
  price: number
  quantity: number
  product: Product | null
}

/* ================= PAGE ================= */

export default function OrderDetailsPage() {

  /* ---------- SAFE PARAM ---------- */

  const params = useParams()

  const orderId =
    typeof params?.id === "string"
      ? params.id
      : undefined

  /* ---------- STATE ---------- */

  const [userId, setUserId] = useState<string | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<MergedItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  /* ---------- SESSION ---------- */

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id || null)
    })
  }, [])

  /* ---------- LOAD DATA ---------- */

  useEffect(() => {
    if (!userId || !orderId) return
    loadOrder(orderId)
  }, [userId, orderId])

  async function loadOrder(orderId: string) {

    setLoading(true)

    /* ----- ORDER ----- */

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("id,total_amount,created_at")
      .eq("id", orderId)
      .eq("user_id", userId)
      .single()

    if (orderError) {
      console.error("Order error:", orderError)
      setLoading(false)
      return
    }

    /* ----- ITEMS ----- */

    const { data: itemRows, error: itemsError } = await supabase
      .from("order_items")
      .select("id,price,quantity,product_id")
      .eq("order_id", orderId)

    if (itemsError) {
      console.error("Items error:", itemsError)
      setLoading(false)
      return
    }

    /* ----- PRODUCTS ----- */

    const productIds = itemRows.map(i => i.product_id)

    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("id,name,image_url")
      .in("id", productIds)

    if (productsError) {
      console.error("Products error:", productsError)
    }

    /* ----- MERGE ----- */

    const merged: MergedItem[] = itemRows.map(i => ({
      id: i.id,
      price: i.price,
      quantity: i.quantity,
      product: productsData?.find(p => p.id === i.product_id) || null
    }))

    setOrder(orderData)
    setItems(merged)
    setLoading(false)
  }

  /* ---------- UI STATES ---------- */

  if (!orderId) {
    return <p style={{ padding: 20 }}>Invalid order link.</p>
  }

  if (loading) {
    return <p style={{ padding: 20 }}>Loading...</p>
  }

  if (!userId) {
    return <p style={{ padding: 20 }}>Please login.</p>
  }

  if (!order) {
    return <p style={{ padding: 20 }}>Order not found.</p>
  }

  /* ---------- UI ---------- */

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>

      <h1 style={{ fontSize: 24, marginBottom: 10 }}>
        Order Details
      </h1>

      <p><b>Order ID:</b> {order.id}</p>
      <p><b>Date:</b> {new Date(order.created_at).toLocaleString()}</p>

      <p style={{ marginBottom: 20 }}>
        <b>Total:</b> {order.total_amount} RWF
      </p>

      <h2 style={{ marginBottom: 10 }}>Items</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

        {items.map(i => (

          <div key={i.id} style={itemRow}>

            <img
              src={i.product?.image_url || "/placeholder.png"}
              style={itemImg}
              alt=""
            />

            <div style={{ flex: 1 }}>

              <div style={{ fontWeight: "bold" }}>
                {i.product?.name || "Product"}
              </div>

              <div>{i.price} RWF</div>
              <div>Qty: {i.quantity}</div>

              <div>
                Subtotal: {i.price * i.quantity} RWF
              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  )
}

/* ================= STYLES ================= */

const itemRow: React.CSSProperties = {
  display: "flex",
  gap: 12,
  background: "#f7f7f7",
  padding: 12,
  borderRadius: 12,
  alignItems: "center"
}

const itemImg: React.CSSProperties = {
  width: 60,
  height: 60,
  objectFit: "contain",
  borderRadius: 8,
  background: "#fff"
}
