"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { addToCart } from "@/lib/cart"
import type { CSSProperties } from "react"

/* ================= TYPES ================= */

type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  images: string[] | null
  category_id: number
  condition: string
}

type Category = {
  id: number
  name: string
}

/* ================= PAGE ================= */

export default function ProductsPage() {

  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [activeCondition, setActiveCondition] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("")
  const [addedId, setAddedId] = useState<string | null>(null)

  const [showMobileFilters, setShowMobileFilters] = useState(false)

  /* ---------------- LOAD ---------------- */

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  async function loadProducts() {
    const { data } = await supabase
      .from("products")
      .select("id,name,description,price,image_url,images,category_id,condition")
      .eq("is_active", true)

    setProducts(data || [])
    setAllProducts(data || [])
  }

  async function loadCategories() {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name")

    setCategories(data || [])
  }

  /* ---------------- FILTER ---------------- */

  function applyFilters(
    catId = activeCategory,
    text = search,
    sortValue = sort,
    condition = activeCondition
  ) {

    let filtered = [...allProducts]

    if (catId) filtered = filtered.filter(p => p.category_id === catId)
    if (condition) filtered = filtered.filter(p => p.condition === condition)
    if (text)
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(text.toLowerCase())
      )

    if (sortValue === "low") filtered.sort((a, b) => a.price - b.price)
    if (sortValue === "high") filtered.sort((a, b) => b.price - a.price)

    setProducts(filtered)
  }

  function selectCategory(id: number | null) {
    setActiveCategory(id)
    applyFilters(id)
  }

  function selectCondition(value: string | null) {
    setActiveCondition(value)
    applyFilters(activeCategory, search, sort, value)
  }

  /* ---------------- CART ---------------- */

  function handleAdd(product: Product) {

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.images?.[0] || product.image_url,
    })

    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 800)
  }

  /* ================= UI ================= */

  return (
    <div className="products-page" style={page}>

      {/* MOBILE DRAWER */}
      {showMobileFilters && (
        <div className="mobile-sidebar">

          <button style={closeBtn} onClick={() => setShowMobileFilters(false)}>
            Close ✖
          </button>

          <h3>Condition</h3>

          <div style={activeCondition === null ? catActive : catItem}
            onClick={() => { selectCondition(null); setShowMobileFilters(false) }}>
            All
          </div>

          <div style={activeCondition === "new" ? catActive : catItem}
            onClick={() => { selectCondition("new"); setShowMobileFilters(false) }}>
            New
          </div>

          <div style={activeCondition === "used" ? catActive : catItem}
            onClick={() => { selectCondition("used"); setShowMobileFilters(false) }}>
            Used (Chaguwa)
          </div>

          <hr style={{ margin: "15px 0" }} />

          <h3>Categories</h3>

          <div style={activeCategory === null ? catActive : catItem}
            onClick={() => { selectCategory(null); setShowMobileFilters(false) }}>
            All Products
          </div>

          {categories.map(cat => (
            <div key={cat.id}
              style={activeCategory === cat.id ? catActive : catItem}
              onClick={() => { selectCategory(cat.id); setShowMobileFilters(false) }}>
              {cat.name}
            </div>
          ))}

        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside style={sidebar}>

        <h3>Condition</h3>

        <div style={activeCondition === null ? catActive : catItem}
          onClick={() => selectCondition(null)}>All</div>

        <div style={activeCondition === "new" ? catActive : catItem}
          onClick={() => selectCondition("new")}>New</div>

        <div style={activeCondition === "used" ? catActive : catItem}
          onClick={() => selectCondition("used")}>Used (Chaguwa)</div>

        <hr style={{ margin: "15px 0" }} />

        <h3>Categories</h3>

        <div style={activeCategory === null ? catActive : catItem}
          onClick={() => selectCategory(null)}>All Products</div>

        {categories.map(cat => (
          <div key={cat.id}
            style={activeCategory === cat.id ? catActive : catItem}
            onClick={() => selectCategory(cat.id)}>
            {cat.name}
          </div>
        ))}

      </aside>

      {/* MAIN */}
      <main style={{ flex: 1 }}>

        <h1 style={{ fontSize: 28 }}>Products</h1>

        <div style={filterRow}>

          <input
            placeholder="Search product..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              applyFilters(activeCategory, e.target.value)
            }}
            style={searchInput}
          />

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value)
              applyFilters(activeCategory, search, e.target.value)
            }}
            style={searchInput}
          >
            <option value="">Sort</option>
            <option value="low">Price: Low → High</option>
            <option value="high">Price: High → Low</option>
          </select>

        </div>

        {/* GRID */}
        <div style={gridStyle}>

          {products.map(p => {

            const mainImg = p.images?.[0] || p.image_url
            const hoverImg = p.images?.[1] || mainImg

            return (
              <div key={p.id} style={cardStyle}>

                <Link href={`/products/${p.id}`}>

                  <div style={imageWrapper} className="product-card">

                    <div style={mainBadge}>
                      {p.condition === "used" ? "CHAGUWA" : "NEW"}
                    </div>

                    <img src={mainImg} style={imageStyle} />
                    <img src={hoverImg} className="img-hover" style={imageStyle} />

                  </div>

                </Link>

                <h3>{p.name}</h3>
                <p style={{ color: "#555" }}>{p.description}</p>

                {/* PRICE */}
                <strong style={{ marginTop: "auto", marginBottom: 8 }}>
                  {p.price} RWF
                </strong>

                {/* BUTTON */}
                <button
                  onClick={() => handleAdd(p)}
                  style={{
                    ...btnStyle,
                    background: addedId === p.id ? "#22c55e" : "#f0c36d",
                  }}
                >
                  {addedId === p.id ? "Added ✓" : "Add to Cart"}
                </button>

              </div>
            )
          })}

        </div>

      </main>

      {/* HOVER EFFECT */}
      <style jsx>{`
        .product-card img {
          position:absolute;
          top:0;
          left:0;
          transition:.3s;
        }
        .img-hover{opacity:0}
        .product-card:hover .img-hover{opacity:1}
        .product-card:hover img:first-child{opacity:0}
      `}</style>

    </div>
  )
}

