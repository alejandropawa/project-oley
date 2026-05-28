import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#005F3F",
          color: "#FFFFFF",
          fontFamily: "Arial, sans-serif",
          fontSize: "220px",
          fontWeight: 900,
        }}
      >
        T
      </div>
    ),
    size,
  );
}
