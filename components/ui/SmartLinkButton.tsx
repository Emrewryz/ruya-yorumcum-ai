"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isInAppBrowser } from '@/utils/browserCheck'; // Bu dosyanın var olduğundan emin olun
import { Lock, MoreHorizontal, Share, Compass } from 'lucide-react';

interface SmartLinkButtonProps {
  targetUrl: string;
  children: React.ReactNode;
  className?: string;
}

export default function SmartLinkButton({ targetUrl, children, className }: SmartLinkButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    // 1. KONTROL BURADA YAPILIYOR
    // Eğer TikTok, Instagram vb. içindeyse modal açılır.
    if (isInAppBrowser()) {
      setShowModal(true);
    } else {
      // Değilse direkt linke gider.
      router.push(targetUrl);
    }
  };

  return (
    <>
      <button 
        onClick={handleClick} 
        className={`${className} transform transition-all duration-200 active:scale-95`}
      >
        {children}
      </button>

      {/* --- PREMIUM UYARI MODALI --- */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617]/95 backdrop-blur-md p-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-[#0f172a] border border-white/10 rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden group">
            
            {/* Arkaplan Işık Efekti */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#fbbf24]/20 rounded-full blur-[60px] pointer-events-none"></div>

            {/* İkon */}
            <div className="w-20 h-20 bg-gradient-to-br from-[#fbbf24]/20 to-transparent border border-[#fbbf24]/30 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 shadow-[0_0_30px_rgba(251,191,36,0.2)]">
              <Lock className="w-10 h-10 text-[#fbbf24]" />
            </div>

            <h3 className="text-2xl font-serif font-bold text-white mb-3 relative z-10">
              Tarayıcıda Açmalısın
            </h3>
            
            <p className="text-gray-400 text-sm mb-8 leading-relaxed relative z-10">
              Google ile güvenli giriş yapabilmek ve Rüya Yorumcum'un yapay zeka özelliklerini kullanabilmek için harici tarayıcıya geçmelisin.
            </p>

            {/* Görsel Talimat Kutusu */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl mb-8 relative z-10 text-left">
              <div className="flex items-center gap-4 mb-3 text-gray-300 text-sm font-medium">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">1</div>
                <span>Sağ üstteki ikona tıkla:</span>
                <div className="flex gap-2 text-white">
                    <MoreHorizontal className="w-5 h-5" /> <span className="text-xs opacity-50">veya</span> <Share className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-4 text-[#fbbf24] text-sm font-bold">
                <div className="w-8 h-8 rounded-full bg-[#fbbf24]/20 flex items-center justify-center">2</div>
                <span>"Tarayıcıda Aç"ı seç</span>
                <Compass className="w-5 h-5" />
              </div>
            </div>

            {/* Alt Butonlar */}
            <div className="flex flex-col gap-4 relative z-10">
               <button 
                  onClick={() => setShowModal(false)}
                  className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Tamam, Anladım
                </button>
                
                <button 
                  onClick={() => router.push(targetUrl)}
                  className="text-xs text-gray-500 hover:text-white transition-colors underline py-2"
                >
                  Yine de devam et (Giriş Yapılamaz)
                </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}