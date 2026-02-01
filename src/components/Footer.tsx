export default function Footer() {
  return (
    <footer style={footerStyle}>

      <div style={container}>

        <div>
          <h3 style={title}>
  UMWAMBARO{" "}
  <span style={{ color: "#febd69" }}>Collections</span>
</h3>

          <p>Quality clothing for Men, Women, Kids & Sport</p>
        </div>

        <div>
          <h4 style={subtitle}>Contact</h4>
          <p>Email: umwambarocollections@gmail.com</p>
          <p>Phone: +250785712246</p>
        </div>

      </div>

      <div style={bottom}>
        © {new Date().getFullYear()} UMWAMBARO Collections. All rights reserved.
      </div>

    </footer>
  )
}

/* ================= STYLES ================= */

const footerStyle = {
  background: "#131921",
  color: "white",
  marginTop: 60,
}

const container = {
  maxWidth: 1100,
  margin: "auto",
  padding: "40px 20px",
  display: "flex",
  flexWrap: "wrap" as const,
  justifyContent: "space-between",
  gap: 30,
}

const title = {
  marginBottom: 10,
}

const subtitle = {
  marginBottom: 10,
}

const bottom = {
  borderTop: "1px solid #333",
  textAlign: "center" as const,
  padding: "15px",
  fontSize: 14,
}
