"use client";

import { useEffect, useRef } from "react";

export default function AdcashBanner() {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sadece tarayıcıda çalışmasını ve çift yüklemeyi (React Strict Mode) engelliyoruz
    if (typeof window !== "undefined" && (window as any).aclib && bannerRef.current) {
      if (bannerRef.current.innerHTML === "") {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.text = `aclib.runBanner({zoneId: '10999954'});`;
        bannerRef.current.appendChild(script);
      }
    }
  }, []);

  return (
    <div 
      ref={bannerRef}
      className="w-[300px] h-[250px] bg-[#131722] rounded-xl overflow-hidden flex items-center justify-center border border-white/5 shadow-lg mx-auto"
    ></div>
  );
}