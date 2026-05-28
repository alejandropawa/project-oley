import { ImageResponse } from "next/og";

export const alt = "TROKO marketplace românesc pentru anunțuri locale";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#F7FBF8",
          color: "#123F37",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "24px",
              background: "#005F3F",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "34px",
              fontWeight: 900,
            }}
          >
            T
          </div>
          <div
            style={{
              fontSize: "38px",
              fontWeight: 900,
              letterSpacing: "8px",
            }}
          >
            TROKO
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              maxWidth: "860px",
              fontSize: "64px",
              lineHeight: 1.06,
              fontWeight: 900,
            }}
          >
            Marketplace-ul românesc pentru anunțuri locale
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              color: "#005F3F",
              fontSize: "30px",
              fontWeight: 800,
            }}
          >
            <span>Vânzare</span>
            <span style={{ color: "#E9B44C" }}>•</span>
            <span>Cumpărare</span>
            <span style={{ color: "#E9B44C" }}>•</span>
            <span>Închiriere</span>
            <span style={{ color: "#E9B44C" }}>•</span>
            <span>Schimb</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#52645F",
            fontSize: "24px",
            fontWeight: 700,
          }}
        >
          <span>troko.ro</span>
          <span>România</span>
        </div>
      </div>
    ),
    size,
  );
}
