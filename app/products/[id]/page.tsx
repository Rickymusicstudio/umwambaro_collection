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
}

type Review = {
  id: string
  rating: number
  comment: string
  user_id: string
  created_at: string
}

/* ================= PAGE ================= */

export default function ProductPage() {

  const params = useParams()
  const id = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [mainImage, setMainImage] = useState("")
  const [related, setRelated] = useState<Product[]>([])

  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")

  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProduct()
    fetchReviews()
    getUser()
  }, [])

  /* ---------------- AUTH ---------------- */

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    setUserId(user?.id || null)
  }

  /* ---------------- PRODUCT ---------------- */

  async function fetchProduct() {
    const { data } = await supabase
      .from("products")
      .select("id,name,description,price,image_url,images,category_id")
      .eq("id", id)
      .single()

    if (!data) return

    setProduct(data)

    if (data.images?.length) setMainImage(data.images[0])
    else if (data.image_url) setMainImage(data.image_url)

    loadRelated(data.category_id, data.id)
    setLoading(false)
  }

  async function loadRelated(categoryId: number, productId: string) {
    const { data } = await supabase
      .from("products")
      .select("id,name,price,image_url")
      .eq("category_id", categoryId)
      .neq("id", productId)
      .limit(4)

    setRelated(data || [])
  }

  /* ---------------- REVIEWS ---------------- */

  async function fetchReviews() {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", id)
      .order("created_at", { ascending: false })

    setReviews(data || [])
  }

  async function submitReview() {
    if (!userId) return alert("Login required")
    if (!comment) return alert("Write comment")

    const { error } = await supabase.from("reviews").insert({
      product_id: id,
      user_id: userId,
      rating,
      comment,
    })

    if (error) {
      alert("Failed")
      console.log(error)
    } else {
      setComment("")
      setRating(5)
      fetchReviews()
    }
  }

  const avgRating =
    reviews.length === 0
      ? 0
      : Math.round(
          reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        )

  if (loading) return <p className="p-6">Loading...</p>
  if (!product) return <p className="p-6">Product not found</p>

  /* ================= UI ================= */

  return (
    <div className="max-w-6xl mx-auto p-6">

      {/* ================= MAIN PRODUCT ================= */}

      <div className="grid md:grid-cols-2 gap-10">

        {/* GALLERY */}
        <div className="flex gap-4">

          {/* THUMBNAILS */}
          <div className="flex flex-col gap-3">
            {product.images?.map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setMainImage(img)}
                className={`w-20 h-20 object-cover rounded cursor-pointer border ${
                  mainImage === img ? "border-black" : "border-gray-300"
                }`}
              />
            ))}
          </div>

          {/* MAIN IMAGE */}
          <div className="border rounded-lg w-[420px] h-[420px] flex items-center justify-center bg-white">
            <img
              src={mainImage}
              className="w-full h-full object-contain"
            />
          </div>

        </div>

        {/* INFO */}
        <div>

          <h1 className="text-3xl font-bold">{product.name}</h1>

          {/* STARS */}
          <div className="flex items-center gap-2 mt-2">
            {"★".repeat(avgRating)}
            {"☆".repeat(5 - avgRating)}
            <span>({reviews.length})</span>
          </div>

          <p className="text-2xl font-semibold mt-3">
            {product.price} RWF
          </p>

          <p className="mt-6">{product.description}</p>

          <button
            onClick={() =>
              addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: mainImage,
                quantity: 1,
              })
            }
            className="mt-8 bg-black text-white px-6 py-3 rounded"
          >
            Add to Cart
          </button>

        </div>

      </div>

      {/* ================= REVIEWS ================= */}

      <div className="mt-16">

        <h2 className="text-2xl font-bold mb-4">Reviews</h2>

        {reviews.map((r) => (
          <div key={r.id} className="border-b py-3">
            <strong>{"★".repeat(r.rating)}</strong>
            <p>{r.comment}</p>
          </div>
        ))}

        {/* ADD REVIEW */}

        <div className="mt-6 max-w-md">

          <h3 className="font-semibold mb-2">Write a review</h3>

          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="border p-2 w-full mb-2"
          >
            {[1, 2, 3, 4, 5].map(n => (
              <option key={n} value={n}>
                {n} Star
              </option>
            ))}
          </select>

          <textarea
            placeholder="Your comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="border p-2 w-full h-24"
          />

          <button
            onClick={submitReview}
            className="mt-2 bg-black text-white px-4 py-2 rounded"
          >
            Submit Review
          </button>

        </div>

      </div>

      {/* ================= RELATED ================= */}

      {related.length > 0 && (
        <div className="mt-20">

          <h2 className="text-2xl font-bold mb-6">
            Related Products
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

            {related.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="border rounded-lg p-4 hover:shadow"
              >
                <img
                  src={p.image_url || "/placeholder.png"}
                  className="w-full h-52 object-cover rounded"
                />

                <h3 className="mt-2 font-semibold">{p.name}</h3>
                <p className="font-bold">{p.price} RWF</p>
              </Link>
            ))}

          </div>

        </div>
      )}

    </div>
  )
}
