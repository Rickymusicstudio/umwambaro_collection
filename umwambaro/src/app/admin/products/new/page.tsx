"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

/* ================= TYPES ================= */

type Category = {
  id: number
  name: string
}

/* ================= PAGE ================= */

export default function AdminProductsPage() {

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")

  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState<number | "">("")

  const [condition, setCondition] = useState("new")   // ✅ NEW

  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  /* ---------------- LOAD CATEGORIES ---------------- */

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name")

    setCategories(data || [])
  }

  /* ---------------- IMAGE SELECT ---------------- */

  function handleSelectImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])

    if (files.length === 0) return

    setImages(prev => [...prev, ...files])

    setPreviews(prev => [
      ...prev,
      ...files.map(file => URL.createObjectURL(file))
    ])

    e.target.value = ""
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  /* ---------------- SAVE PRODUCT ---------------- */

  async function handleSave() {

    if (!name || !price || !categoryId || images.length === 0) {
      alert("Please fill all fields and upload images")
      return
    }

    setLoading(true)

    const uploadedUrls: string[] = []

    for (const file of images) {

      const fileName = `${Date.now()}-${file.name}`

      const { error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file)

      if (error) {
        console.log(error)
        alert("Image upload failed")
        setLoading(false)
        return
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName)

      uploadedUrls.push(data.publicUrl)
    }

    const { error } = await supabase
      .from("products")
      .insert({
        name,
        description,
        price: Number(price),
        image_url: uploadedUrls[0],
        images: uploadedUrls,
        category_id: categoryId,
        condition,          // ✅ SAVE
        is_active: true
      })

    if (error) {
      console.log(error)
      alert("Save failed")
    } else {
      alert("Product saved")

      setName("")
      setDescription("")
      setPrice("")
      setCategoryId("")
      setCondition("new")    // ✅ RESET
      setImages([])
      setPreviews([])
    }

    setLoading(false)
  }

  /* ================= UI ================= */

  return (
    <div style={{ padding: 40, maxWidth: 700 }}>

      <h1>Admin Panel</h1>
      <h2>Add Product</h2>

      <input
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        style={input}
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        style={{ ...input, height: 120 }}
      />

      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={e => setPrice(e.target.value)}
        style={input}
      />

      {/* CATEGORY */}
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

      {/* CONDITION */}
      <select
        value={condition}
        onChange={e => setCondition(e.target.value)}
        style={input}
      >
        <option value="new">New</option>
        <option value="used">Used (Chaguwa)</option>
      </select>

      {/* UPLOAD */}
      <label>
        <input
          type="file"
          multiple
          accept="image/*"
          hidden
          onChange={handleSelectImages}
        />
        <span style={uploadBtn}>Upload Images</span>
      </label>

      {/* PREVIEWS */}
      <div style={previewGrid}>
        {previews.map((src, i) => (
          <div key={i} style={previewBox}>

            {i === 0 && <div style={mainBadge}>MAIN</div>}

            <img src={src} style={previewImg} />

            <button
              onClick={() => removeImage(i)}
              style={removeBtn}
            >
              ✕
            </button>

          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        style={saveBtn}
      >
        {loading ? "Saving..." : "Save Product"}
      </button>

    </div>
  )
}

/* ================= STYLES ================= */

const input: React.CSSProperties = {
  width: "100%",
  padding: 12,
  marginTop: 12,
  border: "1px solid black",
}

const uploadBtn: React.CSSProperties = {
  display: "inline-block",
  marginTop: 15,
  background: "black",
  color: "white",
  padding: "10px 16px",
  borderRadius: 6,
  cursor: "pointer",
}

const previewGrid: React.CSSProperties = {
  marginTop: 15,
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 10,
}

const previewBox: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: 140,
  background: "#f2f2f2",
  borderRadius: 6,
  overflow: "hidden",
}

const previewImg: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",   // ✅ FIXED
}

const mainBadge: React.CSSProperties = {
  position: "absolute",
  top: 6,
  left: 6,
  background: "black",
  color: "white",
  fontSize: 11,
  padding: "2px 6px",
  borderRadius: 4,
  zIndex: 2
}

const removeBtn: React.CSSProperties = {
  position: "absolute",
  top: 4,
  right: 4,
  background: "black",
  color: "white",
  border: "none",
  borderRadius: "50%",
  width: 24,
  height: 24,
  cursor: "pointer",
}

const saveBtn: React.CSSProperties = {
  marginTop: 25,
  padding: "12px 20px",
  background: "black",
  color: "white",
  borderRadius: 6,
  border: "none",
}
