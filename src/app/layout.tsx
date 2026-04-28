import type { Metadata } from "next";
import { Bebas_Neue, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "3TOUCH TRIBE", template: "%s | 3TOUCH TRIBE" },
  description:
    "La primera plataforma digital del volleyball en español. Academia, comunidad, podcast y eventos live.",
  keywords: ["volleyball", "voleibol", "formación", "comunidad", "3touch tribe"],
  openGraph: {
    siteName: "3TOUCH TRIBE",
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${bebasNeue.variable} ${jakarta.variable}`}>
      <body className="bg-navy-deep text-white antialiased font-body">{children}</body>
    </html>
  );
}
