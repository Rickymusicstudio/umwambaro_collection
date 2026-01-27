"use client"

import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { getCart } from "@/lib/cart"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Navbar() {

  const [count, setCount] = useState(0)
  const [search, setSearch] = useState("")
  const [user, setUser] = useState<any>(null)
  const [mobileMenu, setMobileMenu] = useState(false)

  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const router = useRouter()

  /* ---------------- CART COUNT ---------------- */
  useEffect(() => {
    const update = () => {
      const cart = getCart()
      setCount(cart.reduce((s, i) => s + i.quantity, 0))
    }
    update()
    window.addEventListener("cart-change", update)
    return () => window.removeEventListener("cart-change", update)
  }, [])

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
  }, [])

  /* ---------------- SEARCH ---------------- */
  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(`/products?search=${search}`)
  }

  /* ---------------- LOGOUT ---------------- */
  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  /* ---------------- SWIPE ---------------- */
  function handleTouchStart(e:any){
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchMove(e:any){
    touchEndX.current = e.touches[0].clientX
  }

  function handleTouchEnd(){
    if(touchStartX.current - touchEndX.current > 60){
      setMobileMenu(false)
    }
  }

  return (
<>
{/* ================= DESKTOP NAV ================= */}

<header className="desktop-only">

  <Link
    href="/products"
    style={{
      color: "white",
      fontSize: 20,
      fontWeight: "bold",
    }}
  >
    UMWAMBARO
  </Link>

  <form
    onSubmit={handleSearch}
    style={{
      display: "flex",
      justifySelf: "center",
      width: "100%",
      maxWidth: 700,
    }}
  >
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search products"
      style={{
        flex: 1,
        padding: "10px",
        backgroundColor: "white",
        color: "black",
        border: "none",
        outline: "none",
        borderRadius: "6px 0 0 6px",
        fontSize: 14,
      }}
    />

    <button
      type="submit"
      style={{
        backgroundColor: "#febd69",
        border: "none",
        padding: "0 18px",
        borderRadius: "0 6px 6px 0",
        cursor: "pointer",
        fontSize: 16,
      }}
    >
      🔍
    </button>
  </form>

  {user ? (
    <button
      onClick={handleLogout}
      style={{
        background: "none",
        border: "none",
        color: "white",
        cursor: "pointer",
        fontSize: 15,
      }}
    >
      Logout
    </button>
  ) : (
    <Link href="/login" style={{ color: "white", fontSize: 15 }}>
      Login
    </Link>
  )}

  <Link
    href="/cart"
    style={{
      color: count > 0 ? "#febd69" : "white",
      fontSize: 16,
      position: "relative",
      fontWeight: count > 0 ? "bold" : "normal",
    }}
  >
    🛒 Cart

    {count > 0 && (
      <span
        style={{
          position: "absolute",
          top: -8,
          right: -12,
          backgroundColor: "#febd69",
          color: "black",
          fontSize: 12,
          padding: "2px 6px",
          borderRadius: 20,
        }}
      >
        {count}
      </span>
    )}
  </Link>

</header>

{/* ================= MOBILE NAV ================= */}

<div className="mobile-only">

  <div className="mobile-top">

    <div className="mobile-left">
      <button
        onClick={() => setMobileMenu(true)}
        className="burger"
      >
        ☰
      </button>

      <Link href="/products" className="mobile-logo">
        umwambaro
      </Link>
    </div>

    <div className="mobile-right">

      {user ? (
        <button onClick={handleLogout} className="mobile-link">
          Logout
        </button>
      ) : (
        <Link href="/login" className="mobile-link">
          Login
        </Link>
      )}

      <Link href="/cart" className="mobile-link">
        🛒
        {count > 0 && <span className="badge">{count}</span>}
      </Link>

    </div>

  </div>

  <form onSubmit={handleSearch} className="mobile-search">
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search products"
      style={{ background: "white", color: "black" }}
    />
    <button>🔍</button>
  </form>

</div>

{/* ================= MOBILE DRAWER ================= */}

{mobileMenu && (

<div
  className="drawer-overlay"
  onClick={() => setMobileMenu(false)}
>

<div
  className="mobile-nav-drawer"
  onClick={(e)=>e.stopPropagation()}
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>

<strong>Condition</strong>

<Link href="/products" className="drawer-item" onClick={() => setMobileMenu(false)}>All</Link>
<Link href="/products?condition=new" className="drawer-item" onClick={() => setMobileMenu(false)}>New</Link>
<Link href="/products?condition=used" className="drawer-item" onClick={() => setMobileMenu(false)}>Used (Chaguwa)</Link>

<hr />

<strong>Categories</strong>

<Link href="/products" className="drawer-item" onClick={() => setMobileMenu(false)}>All Products</Link>
<Link href="/products?category=bags" className="drawer-item" onClick={() => setMobileMenu(false)}>Bags</Link>
<Link href="/products?category=dresses" className="drawer-item" onClick={() => setMobileMenu(false)}>Dresses</Link>
<Link href="/products?category=jewelry" className="drawer-item" onClick={() => setMobileMenu(false)}>Jewelry</Link>
<Link href="/products?category=pants" className="drawer-item" onClick={() => setMobileMenu(false)}>Pants</Link>
<Link href="/products?category=shirts" className="drawer-item" onClick={() => setMobileMenu(false)}>Shirts</Link>
<Link href="/products?category=shoes" className="drawer-item" onClick={() => setMobileMenu(false)}>Shoes</Link>
<Link href="/products?category=watches" className="drawer-item" onClick={() => setMobileMenu(false)}>Watches</Link>

</div>
</div>
)}

{/* ================= STYLES ================= */}

<style jsx>{`

/* DESKTOP */
.desktop-only{
  background:#131921;
  padding:12px 20px;
  display:grid;
  grid-template-columns:auto 1fr auto auto;
  align-items:center;
  gap:20px;
}

/* MOBILE NAV */
.mobile-only{
  display:none;
  background:#131921;
  padding:12px;
}

.mobile-top{
  display:flex;
  align-items:center;
  justify-content:space-between;
  width:100%;
}

.mobile-right{
  display:flex;
  align-items:center;
  gap:12px;
}

.mobile-left{
  display:flex;
  align-items:center;
  gap:16px;
}

.burger{
  background:none;
  border:none;
  color:white;
  font-size:24px;
}

.mobile-logo{
  color:white;
  font-weight:bold;
  margin-right:auto;
  text-decoration:none;
}

.mobile-link{
  color:white;
  background:none;
  border:none;
  text-decoration:none;
  position:relative;
}

.badge{
  position:absolute;
  top:-6px;
  right:-10px;
  background:#febd69;
  color:black;
  font-size:11px;
  padding:2px 5px;
  border-radius:50%;
}

.mobile-search{
  display:flex;
  margin-top:10px;
}

.mobile-search input{
  flex:1;
  padding:10px;
  border:none;
  outline:none;
  border-radius:6px 0 0 6px;
}

.mobile-search button{
  background:#febd69;
  border:none;
  padding:0 16px;
  border-radius:0 6px 6px 0;
}

/* DRAWER */

.drawer-overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,0.5);
  z-index:2999;
}

.mobile-nav-drawer{
  position:fixed;
  top:0;
  left:0;
  width:75%;
  max-width:280px;
  height:100vh;
  background:#131921;
  padding:20px;
  z-index:3000;
  overflow-y:auto;
  animation:slideIn .25s ease-out;

  display:flex;
  flex-direction:column;
  color:white;
}

.drawer-item{
  color:white;
  text-decoration:none;
  padding:10px 0;
  font-size:16px;
}

.drawer-item:hover{
  color:#febd69;
}

.mobile-nav-drawer strong{
  color:white;
  margin-top:15px;
}

@keyframes slideIn{
  from{transform:translateX(-100%)}
  to{transform:translateX(0)}
}

/* BREAKPOINT */
@media(max-width:768px){
  .desktop-only{display:none}
  .mobile-only{display:block}
}

`}</style>

</>
)
}
