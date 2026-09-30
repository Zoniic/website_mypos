import type { Metadata } from "next";
import { adminFonts } from "@/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "MYPOS Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${adminFonts.className} h-full antialiased`} style={adminFonts.style}>
      <body className="min-h-full bg-bg text-text-1">{children}</body>
    </html>
  );
}
