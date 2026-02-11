export type CartItem = {
  id: string
  name: string
  price: number
  image_url: string
  size?: string | null   // ✅ added
  quantity: number
}

const KEY = "cart"

/* ---------------- NOTIFY NAVBAR ---------------- */

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cart-change"))
  }
}

/* ---------------- GET ---------------- */

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem(KEY) || "[]")
}

/* ---------------- SAVE ---------------- */

function save(cart: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(cart))
  notify()
}

/* ---------------- ADD ---------------- */

export function addToCart(product: {
  id: string
  name: string
  price: number
  image_url: string
  size?: string | null   // ✅ added
}) {
  const cart = getCart()

  // 🔥 important: identify by id + size
  const existing = cart.find(
    i => i.id === product.id && i.size === product.size
  )

  if (existing) {
    existing.quantity += 1
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      size: product.size ?? null,   // ✅ store size
      quantity: 1,
    })
  }

  save(cart)
}

/* ---------------- UPDATE ---------------- */

export function updateQuantity(id: string, size: string | null, qty: number) {
  const cart = getCart()

  const item = cart.find(
    i => i.id === id && i.size === size
  )

  if (item) {
    item.quantity = Math.max(1, qty)
  }

  save(cart)
}

/* ---------------- REMOVE ---------------- */

export function removeFromCart(id: string, size: string | null) {
  save(
    getCart().filter(
      i => !(i.id === id && i.size === size)
    )
  )
}

/* ---------------- CLEAR ---------------- */

export function clearCart() {
  save([])
}
