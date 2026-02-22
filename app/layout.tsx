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

// --- 1. FONTLAR ---
// Tasarımın "Mistik" havası için Cinzel, "Modern" okunabilirliği için Manrope
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

// --- 2. METADATA & SEO ---
export const metadata: Metadata = {
  metadataBase: new URL('https://www.ruyayorumcum.com.tr'),
  alternates: {
    canonical: './',
  },
  title: {
    default: "Rüya Yorumcum AI - İslami ve Psikolojik Rüya Tabirleri",
    template: "%s | Rüya Yorumcum AI", 
  },
  description: "Rüyalarınızın gizli mesajlarını yapay zeka ile çözün. İslami kaynaklar ve modern psikoloji ışığında size özel rüya yorumları.",
  other: {
    "google-adsense-account": "ca-pub-1582674739139734",
  },
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

// --- 3. SCHEMA MARKUP ---
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

// --- 4. ROOT LAYOUT ---
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${cinzel.variable} ${manrope.variable}`}>
      <head>
        {/* Schema JSON-LD */}
        <Script
          id="json-ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* Google AdSense (HEAD içine manuel script) */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1582674739139734"
          crossOrigin="anonymous"
        ></script>
        
        {/* Monetag Doğrulama Kodu 
        <meta name="monetag" content="4bd56e59726a926274326a7f50b82613" />*/}

        {/* --- YENİ EKLENEN MONETAG REKLAM KODU --- */}
        <script src="https://quge5.com/88/tag.min.js" data-zone="213154" async data-cfasync="false"></script>
        
      </head>
      
      {/* Body: Font değişkenlerini ve temel renkleri buraya uyguladık */}
      <body className="font-sans bg-[#020617] text-white antialiased flex flex-col min-h-[100dvh] relative selection:bg-[#fbbf24]/30">
        
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

        {/* MASAÜSTÜ NAVBAR */}
        <HideOnDashboard>
           <NavbarWrapper /> 
        </HideOnDashboard>

        {/* ANA İÇERİK */}
        <main className="flex-grow pb-24 md:pb-0 z-10 relative">
          {children}
        </main>

        {/* MASAÜSTÜ FOOTER */}
        <div className="hidden md:block z-10 relative">
          <HideOnDashboard>
             <Footer />
          </HideOnDashboard>
        </div>

        {/* MOBİL MENÜ (Bottom Nav) */}
        <HideOnDashboard>
           <MobileNav />
        </HideOnDashboard>

        {/* BİLDİRİMLER (Toast) */}
        <Toaster position="top-center" richColors theme="dark" /> 
        
        {/* NOISE TEXTURE OVERLAY (Tüm sayfada hafif bir doku oluşturur) */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
        
        {/* ÇEREZ POLİTİKASI */}
        <CookieConsent />

        {/* VERCEL SPEED INSIGHTS */}
        <SpeedInsights />

      </body>
    </html>
  );
}