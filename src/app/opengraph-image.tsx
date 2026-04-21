import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "四柱推命 × 占術総合鑑定 | 無料で性格・運勢を本格診断";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 40%, #1e1b4b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        <div style={{ fontSize: 28, color: "#c4b5fd", marginBottom: 16, letterSpacing: "0.1em" }}>
          生年月日から性格・才能・運勢を読み解く
        </div>
        <div style={{ fontSize: 64, fontWeight: "bold", color: "#ffffff", marginBottom: 32, letterSpacing: "-0.02em" }}>
          四柱推命 × 占術総合鑑定
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 40 }}>
          {["🏛️ 四柱推命", "🔢 数秘術", "🐾 動物占い", "⭐ 星座占い"].map((name) => (
            <div
              key={name}
              style={{
                background: "rgba(255,255,255,0.12)",
                borderRadius: 12,
                padding: "10px 22px",
                fontSize: 22,
                color: "#e9d5ff",
              }}
            >
              {name}
            </div>
          ))}
        </div>
        <div
          style={{
            background: "rgba(251,191,36,0.15)",
            border: "2px solid rgba(251,191,36,0.5)",
            borderRadius: 16,
            padding: "16px 40px",
            fontSize: 28,
            color: "#fbbf24",
            fontWeight: "bold",
          }}
        >
          基本鑑定は無料 · 詳細版 ¥980 買い切り
        </div>
      </div>
    ),
    { ...size },
  );
}
