"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type OrderItem = {
  id: string
  price: number
  quantity: number
  products: {
    name: string
    image_url: string
  }[]
}

type Order = {
  id: string
  status: string
  payment_status: string
  total_amount: number
  phone: string
  address: string
  created_at: string
  order_items: OrderItem[]
}

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const { id } = React.use(params)

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrder()
  }, [])

  async function loadOrder() {

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        status,
        payment_status,
        total_amount,
        phone,
        address,
        created_at,
        order_items (
          id,
          price,
          quantity,
          products (
            name,
            image_url
          )
        )
      `)
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!error) {
      setOrder(data)
    }

    setLoading(false)
  }

  if (loading) return <p className="p-10">Loading...</p>
  if (!order) return <p className="p-10">Order not found.</p>

  return (
    <div className="p-10 max-w-4xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        Order Details
      </h1>

      {/* META */}
      <div className="mb-6 space-y-2 border p-4 rounded">
        <p><b>Order ID:</b> {order.id}</p>
        <p><b>Status:</b> {order.status}</p>
        <p><b>Payment:</b> {order.payment_status}</p>
        <p><b>Total:</b> {order.total_amount} RWF</p>
        <p><b>Phone:</b> {order.phone}</p>
        <p><b>Address:</b> {order.address}</p>
        <p><b>Date:</b> {new Date(order.created_at).toLocaleString()}</p>
      </div>

      {/* ITEMS */}
      <h2 className="text-xl font-semibold mb-3">
        Items
      </h2>

      {order.order_items.map(item => (
        <div
          key={item.id}
          className="flex items-center gap-4 border-b py-4"
        >

          <img
            src={
              item.products?.[0]?.image_url ||
              "/placeholder.png"
            }
            className="w-16 h-16 object-cover rounded"
          />

          <div className="flex-1">
            <p className="font-semibold">
              {item.products?.[0]?.name}
            </p>
            <p>{item.price} RWF</p>
          </div>

          <div>Qty: {item.quantity}</div>

          <div className="font-semibold">
            {item.price * item.quantity} RWF
          </div>

        </div>
      ))}

    </div>
  )
}
