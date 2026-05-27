import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CIaaS — Card Issuance Platform",
  description: "Mock card-issuance platform for product exploration.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
