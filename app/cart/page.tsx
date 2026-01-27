"use client"

import { useEffect, useState } from "react"
import {
  getCart,
  removeFromCart,
  updateQuantity,
} from "@/lib/cart"

type CartItem = {
  id: string
  name: string
  price: number
  image_url: string
  quantity: number
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    setCart(getCart())
  }, [])

  function refresh() {
    setCart(getCart())
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  if (cart.length === 0) {
    return <p style={{ padding: 40 }}>Your cart is empty</p>
  }

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 40 }}>

      <h1 style={{ fontSize: 26, fontWeight: "bold", marginBottom: 30 }}>
        Your Cart
      </h1>

      {cart.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            gap: 20,
            alignItems: "center",
            borderBottom: "1px solid #ddd",
            padding: "20px 0",
          }}
        >

          {/* IMAGE */}
          <img
            src={item.image_url || "/placeholder.png"}
            style={{
              width: 100,
              height: 100,
              objectFit: "cover",
              borderRadius: 10,
            }}
          />

          {/* INFO */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontWeight: "bold" }}>{item.name}</h2>
            <p>{item.price} RWF</p>

            <input
              type="number"
              min={1}
              value={item.quantity ?? 1}
              onChange={(e) => {
                updateQuantity(item.id, Number(e.target.value))
                refresh()
              }}
              style={{
                marginTop: 8,
                width: 60,
                padding: 5,
              }}
            />
          </div>

          {/* REMOVE */}
          <button
            onClick={() => {
              removeFromCart(item.id)
              refresh()
            }}
            style={{
              color: "red",
              border: "none",
              background: "none",
              cursor: "pointer",
            }}
          >
            Remove
          </button>

        </div>
      ))}

      {/* TOTAL */}
      <div
        style={{
          textAlign: "right",
          marginTop: 30,
          fontWeight: "bold",
          fontSize: 18,
        }}
      >
        Total: {total} RWF
      </div>

      {/* CHECKOUT */}
      <a
        href="/checkout"
        style={{
          display: "block",
          marginTop: 20,
          background: "black",
          color: "white",
          padding: 14,
          textAlign: "center",
          borderRadius: 8,
          textDecoration: "none",
        }}
      >
        Proceed to Checkout
      </a>

    </div>
  )
}
