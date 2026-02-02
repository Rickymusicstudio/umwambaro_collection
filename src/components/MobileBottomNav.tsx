"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function MobileBottomNav() {

  const pathname = usePathname()

  function itemStyle(path: string) {
    return {
      color: pathname === path ? "#f0c36d" : "white",
      fontWeight: pathname === path ? "bold" : "normal",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
      fontSize: 12,
    } as React.CSSProperties
  }

  return (
    <nav className="mobile-bottom-nav">

      <Link href="/" style={itemStyle("/")}>
        🏠
        <span>Home</span>
      </Link>

      <Link href="/products" style={itemStyle("/products")}>
        🗂️
        <span>Category</span>
      </Link>

      <Link href="/cart" style={itemStyle("/cart")}>
        🛒
        <span>Cart</span>
      </Link>

      <Link href="/account" style={itemStyle("/account")}>
        👤
        <span>Account</span>
      </Link>

    </nav>
  )
}
