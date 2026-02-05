"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

/* ================= TYPES ================= */

type Notification = {
  id: string
  title: string
  message: string
  link: string
  is_read: boolean
}

/* ================= COMPONENT ================= */

export default function AdminNotifications() {

  const [items, setItems] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)

  /* LOAD + AUTO REFRESH */
  useEffect(() => {

    loadNotifications()

    const interval = setInterval(() => {
      loadNotifications()
    }, 5000)

    return () => clearInterval(interval)

  }, [])

  async function loadNotifications() {

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_role", "admin")
      .order("created_at", { ascending: false })

    if (!error) {
      setItems(data || [])
    }
  }

  const unread = items.filter(n => !n.is_read).length

  async function markRead(id: string) {

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)

    loadNotifications()
  }

  return (
    <div style={{ position: "relative" }}>

      {/* 🔔 BELL BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          color: "white",
          fontSize: 20,
          cursor: "pointer"
        }}
      >
        🔔

        {unread > 0 && (
          <span
            style={{
              background: "red",
              color: "white",
              fontSize: 11,
              borderRadius: "50%",
              padding: "2px 6px",
              marginLeft: 4
            }}
          >
            {unread}
          </span>
        )}

      </button>

      {/* 📥 DROPDOWN */}
      {open && (

        <div
          style={{
            position: "absolute",
            right: 0,
            top: 32,
            background: "white",
            width: 300,
            borderRadius: 6,
            boxShadow: "0 4px 12px rgba(0,0,0,.2)",
            zIndex: 5000,
            overflow: "hidden"
          }}
        >

          {/* HEADER */}
          <div
            style={{
              padding: 10,
              fontWeight: "bold",
              borderBottom: "1px solid #ddd",
              color: "#111"
            }}
          >
            Notifications
          </div>

          {items.length === 0 && (
            <p style={{ padding: 12, color: "#555" }}>
              No notifications
            </p>
          )}

          {items.map(n => (

            <Link
              key={n.id}
              href={n.link || "#"}
              onClick={() => markRead(n.id)}
              style={{
                display: "block",
                padding: 10,
                borderBottom: "1px solid #eee",
                background: n.is_read ? "white" : "#f3f4f6",
                color: "black",
                textDecoration: "none"
              }}
            >
              <b style={{ color: "#111" }}>
                {n.title}
              </b>

              <div
                style={{
                  fontSize: 13,
                  color: "#444",
                  marginTop: 2
                }}
              >
                {n.message}
              </div>

            </Link>

          ))}

        </div>

      )}

    </div>
  )
}
