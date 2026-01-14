import type { Metadata } from "next";
import { Cinzel, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner"; // <-- 1. İMPORT EKLENDİ

// Başlık Fontu (Mistik/Serif)
const cinzel = Cinzel({ 
  subsets: ["latin"], 
  variable: "--font-cinzel",
  display: "swap",
});

// Gövde Fontu (Modern/Okunaklı)
const manrope = Manrope({ 
  subsets: ["latin"], 
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rüya Yorumcum AI | Mistik Rehber",
  description: "Yapay zeka ve kadim bilgelikle rüyalarınızı analiz edin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${cinzel.variable} ${manrope.variable} font-sans bg-mystic-dark text-white antialiased`}>
        {children}
        {/* 2. BİLDİRİM KUTUSU EKLENDİ (Tüm sayfalarda çalışması için) */}
        <Toaster position="top-center" richColors theme="dark" /> 
      </body>
    </html>
  );
}