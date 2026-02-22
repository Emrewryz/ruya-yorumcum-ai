"use client";

import { useEffect, useRef } from "react";

// Dışarıdan gelecek özellikleri (props) tanımlıyoruz
interface AdcashBannerProps {
  zoneId: string;
}

export default function AdcashBanner({ zoneId }: AdcashBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sadece tarayıcıda çalışmasını ve çift yüklemeyi engelliyoruz
    if (typeof window !== "undefined" && (window as any).aclib && bannerRef.current) {
      if (bannerRef.current.innerHTML === "") {
        const script = document.createElement("script");
        script.type = "text/javascript";
        // Gelen dinamik zoneId'yi buraya yerleştiriyoruz
        script.text = `aclib.runBanner({zoneId: '${zoneId}'});`;
        bannerRef.current.appendChild(script);
      }
    }
  }, [zoneId]);

  return (
    <div 
      ref={bannerRef}
      className="w-[300px] h-[250px] bg-[#131722] rounded-xl overflow-hidden flex items-center justify-center border border-white/5 shadow-lg mx-auto"
    ></div>
  );
}