"use client"

import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

type User = {
  email: string
}

export default function AccountPage() {

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  async function loadUser() {
    const { data } = await supabase.auth.getUser()

    if (data.user) {
      setUser({ email: data.user.email! })
    } else {
      setUser(null)
    }

    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    location.href = "/"
  }

  if (loading) return <p className="p-10">Loading...</p>

  return (
    <div className="p-10 max-w-md mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        My Account
      </h1>

      {/* NOT LOGGED IN */}
      {!user && (
        <div className="space-y-4">

          <Link
            href="/login"
            className="block border p-4 rounded"
          >
            🔐 Login
          </Link>

          <Link
            href="/register"
            className="block border p-4 rounded"
          >
            📝 Create Account
          </Link>

        </div>
      )}

      {/* LOGGED IN */}
      {user && (
        <div className="space-y-4">

          <div className="border p-4 rounded">
            👤 {user.email}
          </div>

          <Link
            href="/account/orders"
            className="block border p-4 rounded"
          >
            📦 My Orders
          </Link>

          <button
            onClick={handleLogout}
            className="w-full bg-black text-white p-3 rounded"
          >
            🚪 Logout
          </button>

        </div>
      )}

    </div>
  )
}
