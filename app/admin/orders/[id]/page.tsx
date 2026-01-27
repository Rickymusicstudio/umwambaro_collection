"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useParams, useRouter } from "next/navigation"

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrder()
  }, [])

  async function loadOrder() {
    const { data: orderData, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single()

    if (error) {
      alert("Order not found")
      router.push("/admin/orders")
      return
    }

    setOrder(orderData)
    setStatus(orderData.status)

    const { data: itemsData } = await supabase
      .from("order_items")
      .select(`
        *,
        products ( name )
      `)
      .eq("order_id", orderId)

    setItems(itemsData || [])
    setLoading(false)
  }

  async function updateStatus() {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)

    if (error) {
      alert("Failed to update status")
      return
    }

    alert("Status updated")
  }

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>

  return (
    <div style={{ padding: 40, maxWidth: 900 }}>

      <h1 style={{ fontSize: 26, fontWeight: "bold" }}>
        Order Details
      </h1>

      <p><b>Order ID:</b> {order.id}</p>
      <p><b>User:</b> {order.user_id}</p>
      <p><b>Phone:</b> {order.phone}</p>
      <p><b>Address:</b> {order.address}</p>
      <p><b>Total:</b> {order.total_amount} RWF</p>

      {/* STATUS + PRINT */}

      <div style={{ marginTop: 15, display: "flex", gap: 10 }}>

        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button
          onClick={updateStatus}
          style={{
            padding: "6px 12px",
            background: "black",
            color: "white",
            border: "none",
            borderRadius: 4
          }}
        >
          Update
        </button>

        {/* PRINT BUTTON */}
        <button
          onClick={() =>
            window.open(
              `/admin/orders/${orderId}/invoice`,
              "_blank"
            )
          }
          style={{
            padding: "6px 12px",
            background: "#f59e0b",
            color: "white",
            border: "none",
            borderRadius: 4
          }}
        >
          Print Invoice
        </button>

      </div>

      {/* ITEMS TABLE */}

      <table
        style={{
          width: "100%",
          marginTop: 30,
          borderCollapse: "collapse"
        }}
      >
        <thead>
          <tr>
            <th align="left">Product</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Subtotal</th>
          </tr>
        </thead>

        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.products?.name}</td>
              <td align="center">{item.price}</td>
              <td align="center">{item.quantity}</td>
              <td align="center">
                {item.price * item.quantity}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}
