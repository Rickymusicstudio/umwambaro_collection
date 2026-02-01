"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

/* ================= TYPES ================= */

type Category = {
  id: number
  name: string
}

/* ================= PAGE ================= */

export default function EditProductPage() {

  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [condition, setCondition] = useState("new")

  // ✅ AUDIENCE
  const [audience, setAudience] = useState("")

  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState<number | "">("")

  const [loading, setLoading] = useState(false)

  /* ================= LOAD ================= */

  useEffect(() => {
    loadCategories()
    loadProduct()
  }, [])

  async function loadCategories() {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name")

    setCategories(data || [])
  }

  async function loadProduct() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single()

    if (!data) return

    setName(data.name)
    setDescription(data.description)
    setPrice(String(data.price))
    setCondition(data.condition)
    setCategoryId(data.category_id)
    setAudience(data.audience || "")
  }

  /* ================= UPDATE ================= */

  async function handleUpdate() {

    if (!name || !price || !categoryId || !audience) {
      alert("Missing fields")
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from("products")
      .update({
        name,
        description,
        price: Number(price),
        condition,
        category_id: categoryId,
        audience, // ✅ SAVE
      })
      .eq("id", id)

    if (error) {
      console.log(error)
      alert("Update failed")
    } else {
      alert("Product updated")
      router.push("/admin/products")
    }

    setLoading(false)
  }

  /* ================= UI ================= */

  return (
    <div style={page}>
      <div style={card}>

        <h2>Edit Product</h2>

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name"
          style={input}
        />

        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Description"
          style={{ ...input, height: 120 }}
        />

        <input
          type="number"
          value={price}
          onChange={e => setPrice(e.target.value)}
          placeholder="Price"
          style={input}
        />

        {/* ✅ AUDIENCE */}
        <select
          value={audience}
          onChange={e => setAudience(e.target.value)}
          style={input}
        >
          <option value="">Select Audience</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="kids">Kids</option>
          <option value="sport">Sport</option>
        </select>

        <select
          value={categoryId}
          onChange={e => setCategoryId(Number(e.target.value))}
          style={input}
        >
          <option value="">Select Category</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={condition}
          onChange={e => setCondition(e.target.value)}
          style={input}
        >
          <option value="new">New</option>
          <option value="used">Used</option>
        </select>

        <button
          onClick={handleUpdate}
          disabled={loading}
          style={saveBtn}
        >
          {loading ? "Updating..." : "Update Product"}
        </button>

      </div>
    </div>
  )
}

/* ================= STYLES ================= */

const page = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  paddingTop: 40,
}

const card = {
  width: 600,
  background: "white",
  padding: 30,
  borderRadius: 10,
}

const input = {
  width: "100%",
  padding: 12,
  marginTop: 12,
  borderRadius: 6,
  border: "1px solid #ccc",
}

const saveBtn = {
  marginTop: 25,
  width: "100%",
  padding: 14,
  background: "black",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
}
