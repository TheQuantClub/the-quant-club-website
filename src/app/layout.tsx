import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Quant Club — Research Workspace",
  description: "Systematic investment research for registered investment advisers.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
