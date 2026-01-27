// components/CookieConsent.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Sayfa yüklendiğinde kontrol et: Daha önce kabul etmiş mi?
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Kabul etmemişse biraz bekleyip (0.5sn) banner'ı göster (animasyon için)
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    // "Kabul Et"e basınca tarayıcıya kaydet
    localStorage.setItem("cookie_consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50">
      <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-10 duration-500">
        
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#fbbf24]/10 rounded-xl shrink-0">
            <Cookie className="w-6 h-6 text-[#fbbf24]" />
          </div>
          
          <div className="flex-1">
            <h4 className="text-white font-serif font-bold mb-2">Çerez Tercihleri</h4>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              Sitemizden en iyi şekilde faydalanabilmeniz ve deneyiminizi kişiselleştirmek için çerezler kullanıyoruz.
              <br />
              <Link href="/yasal/gizlilik-politikasi" className="text-[#fbbf24] hover:underline mt-1 inline-block">
                Gizlilik Politikasını İncele
              </Link>
            </p>

            <div className="flex gap-3">
              <button 
                onClick={handleAccept}
                className="flex-1 py-2.5 bg-[#fbbf24] hover:bg-[#f59e0b] text-black text-xs font-bold rounded-lg transition-colors active:scale-95"
              >
                KABUL ET
              </button>
              <button 
                onClick={() => setIsVisible(false)}
                className="px-3 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}