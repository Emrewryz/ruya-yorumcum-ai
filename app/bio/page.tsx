"use client"; // Client component olmak zorunda

import { useEffect, useState } from 'react';
import SmartLinkButton from '@/components/ui/SmartLinkButton';
import { isInAppBrowser } from '@/utils/browserCheck';
import { 
  Moon, Sparkles, Layers, Compass, Hash, 
  ArrowRight, Instagram, BrainCircuit, Globe, Palette, 
  Lock, Copy, Check, MoreHorizontal, Share
} from 'lucide-react';
import { toast } from 'sonner'; // Eğer projenizde sonner varsa (layout'ta görmüştüm)

export default function BioPage() {
  const [isRestricted, setIsRestricted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sayfa yüklendiğinde tarayıcı kontrolü yap
  useEffect(() => {
    if (isInAppBrowser()) {
      setIsRestricted(true);
    }
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://www.ruyayorumcum.com.tr/bio");
    setCopied(true);
    toast.success("Link kopyalandı! Tarayıcına yapıştırabilirsin.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-x-hidden font-sans flex flex-col items-center py-12 px-4">
      
      {/* --- ENGELLEYİCİ MODAL (Eğer TikTok'taysa OTOMATİK Açılır) --- */}
      {isRestricted && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#020617]/95 backdrop-blur-xl p-6 animate-in fade-in duration-300">
          <div className="bg-[#0f172a] border border-red-500/30 rounded-[2rem] p-6 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
            
            {/* Arkaplan Alarm Efekti */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-red-500/10 rounded-full blur-[60px] pointer-events-none"></div>

            <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10 animate-pulse">
              <Lock className="w-8 h-8 text-red-500" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2 relative z-10">
              Giriş Yapılamıyor!
            </h3>
            
            <p className="text-gray-400 text-sm mb-6 leading-relaxed relative z-10">
              TikTok tarayıcısı Google ile güvenli girişi engellemektedir. Devam etmek için lütfen sayfayı <strong>Chrome</strong> veya <strong>Safari</strong>'de açın.
            </p>

            {/* ÇÖZÜM 1: LİNKİ KOPYALA */}
            <button 
              onClick={handleCopyLink}
              className="w-full mb-4 py-4 bg-[#fbbf24] text-black font-bold rounded-xl hover:bg-[#f59e0b] transition-all flex items-center justify-center gap-2 relative z-10 active:scale-95"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? "Kopyalandı!" : "Linki Kopyala"}
            </button>

            {/* ÇÖZÜM 2: TARİF */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-4 text-left relative z-10">
              <p className="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">Veya Şunu Yapın:</p>
              <div className="flex items-center gap-2 text-sm text-gray-200">
                <span>1. Sağ üstteki</span>
                <MoreHorizontal className="w-4 h-4" /><span className="text-xs">/</span><Share className="w-4 h-4" />
                <span>ikonuna tıkla.</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#fbbf24] font-bold mt-1">
                <span>2. "Tarayıcıda Aç"ı seç.</span>
                <Compass className="w-4 h-4" />
              </div>
            </div>

            <button 
              onClick={() => setIsRestricted(false)}
              className="text-xs text-gray-600 hover:text-gray-400 underline py-2 relative z-10"
            >
              Yine de kısıtlı modda göz at
            </button>
          </div>
        </div>
      )}

      {/* --- SAYFA İÇERİĞİ (DEĞİŞMEDİ) --- */}
      {/* ... Burası önceki attığım kodun aynısı kalabilir ... */}
      
      {/* Arkaplan Efektleri */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#fbbf24]/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      {/* Profil Başlığı */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#fbbf24] text-[11px] font-bold tracking-widest uppercase mb-6 backdrop-blur-md">
           <Sparkles className="w-3 h-3" /> Türkiye'nin #1 Yapay Zekası
        </div>
        <h1 className="font-serif text-5xl font-bold mb-3 leading-tight tracking-tight">
          Rüya Yorumcum <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d97706]">AI</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed mb-6">
          Bilinçaltınızın şifrelerini çözün.<br/>Rüya, Tarot ve Astroloji rehberiniz.
        </p>
      </div>

      {/* Buton Listesi */}
      <div className="w-full max-w-md space-y-4 relative z-10 pb-12">
        
        {/* Ana Sayfa */}
        <a href="https://ruyayorumcum.com.tr/" target="_blank" className="w-full bg-white text-black font-bold text-lg p-1 rounded-2xl block text-center transition-transform hover:scale-[1.02]">
          <div className="bg-white h-full w-full rounded-xl px-6 py-4 flex items-center justify-center gap-3">
             <Globe className="w-5 h-5" /> Web Sitesine Git
          </div>
        </a>

        {/* Rüya Analizi */}
        <SmartLinkButton targetUrl="/ruya-tabiri" className="w-full group relative overflow-hidden p-[1px] rounded-2xl shadow-xl shadow-[#fbbf24]/10">
          <div className="absolute inset-0 bg-gradient-to-r from-[#fbbf24] to-[#d97706]"></div>
          <div className="relative bg-[#fbbf24] text-black h-full w-full rounded-2xl px-6 py-5 flex items-center justify-between font-bold text-lg">
            <span className="flex items-center gap-4">
              <div className="bg-black/10 p-2 rounded-lg"><Moon className="w-6 h-6 fill-black" /></div> Rüya Analizi
            </span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </SmartLinkButton>

        {/* Rüya Görselleştirme */}
        <SmartLinkButton targetUrl="/ruya-gorsellestirme" className="w-full group relative overflow-hidden p-[1px] rounded-2xl shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-fuchsia-600 opacity-60"></div>
          <div className="relative bg-[#0f172a] h-full w-full rounded-2xl px-6 py-4 flex items-center justify-between border border-purple-500/20">
            <span className="flex items-center gap-4 text-purple-100 font-semibold text-lg">
              <div className="bg-purple-500/20 p-2 rounded-lg"><Palette className="w-6 h-6 text-purple-400" /></div> Rüya Görselleştirme
            </span>
            <ArrowRight className="w-5 h-5 text-purple-400" />
          </div>
        </SmartLinkButton>

        {/* Tarot */}
        <SmartLinkButton targetUrl="/tarot" className="w-full group relative overflow-hidden p-[1px] rounded-2xl shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-600 opacity-60"></div>
          <div className="relative bg-[#0f172a] h-full w-full rounded-2xl px-6 py-4 flex items-center justify-between border border-pink-500/20">
            <span className="flex items-center gap-4 text-pink-100 font-semibold text-lg">
              <div className="bg-pink-500/20 p-2 rounded-lg"><Layers className="w-6 h-6 text-pink-400" /></div> Tarot Falı Bak
            </span>
            <ArrowRight className="w-5 h-5 text-pink-400" />
          </div>
        </SmartLinkButton>

         {/* Astroloji */}
         <SmartLinkButton targetUrl="/astroloji" className="w-full group relative overflow-hidden p-[1px] rounded-2xl shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-60"></div>
          <div className="relative bg-[#0f172a] h-full w-full rounded-2xl px-6 py-4 flex items-center justify-between border border-indigo-500/20">
            <span className="flex items-center gap-4 text-indigo-100 font-semibold text-lg">
              <div className="bg-indigo-500/20 p-2 rounded-lg"><Compass className="w-6 h-6 text-indigo-400" /></div> Astroloji
            </span>
            <ArrowRight className="w-5 h-5 text-indigo-400" />
          </div>
        </SmartLinkButton>

        {/* Numeroloji */}
        <SmartLinkButton targetUrl="/numeroloji" className="w-full group relative overflow-hidden p-[1px] rounded-2xl shadow-lg">
           <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 opacity-40"></div>
           <div className="relative bg-[#0f172a] h-full w-full rounded-2xl px-6 py-4 flex items-center justify-between border border-amber-500/20">
            <span className="flex items-center gap-4 text-amber-100 font-semibold text-lg">
               <div className="bg-amber-500/20 p-2 rounded-lg"><Hash className="w-6 h-6 text-amber-500" /></div> Numeroloji
            </span>
            <ArrowRight className="w-5 h-5 text-amber-500" />
          </div>
        </SmartLinkButton>

        {/* Duygu Analizi */}
        <SmartLinkButton targetUrl="/duygu-analizi" className="w-full group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10">
          <div className="relative px-6 py-4 flex items-center justify-between">
            <span className="flex items-center gap-4 text-gray-300 font-medium">
               <div className="bg-emerald-500/10 p-2 rounded-lg"><BrainCircuit className="w-5 h-5 text-emerald-500" /></div> Duygu Analizi
            </span>
            <ArrowRight className="w-4 h-4 text-gray-500" />
          </div>
        </SmartLinkButton>

        {/* Sosyal Medya */}
        <div className="flex justify-center gap-6 mt-8 pt-6 border-t border-white/10 w-full">
            <a href="https://instagram.com/ruyayorumcumai" target="_blank" className="p-4 rounded-full bg-gradient-to-tr from-purple-600 to-orange-500 text-white shadow-lg hover:scale-110 transition-transform">
                <Instagram className="w-6 h-6" />
            </a>
            <a href="https://www.tiktok.com/@ruya.yorumcum.ai?is_from_webapp=1&sender_device=pc" target="_blank" className="p-4 rounded-full bg-black border border-white/20 text-white shadow-lg hover:scale-110 transition-transform">
               {/* TikTok SVG (Manuel) */}
               <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
            </a>
            <a href="https://ruyayorumcum.com.tr/" target="_blank" className="p-4 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
            </a>
        </div>

      </div>

      <footer className="mt-auto text-center space-y-2 pb-6">
        <p className="text-gray-500 text-xs">© 2026 Rüya Yorumcum AI</p>
        <p className="text-[#fbbf24]/40 text-[10px] uppercase tracking-widest">Tüm Hakları Saklıdır</p>
      </footer>
    </main>
  );
}