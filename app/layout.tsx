import type { Metadata } from "next";
import { Cinzel, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Footer from "@/components/footer"; // <-- 1. Footer'ı import ediyoruz

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${cinzel.variable} ${manrope.variable} font-sans bg-mystic-dark text-white antialiased flex flex-col min-h-screen`}>
        {/* flex flex-col ve min-h-screen ekledik. 
          Bu sayede içerik az olsa bile footer her zaman en altta kalır.
        */}
        
        <main className="flex-grow">
          {children}
        </main>

        {/* 2. Footer'ı buraya ekledik. Artık tüm sayfalarda görünecek. */}
        <Footer />

        <Toaster position="top-center" richColors theme="dark" /> 
      </body>
    </html>
  );
}