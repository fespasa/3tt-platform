import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  src: [],
  variable: "--font-inter",
  fallback: ["Inter", "Arial", "Helvetica", "sans-serif"],
});

export const metadata: Metadata = {
  title: { default: "3TOUCH TRIBE", template: "%s | 3TOUCH TRIBE" },
  description: "La primera plataforma digital del volleyball en español. Academia, comunidad, podcast y eventos live.",
  keywords: ["volleyball", "voleibol", "formación", "comunidad", "3touch tribe"],
  openGraph: {
    siteName: "3TOUCH TRIBE",
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white text-navy antialiased font-sans">{children}</body>
    </html>
  );
}
