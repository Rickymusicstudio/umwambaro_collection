"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

/* ================= TYPES ================= */

type Product = {
  id: string
  name: string
  price: number
  purchase_price: number | null
  paid_amount: number | null
  paid_at: string | null
}

/* ================= PAGE ================= */

export default function AccountingPage() {

  const [rows, setRows] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    loadPaidProducts()
  }, [])

  /* ---------------- LOAD ---------------- */

  async function loadPaidProducts() {

    const { data } = await supabase
      .from("products")
      .select("id,name,price,purchase_price,paid_amount,paid_at")
      .eq("paid", true)
      .order("paid_at", { ascending: false })

    setRows(data || [])
    setLoading(false)
  }

  /* ---------------- UPDATE PURCHASE PRICE ---------------- */

  async function savePurchasePrice(id: string, value: string) {

    if (isNaN(Number(value))) {
      alert("Invalid purchase price")
      return
    }

    setSavingId(id)

    const { error } = await supabase
      .from("products")
      .update({
        purchase_price: Number(value)
      })
      .eq("id", id)

    if (error) {
      console.log(error)
      alert("Failed to save")
    } else {
      await loadPaidProducts()
    }

    setSavingId(null)
  }

  /* ---------------- TOTALS ---------------- */

  const totalSales = rows.reduce(
    (sum, p) => sum + (p.paid_amount || 0),
    0
  )

  const totalPurchases = rows.reduce(
    (sum, p) => sum + (p.purchase_price || 0),
    0
  )

  const profit = totalSales - totalPurchases

  /* ================= UI ================= */

  return (
    <div style={{ maxWidth: 1100 }}>

      <h1>Accounting</h1>

      <div style={{ display: "flex", gap: 30, marginTop: 10 }}>
        <strong>Total Sales: {totalSales.toLocaleString()} RWF</strong>
        <strong>Total Purchases: {totalPurchases.toLocaleString()} RWF</strong>
        <strong>Profit: {profit.toLocaleString()} RWF</strong>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && rows.length === 0 && (
        <p>No paid products yet.</p>
      )}

      {!loading && rows.length > 0 && (

        <div style={{ marginTop: 20, overflowX: "auto" }}>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "white"
            }}
          >

            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <Th>Product</Th>
                <Th>Listed Price</Th>
                <Th>Purchase Price</Th>
                <Th>Paid Amount</Th>
                <Th>Paid Date</Th>
              </tr>
            </thead>

            <tbody>

              {rows.map((p, index) => (

                <tr key={p.id}>

                  <Td>{p.name}</Td>

                  <Td>{p.price.toLocaleString()} RWF</Td>

                  {/* PURCHASE INPUT */}
                  <Td>

                    <div style={{ display: "flex", gap: 6 }}>

                      <input
                        type="number"
                        defaultValue={p.purchase_price ?? ""}
                        placeholder="Enter"
                        style={{
                          width: 90,
                          padding: 4,
                          border: "1px solid #ccc",
                          borderRadius: 4
                        }}
                        id={`pp-${index}`}
                      />

                      <button
                        onClick={() => {
                          const el = document.getElementById(
                            `pp-${index}`
                          ) as HTMLInputElement

                          savePurchasePrice(p.id, el.value)
                        }}
                        disabled={savingId === p.id}
                        style={{
                          padding: "4px 8px",
                          fontSize: 12,
                          cursor: "pointer"
                        }}
                      >
                        {savingId === p.id ? "Saving..." : "Save"}
                      </button>

                    </div>

                  </Td>

                  <Td>
                    {p.paid_amount?.toLocaleString()} RWF
                  </Td>

                  <Td>
                    {p.paid_at
                      ? new Date(p.paid_at).toLocaleString()
                      : "-"}
                  </Td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  )
}

/* ================= SMALL COMPONENTS ================= */

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: 10,
        borderBottom: "1px solid #ddd",
        fontSize: 14
      }}
    >
      {children}
    </th>
  )
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td
      style={{
        padding: 10,
        borderBottom: "1px solid #eee",
        fontSize: 14
      }}
    >
      {children}
    </td>
  )
}
