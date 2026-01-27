import type { Metadata, Viewport } from "next";
import { Cinzel, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Footer from "@/components/footer";
import MobileNav from "@/components/ui/MobileNav";
import Script from "next/script";
import CookieConsent from "@/components/CookieConsent"; 

const cinzel = Cinzel({ 
  subsets: ["latin"], 
  variable: "--font-cinzel",
  display: "swap",
});

const manrope = Manrope({ 
  subsets: ["latin"], 
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  // --- SEO GÜNCELLEMESİ BAŞLANGIÇ ---
  // 1. Canonical URL: Google'a "Benim asıl adresim budur" diyoruz.
  metadataBase: new URL('https://www.ruyayorumcum.com.tr'),

  // 2. Akıllı Başlık: Alt sayfalarda sadece rüya adını yazsan bile sonuna otomatik marka adını ekler.
  title: {
    default: "Rüya Yorumcum AI | Mistik Rehber",
    template: "%s | Rüya Yorumcum AI", // Örn: "Rüyada Yılan Görmek | Rüya Yorumcum AI" olur
  },
  
  description: "Yapay zeka ve kadim bilgelikle rüyalarınızı analiz edin. İslami ve psikolojik rüya tabirleri.",
  manifest: "/manifest.json",
  
  // 3. Sosyal Medya Paylaşım Kartı (Twitter/X ve WhatsApp için varsayılan)
  openGraph: {
    title: 'Rüya Yorumcum AI',
    description: 'Rüyalarınızın gizli mesajlarını yapay zeka ile çözün.',
    url: 'https://www.ruyayorumcum.com.tr',
    siteName: 'Rüya Yorumcum AI',
    locale: 'tr_TR',
    type: 'website',
  },
  // --- SEO GÜNCELLEMESİ BİTİŞ ---
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        {/* GOOGLE ADSENSE KODU */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1582674739139734"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>

      <body className={`${cinzel.variable} ${manrope.variable} font-sans bg-[#020617] text-white antialiased flex flex-col min-h-[100dvh]`}>
        
        {/* İçerik Alanı */}
        <main className="flex-grow pb-24 md:pb-0">
          {children}
        </main>

        {/* Masaüstü Footer (Mobilde gizli) */}
        <div className="hidden md:block">
          <Footer />
        </div>

        {/* Mobil Alt Menü */}
        <MobileNav />

        {/* Bildirimler (Toaster) */}
        <Toaster position="top-center" richColors theme="dark" /> 
        
        {/* Gürültü Efekti (Noise) */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        
        {/* ÇEREZ UYARISI */}
        <CookieConsent />

      </body>
    </html>
  );
}