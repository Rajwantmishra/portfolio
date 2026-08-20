import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rajwant Mishra - AI & Data Science Leader",
  description:
    "Enterprise AI transformation, healthcare AI, responsible AI governance, and platform leadership portfolio for Rajwant Mishra.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
