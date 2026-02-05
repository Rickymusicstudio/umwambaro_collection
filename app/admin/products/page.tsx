"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"

/* ================= TYPES ================= */

type Product = {
  id: string
  name: string
  price: number
  image_url: string
  status: string | null
  is_active: boolean
  paid: boolean | null
  paid_amount: number | null
}

/* ================= PAGE ================= */

export default function AdminProductsPage() {

  const [products, setProducts] = useState<Product[]>([])
  const [filter, setFilter] = useState<
    "all" | "active" | "sold" | "hidden" | "paid"
  >("all")

  const router = useRouter()

  useEffect(() => {
    loadProducts()
  }, [])

  /* ---------------- LOAD ---------------- */

  async function loadProducts() {
    const { data } = await supabase
      .from("products")
      .select("id,name,price,image_url,status,is_active,paid,paid_amount")
      .order("created_at", { ascending: false })

    setProducts(data || [])
  }

  /* ---------------- DELETE ---------------- */

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return

    const res = await fetch(
      `/admin/products/delete/${id}`,
      { method: "POST" }
    )

    if (res.ok) {
      await loadProducts()
      router.push("/admin/products")
    } else {
      alert("Delete failed")
    }
  }

  /* ---------------- REPOST ---------------- */

  async function handleRepost(id: string) {

    if (!confirm("Repost this product?")) return

    const { error } = await supabase
      .from("products")
      .update({
        status: null,
        is_active: true,
        paid: false,
        paid_amount: null
      })
      .eq("id", id)

    if (error) {
      console.log(error)
      alert("Repost failed")
    } else {
      await loadProducts()
    }
  }

  /* ---------------- MARK PAID ---------------- */

  async function handleMarkPaid(id: string) {

    const amount = prompt("Enter amount paid:")

    if (!amount) return
    if (isNaN(Number(amount))) {
      alert("Invalid amount")
      return
    }

    const { error } = await supabase
      .from("products")
      .update({
        paid: true,
        paid_amount: Number(amount),
        status: "sold",
        is_active: false,
        paid_at: new Date().toISOString()
      })
      .eq("id", id)

    if (error) {
      console.log(error)
      alert("Failed to mark paid")
    } else {
      await loadProducts()
    }
  }

  /* ---------------- EDIT PAID AMOUNT ---------------- */

  async function handleEditAmount(id: string, current: number | null) {

    const amount = prompt(
      "Enter new paid amount:",
      String(current ?? "")
    )

    if (!amount) return
    if (isNaN(Number(amount))) {
      alert("Invalid amount")
      return
    }

    const { error } = await supabase
      .from("products")
      .update({
        paid_amount: Number(amount)
      })
      .eq("id", id)

    if (error) {
      console.log(error)
      alert("Update failed")
    } else {
      await loadProducts()
    }
  }

  /* ---------------- FILTER ---------------- */

  const filteredProducts = products.filter((p) => {

    const isSold = p.status?.toLowerCase() === "sold"
    const isHidden = !p.is_active
    const isPaid = p.paid === true

    if (filter === "active") return !isSold && !isHidden
    if (filter === "sold") return isSold
    if (filter === "hidden") return isHidden
    if (filter === "paid") return isPaid

    return true
  })

  /* ================= UI ================= */

  return (
    <div style={{ maxWidth: 900 }}>

      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 15
        }}
      >
        <h1>Product List</h1>

        <Link href="/admin/products/new">
          ➕ Add Product
        </Link>
      </div>

      {/* FILTER TABS */}
      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        {["all","active","sold","hidden","paid"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: "1px solid #ddd",
              background: filter === f ? "black" : "white",
              color: filter === f ? "white" : "black",
              cursor: "pointer"
            }}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      <hr />

      {/* PRODUCTS */}
      {filteredProducts.map((p) => {

        const isSold = p.status?.toLowerCase() === "sold"
        const isHidden = !p.is_active
        const isPaid = p.paid === true

        return (
          <div
            key={p.id}
            style={{
              background: "white",
              padding: 15,
              borderRadius: 10,
              marginTop: 15,
              display: "flex",
              alignItems: "center",
              gap: 15
            }}
          >

            {/* IMAGE */}
            <img
              src={p.image_url || "/placeholder.png"}
              style={{
                width: 70,
                height: 70,
                objectFit: "cover",
                borderRadius: 8
              }}
            />

            {/* INFO */}
            <div style={{ flex: 1 }}>
              <b>{p.name}</b>
              <div>{p.price} RWF</div>

              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>

                {isPaid && (
                  <>
                    <Badge color="#16a34a">
                      PAID ({p.paid_amount} RWF)
                    </Badge>

                    <button
                      onClick={() =>
                        handleEditAmount(p.id, p.paid_amount)
                      }
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#2563eb",
                        cursor: "pointer",
                        fontSize: 12
                      }}
                    >
                      Edit Amount
                    </button>
                  </>
                )}

                {!isPaid && isSold && (
                  <Badge color="#ef4444">SOLD</Badge>
                )}

                {isHidden && <Badge color="#f97316">HIDDEN</Badge>}

                {!isSold && !isHidden && !isPaid && (
                  <Badge color="#22c55e">ACTIVE</Badge>
                )}
              </div>
            </div>

            {/* EDIT */}
            <Link
              href={`/admin/products/edit/${p.id}`}
              style={{ marginRight: 15 }}
            >
              Edit
            </Link>

            {/* MARK PAID */}
            {!isPaid && (
              <button
                onClick={() => handleMarkPaid(p.id)}
                style={{
                  marginRight: 15,
                  color: "#2563eb",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Mark Paid
              </button>
            )}

            {/* REPOST */}
            {(isSold || isHidden || isPaid) && (
              <button
                onClick={() => handleRepost(p.id)}
                style={{
                  marginRight: 15,
                  color: "green",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Repost
              </button>
            )}

            {/* DELETE */}
            <button
              onClick={() => handleDelete(p.id)}
              style={{
                color: "red",
                background: "transparent",
                border: "none",
                cursor: "pointer"
              }}
            >
              Delete
            </button>

          </div>
        )
      })}

      {filteredProducts.length === 0 && (
        <p style={{ marginTop: 30 }}>
          No products found.
        </p>
      )}

    </div>
  )
}

/* ================= BADGE ================= */

function Badge({
  children,
  color
}: {
  children: React.ReactNode
  color: string
}) {
  return (
    <span
      style={{
        background: color,
        color: "white",
        padding: "2px 10px",
        fontSize: 11,
        borderRadius: 20
      }}
    >
      {children}
    </span>
  )
}
