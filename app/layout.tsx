import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

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

        <main className="container">
          {children}
        </main>

        <Footer />

      </body>
    </html>
  )
}
