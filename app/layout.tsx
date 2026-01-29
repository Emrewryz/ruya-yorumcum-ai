import type { Metadata, Viewport } from "next";
import { Cinzel, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Footer from "@/components/footer";
import MobileNav from "@/components/ui/MobileNav";
import Script from "next/script";
import CookieConsent from "@/components/CookieConsent"; 
import NavbarWrapper from "@/components/NavbarWrapper"; // Import tamam

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
  metadataBase: new URL('https://www.ruyayorumcum.com.tr'),
  alternates: {
    canonical: './',
  },

  title: {
    default: "Rüya Yorumcum AI - Yapay Zeka Destekli İslami ve Psikolojik Rüya Tabirleri",
    template: "%s | Rüya Yorumcum AI", 
  },
  
  description: "Rüyalarınızın gizli mesajlarını yapay zeka ile anında çözün. İslami kaynaklar ve modern psikoloji ışığında detaylı, size özel rüya yorumları ve analizleri için tıklayın.",
  manifest: "/manifest.json",
  
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
        
        {/* GOOGLE ANALYTICS */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-W3T96RLZHL"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-W3T96RLZHL'); 
          `}
        </Script>

        {/* --- DÜZELTME BURADA: NavbarWrapper EKLENDİ --- */}
        <NavbarWrapper /> 

        {/* 2. İÇERİK ALANI */}
        <main className="flex-grow pb-24 md:pb-0">
          {children}
        </main>

        {/* 3. MASAÜSTÜ FOOTER (Mobilde gizli) */}
        <div className="hidden md:block">
          <Footer />
        </div>

        {/* 4. MOBİL ALT MENÜ */}
        <MobileNav />

        {/* 5. BİLDİRİMLER (TOASTER) */}
        <Toaster position="top-center" richColors theme="dark" /> 
        
        {/* 6. GÜRÜLTÜ EFEKTİ (NOISE) */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        
        {/* 7. ÇEREZ UYARISI */}
        <CookieConsent />

      </body>
    </html>
  );
}