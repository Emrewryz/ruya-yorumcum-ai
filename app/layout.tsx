import type { Metadata, Viewport } from "next";
import { Cinzel, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Footer from "@/components/footer";
import MobileNav from "@/components/ui/MobileNav";
import Script from "next/script";
import CookieConsent from "@/components/CookieConsent"; 
import NavbarWrapper from "@/components/NavbarWrapper"; 
import FooterSEOContent from "@/components/FooterSEOContent"; 
import HideOnDashboard from "@/components/HideOnDashboard";

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
  metadataBase: new URL('https://www.ruyayorumcum.com.tr'),
  alternates: {
    canonical: './',
  },

  // DÜZELTME 1: Title şablonunu kısalttık. 
  // Google genelde 60 karakterden sonrasını keser.
  title: {
    default: "Rüya Yorumcum AI - İslami ve Psikolojik Rüya Tabirleri",
    template: "%s | Rüya Yorumcum AI", 
  },
  
  // DÜZELTME 2: Açıklamayı 160 karakter altına çektik.
  description: "Rüyalarınızın gizli mesajlarını yapay zeka ile çözün. İslami kaynaklar ve modern psikoloji ışığında size özel rüya yorumları.",
  
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
  
  // DÜZELTME 3: Sosyal Medya ve Doğrulama (İleride buraları doldurursun)
  verification: {
    google: 'google-site-verification-kodun-buraya', 
    yandex: 'yandex-verification-kodun',
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

// DÜZELTME 4: Schema.org Yapısal Verisi (JSON-LD)
// Bu script Google'a "Ben bir Web Sitesiyim/Organizasyonum" der.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Rüya Yorumcum AI',
  url: 'https://www.ruyayorumcum.com.tr',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.ruyayorumcum.com.tr/arama?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  },
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
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1582674739139734"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* Schema Script'i buraya ekliyoruz */}
        <Script
          id="json-ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      
      <body className={`${cinzel.variable} ${manrope.variable} font-sans bg-[#020617] text-white antialiased flex flex-col min-h-[100dvh]`}>
        
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

        <NavbarWrapper /> 

        <main className="flex-grow pb-24 md:pb-0">
          {children}
        </main>

        <div className="hidden md:block">
          <HideOnDashboard>
             <FooterSEOContent />
             <Footer />
          </HideOnDashboard>
        </div>

        <MobileNav />
        <Toaster position="top-center" richColors theme="dark" /> 
        
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        
        <CookieConsent />

      </body>
    </html>
  );
}