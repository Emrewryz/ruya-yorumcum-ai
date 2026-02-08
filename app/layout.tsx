import type { Metadata, Viewport } from "next";
import { Cinzel, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Footer from "@/components/footer";
import MobileNav from "@/components/ui/MobileNav";
import Script from "next/script";
import CookieConsent from "@/components/CookieConsent"; 
import NavbarWrapper from "@/components/NavbarWrapper"; 
import HideOnDashboard from "@/components/HideOnDashboard";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
  // Canonical URL ayarı
  metadataBase: new URL('https://www.ruyayorumcum.com.tr'),
  
  alternates: {
    canonical: './',
  },
  
  title: {
    default: "Rüya Yorumcum AI - İslami ve Psikolojik Rüya Tabirleri",
    template: "%s | Rüya Yorumcum AI", 
  },
  description: "Rüyalarınızın gizli mesajlarını yapay zeka ile çözün. İslami kaynaklar ve modern psikoloji ışığında size özel rüya yorumları.",
  
  // Robots ayarı
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  manifest: "/manifest.json",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
  
  openGraph: {
    title: 'Rüya Yorumcum AI',
    description: 'Rüyalarınızın gizli mesajlarını yapay zeka ile çözün.',
    url: 'https://www.ruyayorumcum.com.tr',
    siteName: 'Rüya Yorumcum AI',
    locale: 'tr_TR',
    type: 'website',
  },
  
  // NOT: Google Search Console doğrulama kodunu buraya girmeyi unutma
  verification: {
    google: 'google-site-verification-kodunuzu-buraya-yazin', 
    yandex: 'yandex-verification-kodunuz',
  },
  category: 'lifestyle',
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#020617",
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Rüya Yorumcum AI',
  url: 'https://www.ruyayorumcum.com.tr',
  publisher: {
    '@type': 'Organization',
    name: 'Rüya Yorumcum AI',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.ruyayorumcum.com.tr/icon.png'
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        {/* Schema Markup */}
        <Script
          id="json-ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* --- GOOGLE ADSENSE (ANA SCRIPT) --- 
          Bu script tüm site genelinde çalışır.
          1. Otomatik reklamları (Vinyet vb.) yönetir.
          2. Manuel eklediğimiz (AdUnit) reklamların çalışmasını sağlar.
        */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1582674739139734"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      
      <body className={`${cinzel.variable} ${manrope.variable} font-sans bg-[#020617] text-white antialiased flex flex-col min-h-[100dvh]`}>
        
        {/* Google Analytics & GTM */}
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

        {/* 1. NAVBAR */}
        <HideOnDashboard>
           <NavbarWrapper /> 
        </HideOnDashboard>

        <main className="flex-grow pb-24 md:pb-0">
          {children}
        </main>

        {/* 2. FOOTER */}
        <div className="hidden md:block">
          <HideOnDashboard>
             <Footer />
          </HideOnDashboard>
        </div>

        {/* 3. MOBİL MENÜ */}
        <HideOnDashboard>
           <MobileNav />
        </HideOnDashboard>

        <Toaster position="top-center" richColors theme="dark" /> 
        
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        
        <CookieConsent />

        <SpeedInsights />

      </body>
    </html>
  );
}