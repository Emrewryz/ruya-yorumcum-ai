import type { Metadata } from "next";
import localFont from "next/font/local";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  display: "swap",
  preload: true,
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ruyayorumcum.com.tr"),
  title: "Rüya Yorumcum | Yapay Zeka ile Rüyanı Analiz Et ve Çizdir Ücretsiz",
  description:
    "Sıkıcı rüya tabirlerini unutun. Yapay zeka ile rüyanızın psikolojik ve İslami analizini öğrenin, rüyanızı muazzam bir tabloya dönüştürün. Ücretsiz analiz için tıklayın!",
  robots: {
    index:  true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}

        <SpeedInsights />

        {process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}