import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "../globals.css";

const fontSans = Prompt({
  variable: "--font-sans-loaded",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MYPOS Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-bg text-text-1">{children}</body>
    </html>
  );
}
