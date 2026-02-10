import "./globals.css"
import Navbar from "../src/components/Navbar"
import Footer from "../src/components/Footer"
import MobileBottomNav from "../src/components/MobileBottomNav"

export const metadata = {
  title: "UMWAMBARO",
  description: "Online clothing store",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>

        <Navbar />

        {/* Remove container so admin can be full width */}
        <main style={{ minHeight: "80vh" }}>
          {children}
        </main>

        <Footer />

        {/* Mobile Bottom Nav */}
        <MobileBottomNav />

      </body>
    </html>
  )
}
