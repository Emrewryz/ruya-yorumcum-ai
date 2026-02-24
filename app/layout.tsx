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
import { ThemeProvider } from "next-themes";

// --- 1. FONTLAR ---
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
    // suppressHydrationWarning eklendi (next-themes için zorunludur, hydration hatasını önler)
    <html lang="tr" suppressHydrationWarning className={`${cinzel.variable} ${manrope.variable}`}>
      <head>
        {/* Schema JSON-LD */}
        <Script
          id="json-ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      
      {/* Body class'larından hardcoded renkler (bg-[#020617], text-white) çıkarıldı.
        Artık renkleri globals.css'teki CSS değişkenleri (var(--bg-main), vs.) yönetecek.
      */}
      <body className="font-sans antialiased flex flex-col min-h-[100dvh] relative selection:bg-amber-500/30">
        
        {/* THEME PROVIDER EKLENDİ */}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          
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

          {/* BİLDİRİMLER (Toast) - Theme 'system' olarak ayarlandı ki temaya uyum sağlasın */}
          <Toaster position="top-center" richColors theme="system" /> 
          
          {/* MASAÜSTÜ İÇİN NOISE DIV'I EKLENDİ (Mobilde globals.css ile gizlenecek) */}
          <div className="bg-noise"></div>
          
          {/* ÇEREZ POLİTİKASI */}
          <CookieConsent />

          {/* VERCEL SPEED INSIGHTS */}
          <SpeedInsights />

        </ThemeProvider>
      </body>
    </html>
  );
}