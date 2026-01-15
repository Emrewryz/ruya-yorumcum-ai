import type { Metadata, Viewport } from "next";
import { Cinzel, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Footer from "@/components/footer";
import MobileNav from "@/components/ui/MobileNav"; // <-- BU EKSİKTİ

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
  title: "Rüya Yorumcum AI | Mistik Rehber",
  description: "Yapay zeka ve kadim bilgelikle rüyalarınızı analiz edin.",
  manifest: "/manifest.json", // PWA için hazırlık
};

// --- İŞTE TARAYICI RENGİNİ DÜZELTEN KOD ---
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Zoom yapmayı engeller (App hissi)
  themeColor: "#020617", // Tarayıcı çubuğunu SİYAH/MOR yapar (Beyaz kalmaz)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      {/* min-h-[100dvh] mobil tarayıcı boyunu tam algılar */}
      <body className={`${cinzel.variable} ${manrope.variable} font-sans bg-[#020617] text-white antialiased flex flex-col min-h-[100dvh]`}>
        
        {/* İçerik Alanı - Mobilde alttaki menü kadar boşluk bırakır (pb-20) */}
        <main className="flex-grow pb-24 md:pb-0">
          {children}
        </main>

        {/* Masaüstü Footer (Mobilde GİZLİ - App hissiyatı için) */}
        <div className="hidden md:block">
          <Footer />
        </div>

        {/* Mobil Alt Menü (Sadece Mobilde AÇIK - O 4 Buton Burası) */}
        <MobileNav />

        <Toaster position="top-center" richColors theme="dark" /> 
        
        {/* Gürültü Efekti (Varsa) */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </body>
    </html>
  );
}