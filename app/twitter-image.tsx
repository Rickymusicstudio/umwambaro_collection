import { ImageResponse } from "next/og";
import { siteConfig } from "@/constants/site";

// The picture WhatsApp, Facebook etc. show when someone shares the shop's main link.
export const alt = `${siteConfig.fullName} – ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px", background: "#0f3b3e", color: "#ffffff", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <div style={{ width: "120px", height: "120px", borderRadius: "28px", background: "#165a5e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "88px", fontWeight: 800, color: "#f2a900" }}>U</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "84px", fontWeight: 800, letterSpacing: "4px" }}>UMWAMBARO</div>
            <div style={{ fontSize: "32px", letterSpacing: "14px", color: "#ffd77a" }}>COLLECTIONS</div>
          </div>
        </div>
        <div style={{ marginTop: "56px", width: "160px", height: "10px", borderRadius: "5px", background: "#f2a900" }} />
        <div style={{ marginTop: "40px", fontSize: "52px", fontWeight: 700 }}>{siteConfig.tagline}</div>
        <div style={{ marginTop: "16px", fontSize: "34px", color: "#d3e3e1" }}>New &amp; Chaguwa clothes · Pay on delivery · All 30 districts</div>
      </div>
    ),
    size
  );
}
