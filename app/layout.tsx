import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ruyayorumcum.com"),
  title: {
    default: "Rüya Yorumcum — Yapay Zeka Destekli Rüya Analizi",
    template: "%s | Rüya Yorumcum",
  },
  description: "Rüyanızı yazın, yapay zeka hem İslami hem psikolojik açıdan anında yorumlasın.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="bg-white text-zinc-900 antialiased">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}