import "./globals.css"
import Navbar from "@/components/Navbar"

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

        {/* Global responsive container */}
        <main className="container">
          {children}
        </main>

      </body>
    </html>
  )
}
