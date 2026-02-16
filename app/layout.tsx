"use client"

import "./globals.css"
import { useEffect } from "react"
import { Capacitor } from "@capacitor/core"
import { PushNotifications } from "@capacitor/push-notifications"

import Navbar from "../src/components/Navbar"
import Footer from "../src/components/Footer"
import MobileBottomNav from "../src/components/MobileBottomNav"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  useEffect(() => {

    async function initPush() {

      // ✅ Skip push on web
      if (Capacitor.getPlatform() === "web") {
        console.log("Push not supported on web")
        return
      }

      try {

        const permission = await PushNotifications.requestPermissions()

        if (permission.receive !== "granted") {
          console.log("Notification permission not granted")
          return
        }

        await PushNotifications.register()

        PushNotifications.addListener("registration", token => {
          console.log("FCM TOKEN:", token.value)
          alert("FCM TOKEN: " + token.value)
        })

        PushNotifications.addListener("registrationError", err => {
          console.error("Registration error:", err)
          alert("Registration error")
        })

        PushNotifications.addListener("pushNotificationReceived", notification => {
          console.log("Push received:", notification)
        })

      } catch (err) {
        console.error("Push init error:", err)
      }

    }

    initPush()

  }, [])

  return (
    <html lang="en">
      <body>

        <Navbar />

        <main style={{ minHeight: "80vh" }}>
          {children}
        </main>

        <Footer />
        <MobileBottomNav />

      </body>
    </html>
  )
}
