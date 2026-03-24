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
import { GoogleAnalytics } from '@next/third-parties/google';

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
    <html lang="tr" suppressHydrationWarning className={`${cinzel.variable} ${manrope.variable}`}>
      <head>
        {/* Schema JSON-LD */}
        <Script
          id="json-ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      
      {/* Global Renkler ve Yumuşak Geçiş (Transition) eklendi.
        Açık modda: #faf9f6 ve koyu gri metin, Gece modunda: stone-950 ve açık gri metin.
      */}
      <body className="font-sans antialiased flex flex-col min-h-[100dvh] relative bg-[#faf9f6] dark:bg-stone-950 text-stone-900 dark:text-stone-100 selection:bg-amber-500/30 dark:selection:bg-amber-500/20 transition-colors duration-300">
        
        {/* THEME PROVIDER: system varsayılan yapıldı */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
          
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
          <Toaster position="top-center" richColors theme="system" /> 
          
          {/* BACKGROUND NOISE: pointer-events-none ve z-[-1] ile tıklama engellemeleri çözüldü */}
          <div className="bg-noise fixed inset-0 pointer-events-none z-[-1] opacity-50 dark:opacity-30 mix-blend-overlay"></div>
          
          {/* ÇEREZ POLİTİKASI */}
          <CookieConsent />

          {/* ANALYTICS & SPEED INSIGHTS (Next.js 14 Uyumlu) */}
          <GoogleAnalytics gaId="G-W3T96RLZHL" />
          <SpeedInsights />

        </ThemeProvider>
      </body>
    </html>
  );
}