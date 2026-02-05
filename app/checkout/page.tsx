"use client"

import { useEffect, useState } from "react"
import { getCart, clearCart } from "@/lib/cart"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {

  const router = useRouter()

  const [cart, setCart] = useState<any[]>([])
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setCart(getCart())
  }, [])

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  async function placeOrder() {

    if (cart.length === 0) {
      alert("Cart is empty")
      return
    }

    if (!phone || !address) {
      alert("Enter phone and address")
      return
    }

    setLoading(true)

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      alert("Login required")
      setLoading(false)
      return
    }

    // ✅ PLACE ORDER
    const res = await fetch("/api/place-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        cart,
        phone,
        address
      })
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Order failed")
      setLoading(false)
      return
    }

    // ✅ CREATE ADMIN NOTIFICATION
    await supabase
      .from("notifications")
      .insert({
        user_role: "admin",
        title: "New Order",
        message: `New order placed. Items: ${cart.length}, Total: ${total} RWF`,
        link: "/admin/orders"
      })

    // ✅ Clear cart
    clearCart()

    // ✅ Stop loading
    setLoading(false)

    // ✅ Redirect
    router.push("/success")
  }

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 24 }}>

      <h1 style={{ fontSize: 24, fontWeight: "bold" }}>
        Checkout
      </h1>

      <input
        placeholder="Phone number"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        style={input}
      />

      <textarea
        placeholder="Delivery address"
        value={address}
        onChange={e => setAddress(e.target.value)}
        style={{ ...input, height: 90 }}
      />

      <p>Items: {cart.length}</p>
      <p><b>Total: {total} RWF</b></p>

      <button
        disabled={loading}
        onClick={placeOrder}
        style={btn}
      >
        {loading ? "Placing Order..." : "Place Order"}
      </button>

    </div>
  )
}

/* ================= STYLES ================= */

const input: React.CSSProperties = {
  width: "100%",
  padding: 12,
  marginTop: 12,
  border: "1px solid #ccc",
  borderRadius: 6
}

const btn: React.CSSProperties = {
  marginTop: 20,
  background: "black",
  color: "white",
  padding: 14,
  width: "100%",
  borderRadius: 8,
  border: "none",
  cursor: "pointer"
}
