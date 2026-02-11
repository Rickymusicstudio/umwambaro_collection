"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { addToCart } from "@/lib/cart"
import Link from "next/link"

/* ================= TYPES ================= */

type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  images: string[] | null
  category_id: number
  sizes: string[] | null
  size_stock: Record<string, number> | null
  status?: string
}

type RelatedProduct = {
  id: string
  name: string
  price: number
  image_url: string | null
  images: string[] | null
  status?: string
}

type Review = {
  id: string
  rating: number
  comment: string
}

/* ================= PAGE ================= */

export default function ProductPage() {

  const params = useParams()
  const id = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [mainImage, setMainImage] = useState("")
  const [related, setRelated] = useState<RelatedProduct[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  const [showViewer, setShowViewer] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    fetchProduct()
    fetchReviews()
  }, [])

  useEffect(() => {
    if (product?.sizes?.length) {
      setSelectedSize(product.sizes[0])
    }
  }, [product])

  /* ---------------- PRODUCT ---------------- */

  async function fetchProduct() {
    const { data } = await supabase
      .from("products")
      .select("id,name,description,price,image_url,images,category_id,sizes,size_stock,status")
      .eq("id", id)
      .single()

    if (!data) return

    setProduct(data as Product)

    if (data.images?.length) setMainImage(data.images[0])
    else if (data.image_url) setMainImage(data.image_url)

    loadRelated(data.category_id, data.id)
  }

  async function loadRelated(categoryId: number, productId: string) {
    const { data } = await supabase
      .from("products")
      .select("id,name,price,image_url,images,status")
      .eq("category_id", categoryId)
      .neq("id", productId)
      .not("status", "in", '("sold","reserved")')
      .limit(4)

    setRelated((data as RelatedProduct[]) || [])
  }

  /* ---------------- REVIEWS ---------------- */

  async function fetchReviews() {
    const { data } = await supabase
      .from("reviews")
      .select("id,rating,comment")
      .eq("product_id", id)

    setReviews((data as Review[]) || [])
  }

  const avgRating =
    reviews.length === 0
      ? 0
      : Math.round(
          reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        )

  if (!product) return <p className="p-6">Loading...</p>

  const isSold = product.status === "sold"
  const isReserved = product.status === "reserved"

  /* ================= UI ================= */

  return (
    <div className="max-w-6xl mx-auto p-4">

      {/* FULLSCREEN VIEWER */}
      {showViewer && (
        <div className="viewer">
          <button
            className="close-btn"
            onClick={() => {
              setShowViewer(false)
              setZoomed(false)
            }}
          >
            ✕
          </button>

          <img
            src={mainImage}
            onDoubleClick={() => setZoomed(!zoomed)}
            className={`viewer-img ${zoomed ? "zoomed" : ""}`}
          />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">

        {/* GALLERY */}
        <div>
          <div
            className="main-img-box"
            onClick={() => setShowViewer(true)}
          >
            <img src={mainImage} className="main-img" />
          </div>

          <div className="thumbs">
            {product.images?.map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setMainImage(img)}
                className={`thumb ${mainImage === img ? "active" : ""}`}
              />
            ))}
          </div>
        </div>

        {/* INFO */}
        <div>

          <h1 className="text-3xl font-bold">{product.name}</h1>

          {(isSold || isReserved) && (
            <div
              style={{
                marginTop: 10,
                padding: "6px 12px",
                background: isSold ? "red" : "#2563eb",
                color: "white",
                borderRadius: 6,
                display: "inline-block",
                fontSize: 12
              }}
            >
              {isSold ? "SOLD" : "RESERVED"}
            </div>
          )}

          <div className="mt-2">
            {"★".repeat(avgRating)}
            {"☆".repeat(5 - avgRating)}
            <span> ({reviews.length})</span>
          </div>

          <p className="text-2xl font-semibold mt-3">
            {product.price} RWF
          </p>

          <p className="mt-4">{product.description}</p>

          {/* SIZE */}
          {product.sizes && (
            <div className="mt-6">
              <p className="font-semibold mb-2">Select Size</p>

              <div className="flex gap-2 flex-wrap">
                {product.sizes.map(size => {
                  const stock = product.size_stock?.[size] ?? 999
                  const disabled = stock === 0

                  return (
                    <button
                      key={size}
                      disabled={disabled}
                      onClick={() => setSelectedSize(size)}
                      className={`size-btn
                        ${disabled ? "disabled" : ""}
                        ${selectedSize === size ? "active" : ""}
                      `}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ADD TO CART */}
          <button
            disabled={isSold || isReserved}
            onClick={() =>
              !isSold &&
              !isReserved &&
              addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: mainImage,
                size: selectedSize
              })
            }
            className="add-btn"
            style={{
              background: isSold
                ? "#999"
                : isReserved
                ? "#3b82f6"
                : "black",
              cursor:
                isSold || isReserved
                  ? "not-allowed"
                  : "pointer"
            }}
          >
            {isSold
              ? "SOLD"
              : isReserved
              ? "RESERVED"
              : "Add to Cart"}
          </button>

        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-4">
            Related Products
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(p => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="border p-3 rounded"
              >
                <img
                  src={p.images?.[0] || p.image_url || "/placeholder.png"}
                  className="w-full h-40 object-contain"
                />
                <h3 className="mt-2">{p.name}</h3>
                <p className="font-bold">{p.price} RWF</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* STYLES */}
      <style jsx>{`
        .main-img-box{
          width:100%;
          height:350px;
          border:1px solid #ddd;
          border-radius:10px;
          display:flex;
          justify-content:center;
          align-items:center;
          background:white;
          cursor:pointer;
        }
        .main-img{
          max-width:100%;
          max-height:100%;
          object-fit:contain;
        }
        .thumbs{
          display:flex;
          gap:10px;
          margin-top:10px;
          flex-wrap:wrap;
        }
        .thumb{
          width:70px;
          height:70px;
          object-fit:contain;
          border:1px solid #ccc;
          border-radius:6px;
          cursor:pointer;
        }
        .thumb.active{
          border:2px solid black;
        }
        .size-btn{
          padding:8px 14px;
          border:1px solid #ccc;
          border-radius:6px;
          background:white;
        }
        .size-btn.active{
          background:black;
          color:white;
        }
        .size-btn.disabled{
          background:#eee;
          color:#999;
        }
        .add-btn{
          margin-top:30px;
          color:white;
          padding:14px;
          width:100%;
          border-radius:8px;
          border:none;
        }
        .viewer{
          position:fixed;
          inset:0;
          background:black;
          z-index:9999;
          display:flex;
          justify-content:center;
          align-items:center;
        }
        .viewer-img{
          max-width:100%;
          max-height:100%;
          object-fit:contain;
          transition:transform .3s;
        }
        .viewer-img.zoomed{
          transform:scale(2);
        }
        .close-btn{
          position:absolute;
          top:20px;
          right:20px;
          background:white;
          border:none;
          padding:8px 12px;
          font-size:18px;
          border-radius:6px;
        }
      `}</style>

    </div>
  )
}
