"use client";

// Catches errors thrown by the root layout or [locale]/layout.tsx itself
// (e.g. the database being unreachable) — the one place in the app that
// must not depend on next-intl or any DB-backed content, since that's
// exactly what may have just failed.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          color: "#111318",
          fontFamily: "system-ui, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            Something went wrong / เกิดข้อผิดพลาด
          </h1>
          <p style={{ color: "#5c6470", marginBottom: 24 }}>
            The site is temporarily unavailable. Please try again in a moment.
            <br />
            เว็บไซต์ขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "linear-gradient(135deg, #cc4515, #f06830)",
              color: "#ffffff",
              border: "none",
              borderRadius: 10,
              padding: "10px 24px",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again / ลองใหม่
          </button>
        </div>
      </body>
    </html>
  );
}
