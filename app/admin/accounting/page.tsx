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
  debt: number | null
  is_debt: boolean | null
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
      .select(`
        id,
        name,
        price,
        purchase_price,
        paid_amount,
        paid_at,
        debt,
        is_debt
      `)
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
      alert("Failed to save")
    } else {
      await loadPaidProducts()
    }

    setSavingId(null)
  }

  /* ---------------- PAY DEBT ---------------- */

  async function payDebt(product: Product, amount: string) {

    const pay = Number(amount)

    if (isNaN(pay) || pay <= 0) {
      alert("Invalid amount")
      return
    }

    const currentPaid = product.paid_amount || 0
    const newPaid = currentPaid + pay
    const newDebt = Math.max(product.price - newPaid, 0)

    setSavingId(product.id)

    const { error } = await supabase
      .from("products")
      .update({
        paid_amount: newPaid,
        debt: newDebt,
        is_debt: newDebt > 0
      })
      .eq("id", product.id)

    if (error) {
      alert("Failed to update payment")
    } else {
      await loadPaidProducts()
    }

    setSavingId(null)
  }

  /* ---------------- TOTALS ---------------- */

  const totalCashReceived = rows.reduce(
    (sum, p) => sum + (p.paid_amount || 0),
    0
  )

  const totalPurchases = rows.reduce(
    (sum, p) => sum + (p.purchase_price || 0),
    0
  )

  const totalDebt = rows.reduce(
    (sum, p) => sum + (p.debt || 0),
    0
  )

  const profit = totalCashReceived - totalPurchases

  /* ================= UI ================= */

  return (
    <div style={{ maxWidth: 1100 }}>

      <h1>Accounting</h1>

      <div style={{ display: "flex", gap: 30, marginTop: 10 }}>
        <strong>Cash Received: {totalCashReceived.toLocaleString()} RWF</strong>
        <strong>Total Purchases: {totalPurchases.toLocaleString()} RWF</strong>
        <strong>Outstanding Ideni: {totalDebt.toLocaleString()} RWF</strong>
        <strong>Profit (Cash): {profit.toLocaleString()} RWF</strong>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && rows.length === 0 && (
        <p>No sales yet.</p>
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
                <Th>Debt</Th>
                <Th>Pay Ideni</Th>
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
                      >
                        {savingId === p.id ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </Td>

                  <Td>
                    {(p.paid_amount || 0).toLocaleString()} RWF
                  </Td>

                  <Td>
                    {(p.debt || 0).toLocaleString()} RWF
                  </Td>

                  {/* PAY DEBT */}
                  <Td>
                    {p.debt && p.debt > 0 && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <input
                          type="number"
                          placeholder="Amount"
                          style={{
                            width: 90,
                            padding: 4,
                            border: "1px solid #ccc",
                            borderRadius: 4
                          }}
                          id={`pay-${index}`}
                        />
                        <button
                          onClick={() => {
                            const el = document.getElementById(
                              `pay-${index}`
                            ) as HTMLInputElement

                            payDebt(p, el.value)
                          }}
                          disabled={savingId === p.id}
                        >
                          Pay
                        </button>
                      </div>
                    )}
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
