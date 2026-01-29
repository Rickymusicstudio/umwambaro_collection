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

  // ✅ Force payment method
  const paymentMethod = "cash"

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

    /* ================= CREATE ORDER ================= */

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: total,
        status: "pending",
        phone,
        address,
        payment_method: paymentMethod,
        payment_status: "unpaid",
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      alert("Failed to create order")
      setLoading(false)
      return
    }

    /* ================= SAVE ORDER ITEMS ================= */

   const items = cart.map(item => ({
  order_id: order.id,
  product_id: item.id,
  price: item.price,
  quantity: item.quantity
}))

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(items)

    if (itemsError) {
      console.error(itemsError)
      alert("Failed to save items")
      setLoading(false)
      return
    }

    /* ================= MARK PRODUCTS AS SOLD ================= */

    for (const item of cart) {
      const { error: updateError } = await supabase
        .from("products")
        .update({ is_active: false })
        .eq("id", item.id)

      if (updateError) {
        console.error(updateError)
        alert("Failed to mark product sold")
        setLoading(false)
        return
      }
    }

    /* ================= CLEAR CART ================= */

    clearCart()

    /* ================= REDIRECT ================= */

    router.push("/success")
  }

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 24 }}>

      <h1 style={{ fontSize: 24, fontWeight: "bold" }}>
        Checkout
      </h1>

      {/* PHONE */}
      <input
        placeholder="Phone number"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        style={input}
      />

      {/* ADDRESS */}
      <textarea
        placeholder="Delivery address"
        value={address}
        onChange={e => setAddress(e.target.value)}
        style={{ ...input, height: 90 }}
      />

      {/* PAYMENT METHOD */}
      <div style={{ marginTop: 15 }}>
        <p><b>Payment Method</b></p>
        <p>Cash on Delivery</p>
      </div>

      <p style={{ marginTop: 15 }}>
        Items: {cart.length}
      </p>

      <p style={{ fontWeight: "bold" }}>
        Total: {total} RWF
      </p>

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

/* STYLES */

const input: React.CSSProperties = {
  width: "100%",
  padding: 12,
  marginTop: 12,
  border: "1px solid #ccc",
}

const btn: React.CSSProperties = {
  marginTop: 20,
  background: "black",
  color: "white",
  padding: 14,
  width: "100%",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
}
