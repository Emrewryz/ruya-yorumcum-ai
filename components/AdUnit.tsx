"use client";

import { useEffect, useRef } from "react";

type AdUnitProps = {
  slot: string; // AdSense panelinden alacağın "Data-ad-slot" numarası
  format?: "auto" | "fluid" | "rectangle" | "autorelaxed";
  className?: string;
};

export default function AdUnit({ slot, format = "auto", className = "" }: AdUnitProps) {
  const adRef = useRef<boolean>(false);

  useEffect(() => {
    // Reklamın iki kere yüklenmesini (React Strict Mode yüzünden) engellemek için kontrol
    if (adRef.current) return;

    try {
      if (typeof window !== "undefined") {
        // HATA ÇÖZÜMÜ: (window as any) diyerek TypeScript'i susturuyoruz.
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        adRef.current = true;
      }
    } catch (err) {
      console.error("AdSense hatası:", err);
    }
  }, []);

  return (
    <div className={`w-full flex justify-center my-8 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXX" // BURAYA KENDİ PUB ID'Nİ YAZMAYI UNUTMA (Örn: ca-pub-123456...)
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}