/* ================= STYLES ================= */

const page: CSSProperties = {
  display: "flex",
  gap: 30,
  padding: 30,
}

const sidebar: CSSProperties = {
  width: 220,
  background: "#fafafa",
  padding: 20,
  borderRadius: 12,
}

const catItem: CSSProperties = {
  padding: "10px 12px",
  borderRadius: 6,
  cursor: "pointer",
}

const catActive: CSSProperties = {
  ...catItem,
  background: "black",
  color: "white",
}

const filterRow: CSSProperties = {
  display: "flex",
  gap: 10,
  margin: "20px 0",
  flexWrap: "wrap",
}

const searchInput: CSSProperties = {
  padding: 10,
  borderRadius: 6,
  border: "1px solid #ccc",
  width: "100%",
  maxWidth: 240,
}

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
  gap: 20,
}

const cardStyle: CSSProperties = {
  border: "2px solid black",
  borderRadius: 18,
  padding: 16,
  display: "flex",
  flexDirection: "column",
}

const imageWrapper: CSSProperties = {
  width: "100%",
  height: 220,
  position: "relative",
  overflow: "hidden",
  borderRadius: 12,
}

const imageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
}

const mainBadge: CSSProperties = {
  position: "absolute",
  top: 8,
  left: 8,
  background: "black",
  color: "white",
  fontSize: 11,
  padding: "3px 7px",
  borderRadius: 4,
  zIndex: 5,
}

const btnStyle: CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
}

const closeBtn: CSSProperties = {
  width: "100%",
  padding: 10,
  background: "black",
  color: "white",
  border: "none",
  borderRadius: 8,
  marginBottom: 15,
}
