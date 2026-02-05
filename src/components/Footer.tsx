export default function Footer() {
  return (
    <footer style={footerStyle}>
      <div style={container}>

        <span>
          © {new Date().getFullYear()} UMWAMBARO Collections
        </span>

        <span style={divider}>|</span>

        <span>
          Quality clothing for Men, Women, Kids & Sport
        </span>

        <span style={divider}>|</span>

        <span>
          Email: umwambarocollections@gmail.com
        </span>

        <span style={divider}>|</span>

        <span>
          Phone: +250785712246
        </span>

      </div>
    </footer>
  )
}

/* ================= STYLES ================= */

const footerStyle = {
  background: "white",
  color: "#111",
  borderTop: "1px solid #e5e7eb",
  fontSize: 14,
}

const container = {
  maxWidth: 1200,
  margin: "auto",
  padding: "16px",
  display: "flex",
  flexWrap: "wrap" as const,
  justifyContent: "center",
  alignItems: "center",
  gap: 8,
  textAlign: "center" as const,
}

const divider = {
  opacity: 0.5,
}
