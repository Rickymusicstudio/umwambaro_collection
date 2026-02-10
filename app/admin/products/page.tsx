"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Product = {
  id: string
  name: string
  price: number
  image_url: string
  status: string | null
  is_active: boolean
  paid: boolean | null
  paid_amount: number | null
  debt: number | null
  is_debt: boolean | null
  credit_customer: string | null
  credit_phone: string | null
}

export default function AdminProductsPage() {

  const [products, setProducts] = useState<Product[]>([])
  const [filter, setFilter] = useState<
    "all" | "active" | "sold" | "hidden" | "paid" | "ideni"
  >("all")

  const router = useRouter()

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const { data } = await supabase
      .from("products")
      .select(`
        id,
        name,
        price,
        image_url,
        status,
        is_active,
        paid,
        paid_amount,
        debt,
        is_debt,
        credit_customer,
        credit_phone
      `)
      .order("created_at", { ascending: false })

    setProducts(data || [])
  }

  /* ---------------- DELETE ---------------- */

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return

    const res = await fetch(`/admin/products/delete/${id}`, {
      method: "POST"
    })

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
        paid_amount: null,
        debt: 0,
        is_debt: false,
        credit_customer: null,
        credit_phone: null
      })
      .eq("id", id)

    if (error) {
      alert("Repost failed")
    } else {
      await loadProducts()
    }
  }

  /* ---------------- MARK PAID ---------------- */

  async function handleMarkPaid(product: Product) {

    const { error } = await supabase
      .from("products")
      .update({
        paid: true,
        paid_amount: product.price,
        debt: 0,
        is_debt: false,
        credit_customer: null,
        credit_phone: null,
        status: "sold",
        is_active: false,
        paid_at: new Date().toISOString()
      })
      .eq("id", product.id)

    if (error) {
      alert("Failed to mark paid")
    } else {
      await loadProducts()
    }
  }

  /* ---------------- MARK AS IDENI ---------------- */

  async function handleMarkIdeni(product: Product) {

    const name = prompt("Customer name:")
    if (!name) return

    const phone = prompt("Customer phone:")
    if (!phone) return

    const { error } = await supabase
      .from("products")
      .update({
        paid: true,
        paid_amount: 0,
        debt: product.price,
        is_debt: true,
        credit_customer: name,
        credit_phone: phone,
        status: "sold",
        is_active: false,
        paid_at: new Date().toISOString()
      })
      .eq("id", product.id)

    if (error) {
      alert("Failed to mark as ideni")
    } else {
      await loadProducts()
    }
  }

  /* ---------------- FILTER ---------------- */

  const filteredProducts = products.filter((p) => {

    const isSold = p.status?.toLowerCase() === "sold"
    const isHidden = !p.is_active
    const isPaid = p.paid === true
    const isIdeni = p.is_debt === true

    if (filter === "active") return !isSold && !isHidden
    if (filter === "sold") return isSold
    if (filter === "hidden") return isHidden
    if (filter === "paid") return isPaid && !isIdeni
    if (filter === "ideni") return isIdeni

    return true
  })

  return (
    <div style={{ maxWidth: 900 }}>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15
      }}>
        <h1>Product List</h1>

        <Link href="/admin/products/new">
          ➕ Add Product
        </Link>
      </div>

      {/* FILTERS */}
      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        {["all","active","sold","hidden","paid","ideni"].map((f) => (
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

            <img
              src={p.image_url || "/placeholder.png"}
              style={{
                width: 70,
                height: 70,
                objectFit: "cover",
                borderRadius: 8
              }}
            />

            <div style={{ flex: 1 }}>
              <b>{p.name}</b>
              <div>{p.price} RWF</div>

              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>

                {isPaid && !p.is_debt && (
                  <Badge color="#16a34a">PAID</Badge>
                )}

                {p.is_debt && (
                  <Badge color="#f59e0b">
                    IDENI ({p.credit_customer})
                  </Badge>
                )}

                {isHidden && <Badge color="#f97316">HIDDEN</Badge>}

                {!isSold && !isHidden && !isPaid && (
                  <Badge color="#22c55e">ACTIVE</Badge>
                )}
              </div>
            </div>

            <Link
              href={`/admin/products/edit/${p.id}`}
              style={{ marginRight: 15 }}
            >
              Edit
            </Link>

            {!isPaid && (
              <>
                <button
                  onClick={() => handleMarkPaid(p)}
                  style={{
                    marginRight: 10,
                    color: "#2563eb",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Mark Paid
                </button>

                <button
                  onClick={() => handleMarkIdeni(p)}
                  style={{
                    marginRight: 15,
                    color: "#f59e0b",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Sell on Ideni
                </button>
              </>
            )}

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
