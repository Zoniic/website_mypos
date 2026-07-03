import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = "image/png";

export function buildOgImage(title: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#171717",
          color: "#ffffff",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1, color: "#a3a3a3" }}>
          {siteConfig.name}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 56,
            maxWidth: 1000,
            fontWeight: 700,
            lineHeight: 1.25,
          }}
        >
          {title}
        </div>
      </div>
    ),
    ogImageSize
  );
}
