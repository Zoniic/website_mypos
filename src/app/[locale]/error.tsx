"use client";

// Catches errors thrown by pages/components nested under [locale]/layout.tsx
// (the layout itself is protected separately by src/app/global-error.tsx).
// Deliberately hardcoded bilingual text — no next-intl/DB dependency, since
// this boundary exists for the case where DB-backed content just failed.
export default function LocaleError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-text-1">
        Something went wrong / เกิดข้อผิดพลาด
      </h1>
      <p className="mt-2 max-w-md text-text-2">
        This page is temporarily unavailable. Please try again in a moment.
        <br />
        หน้านี้ขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-button bg-[image:var(--gradient-primary)] px-6 py-2.5 font-semibold text-text-1 shadow-[var(--shadow-glow-primary)] hover:brightness-110"
      >
        Try again / ลองใหม่
      </button>
    </div>
  );
}
