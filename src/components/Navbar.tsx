"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { getCart } from "@/lib/cart"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Navbar() {
  const [count, setCount] = useState(0)
  const [search, setSearch] = useState("")
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  /* ---------------- CART COUNT ---------------- */

  useEffect(() => {
    const update = () => {
      const cart = getCart()
      setCount(cart.reduce((s, i) => s + i.quantity, 0))
    }

    update()
    window.addEventListener("cart-change", update)

    return () => {
      window.removeEventListener("cart-change", update)
    }
  }, [])

  /* ---------------- AUTH ---------------- */

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
  }, [])

  /* ---------------- SEARCH ---------------- */

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(`/products?search=${search}`)
  }

  /* ---------------- LOGOUT ---------------- */

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <header
      style={{
        backgroundColor: "#131921",
        padding: "12px 20px",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto auto",
        alignItems: "center",
        gap: "20px",
      }}
    >

      {/* LOGO */}
      <Link
        href="/products"
        style={{
          color: "white",
          fontSize: 20,
          fontWeight: "bold",
        }}
      >
        UMWAMBARO
      </Link>

      {/* SEARCH */}
      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          justifySelf: "center",
          width: "100%",
          maxWidth: 700,
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products"
          style={{
            flex: 1,
            padding: "10px",
            backgroundColor: "white",
            color: "black",
            border: "none",
            outline: "none",
            borderRadius: "6px 0 0 6px",
            fontSize: 14,
          }}
        />

        <button
          type="submit"
          style={{
            backgroundColor: "#febd69",
            border: "none",
            padding: "0 18px",
            borderRadius: "0 6px 6px 0",
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          🔍
        </button>
      </form>

      {/* LOGIN / LOGOUT */}
      {user ? (
        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontSize: 15,
          }}
        >
          Logout
        </button>
      ) : (
        <Link
          href="/login"
          style={{ color: "white", fontSize: 15 }}
        >
          Login
        </Link>
      )}

      {/* CART */}
      <Link
        href="/cart"
        style={{
          color: count > 0 ? "#febd69" : "white",
          fontSize: 16,
          position: "relative",
          fontWeight: count > 0 ? "bold" : "normal",
        }}
      >
        🛒 Cart

        {count > 0 && (
          <span
            style={{
              position: "absolute",
              top: -8,
              right: -12,
              backgroundColor: "#febd69",
              color: "black",
              fontSize: 12,
              padding: "2px 6px",
              borderRadius: 20,
            }}
          >
            {count}
          </span>
        )}
      </Link>

    </header>
  )
}
