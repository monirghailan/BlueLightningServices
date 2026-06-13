import { ImageResponse } from "next/og";
import { site } from "@/lib/content";

export const runtime = "edge";
export const alt = site.tagline;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0f1a 0%, #1a2332 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#e8eef7",
            marginBottom: 16,
          }}
        >
          {site.name}
        </div>
        <div style={{ fontSize: 32, color: "#60a5fa" }}>{site.tagline}</div>
        <div style={{ fontSize: 22, color: "#8899b4", marginTop: 24 }}>
          From £3,499/mo · 12-month contract
        </div>
      </div>
    ),
    { ...size }
  );
}
