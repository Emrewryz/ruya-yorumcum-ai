"use client";

import { useEffect, useState } from 'react';
import SmartLinkButton from '@/components/ui/SmartLinkButton';
import { isInAppBrowser } from '@/utils/browserCheck';
import { 
  Moon, Sparkles, Layers, Compass, Hash, 
  ArrowRight, Instagram, BrainCircuit, Globe, Palette, 
  Lock, Copy, Check, MoreHorizontal, Share, Star
} from 'lucide-react';
import { toast } from 'sonner'; 

export default function BioPage() {
  const [isRestricted, setIsRestricted] = useState(false);
  const [copied, setCopied] = useState(false);

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
    // min-h-[100dvh] ile mobil ekrana tam oturmasını sağlıyoruz
    <main className="min-h-[100dvh] bg-[#0B0F19] text-slate-200 relative overflow-x-hidden font-sans flex flex-col items-center justify-center py-4 px-4 selection:bg-amber-500/30">
      
      {/* --- ENGELLEYİCİ MODAL (TikTok/IG Browser) --- */}
      {isRestricted && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#0B0F19]/95 backdrop-blur-xl p-4 animate-in fade-in duration-300">
          <div className="bg-[#131722] border border-red-500/30 rounded-[2rem] p-6 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-500/10 rounded-full blur-[50px] pointer-events-none"></div>
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 relative z-10 animate-pulse">
              <Lock className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 relative z-10">Giriş Yapılamıyor!</h3>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed relative z-10 font-light">
              Sosyal medya tarayıcıları güvenli girişi engellemektedir. Devam etmek için sayfayı <strong className="text-white">Chrome</strong> veya <strong className="text-white">Safari</strong>'de açın.
            </p>
            <button onClick={handleCopyLink} className="w-full mb-4 py-3 bg-amber-500 text-[#0B0F19] text-sm font-bold rounded-xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2 active:scale-95 relative z-10">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Kopyalandı!" : "Linki Kopyala"}
            </button>
            <div className="bg-[#0B0F19] border border-white/5 p-4 rounded-xl mb-4 text-left relative z-10">
              <p className="text-[9px] text-slate-500 mb-2 font-bold uppercase tracking-widest">Veya Şunu Yapın:</p>
              <div className="flex items-center gap-2 text-xs text-slate-300 mb-2">
                <span>1. Sağ üstteki</span>
                <MoreHorizontal className="w-3 h-3 text-slate-400" /><span className="text-[10px] text-slate-600">/</span><Share className="w-3 h-3 text-slate-400" />
                <span>ikonuna tıkla.</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-500 font-bold">
                <span>2. "Tarayıcıda Aç"ı seç.</span>
                <Compass className="w-3 h-3" />
              </div>
            </div>
            <button onClick={() => setIsRestricted(false)} className="text-[10px] text-slate-500 hover:text-slate-300 underline py-2 relative z-10 transition-colors">
              Yine de kısıtlı modda göz at
            </button>
          </div>
        </div>
      )}

      {/* --- ATMOSFERİK ARKA PLAN --- */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay z-0" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      {/* ================= PROFİL BAŞLIĞI (Kompakt) ================= */}
      <div className="text-center mb-6 relative z-10 w-full max-w-md mt-auto pt-4">
        <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-amber-500 to-[#0B0F19] rounded-2xl p-[1px] shadow-[0_0_30px_-5px_rgba(251,191,36,0.3)]">
            <div className="w-full h-full bg-[#131722] rounded-[15px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
        </div>
        <h1 className="font-serif text-2xl font-bold mb-1 leading-tight tracking-tight text-white">
          Rüya Yorumcum
        </h1>
        <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto font-light">
          Rüya, Tarot ve Astroloji rehberiniz.
        </p>
      </div>

      {/* ================= BUTON LİSTESİ (Sıkı & Mat Renkli) ================= */}
      <div className="w-full max-w-md space-y-2.5 relative z-10">
        
        {/* 1. ÖNE ÇIKAN: Rüya Analizi (Mat Altın) */}
        <SmartLinkButton targetUrl="/ruya-tabiri" className="w-full group relative overflow-hidden rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/90 to-amber-600/90"></div>
          <div className="relative h-full w-full px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#0B0F19]/20 p-2 rounded-lg backdrop-blur-sm"><Moon className="w-5 h-5 text-[#0B0F19] fill-[#0B0F19]" /></div> 
              <div className="text-left">
                 <span className="block text-[#0B0F19] font-bold text-[15px] leading-tight">Ücretsiz Rüya Analizi</span>
                 <span className="text-[#0B0F19]/70 text-[9px] font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-current"/> En Popüler
                 </span>
              </div>
            </div>
            <div className="bg-[#0B0F19]/10 p-1.5 rounded-full group-hover:translate-x-1 transition-transform">
               <ArrowRight className="w-4 h-4 text-[#0B0F19]" />
            </div>
          </div>
        </SmartLinkButton>

        {/* 2. ANA SAYFA (Mat Beyaz) */}
        <a href="https://ruyayorumcum.com.tr/" target="_blank" className="w-full group bg-slate-100 text-[#0B0F19] rounded-xl p-3.5 flex items-center justify-between shadow-md transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="bg-slate-200 p-2 rounded-lg"><Globe className="w-5 h-5 text-slate-700" /></div> 
              <span className="font-bold text-[15px]">Web Sitesine Git</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
        </a>

        {/* --- DİĞER HİZMETLER (Mat Renkli Cam Tasarımı) --- */}
        <div className="pt-1 space-y-2.5">
            
            {/* Rüya Görselleştirme (Mat Mor) */}
            <SmartLinkButton targetUrl="/ruya-gorsellestirme" className="w-full group bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-xl p-3 flex items-center justify-between hover:bg-fuchsia-500/20 transition-all duration-300">
                <div className="flex items-center gap-3">
                <div className="bg-fuchsia-500/10 p-2 rounded-lg"><Palette className="w-4 h-4 text-fuchsia-400" /></div> 
                <div className="text-left">
                    <span className="block text-fuchsia-100 font-medium text-[14px]">Rüyadan Resim Yap</span>
                    <span className="text-fuchsia-400/60 text-[9px] uppercase tracking-widest mt-0.5 block">AI Görselleştirme</span>
                </div>
                </div>
                <ArrowRight className="w-4 h-4 text-fuchsia-400/50 group-hover:translate-x-1 group-hover:text-fuchsia-400 transition-all" />
            </SmartLinkButton>

            {/* Tarot (Mat Pembe) */}
            <SmartLinkButton targetUrl="/tarot" className="w-full group bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-center justify-between hover:bg-rose-500/20 transition-all duration-300">
                <div className="flex items-center gap-3">
                <div className="bg-rose-500/10 p-2 rounded-lg"><Layers className="w-4 h-4 text-rose-400" /></div> 
                <div className="text-left">
                    <span className="block text-rose-100 font-medium text-[14px]">Günün Tarot Falı</span>
                    <span className="text-rose-400/60 text-[9px] uppercase tracking-widest mt-0.5 block">Yapay Zeka Yorumu</span>
                </div>
                </div>
                <ArrowRight className="w-4 h-4 text-rose-400/50 group-hover:translate-x-1 group-hover:text-rose-400 transition-all" />
            </SmartLinkButton>

            {/* Astroloji (Mat İndigo) */}
            <SmartLinkButton targetUrl="/astroloji" className="w-full group bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex items-center justify-between hover:bg-indigo-500/20 transition-all duration-300">
                <div className="flex items-center gap-3">
                <div className="bg-indigo-500/10 p-2 rounded-lg"><Compass className="w-4 h-4 text-indigo-400" /></div> 
                <div className="text-left">
                    <span className="block text-indigo-100 font-medium text-[14px]">Doğum Haritası</span>
                    <span className="text-indigo-400/60 text-[9px] uppercase tracking-widest mt-0.5 block">Yükselen & Transitler</span>
                </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-400/50 group-hover:translate-x-1 group-hover:text-indigo-400 transition-all" />
            </SmartLinkButton>

            {/* Numeroloji (Mat Turuncu) */}
            <SmartLinkButton targetUrl="/numeroloji" className="w-full group bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex items-center justify-between hover:bg-orange-500/20 transition-all duration-300">
                <div className="flex items-center gap-3">
                <div className="bg-orange-500/10 p-2 rounded-lg"><Hash className="w-4 h-4 text-orange-400" /></div> 
                <div className="text-left">
                    <span className="block text-orange-100 font-medium text-[14px]">Numeroloji Paneli</span>
                    <span className="text-orange-400/60 text-[9px] uppercase tracking-widest mt-0.5 block">Yaşam Yolu Şifresi</span>
                </div>
                </div>
                <ArrowRight className="w-4 h-4 text-orange-400/50 group-hover:translate-x-1 group-hover:text-orange-400 transition-all" />
            </SmartLinkButton>

            {/* Duygu Analizi (Mat Zümrüt Yeşili) */}
            <SmartLinkButton targetUrl="/duygu-analizi" className="w-full group bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between hover:bg-emerald-500/20 transition-all duration-300">
                <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 p-2 rounded-lg"><BrainCircuit className="w-4 h-4 text-emerald-400" /></div> 
                <div className="text-left">
                    <span className="block text-emerald-100 font-medium text-[14px]">Duygu Analizi</span>
                    <span className="text-emerald-400/60 text-[9px] uppercase tracking-widest mt-0.5 block">Stres & Bilinçaltı</span>
                </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400/50 group-hover:translate-x-1 group-hover:text-emerald-400 transition-all" />
            </SmartLinkButton>
        </div>

        {/* ================= SOSYAL MEDYA İKONLARI ================= */}
        <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-white/5 w-full">
            <a href="https://instagram.com/ruyayorumcumai" target="_blank" className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-md">
                <Instagram className="w-5 h-5" />
            </a>
            <a href="https://www.tiktok.com/@ruya.yorumcum.ai?is_from_webapp=1&sender_device=pc" target="_blank" className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-md flex items-center justify-center">
               <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
            </a>
            <a href="https://ruyayorumcum.com.tr/" target="_blank" className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-md">
                <Globe className="w-5 h-5" />
            </a>
        </div>

      </div>

      <footer className="mt-auto text-center pt-2 pb-2">
        <p className="text-slate-600 text-[10px] font-medium">© 2026 Rüya Yorumcum AI</p>
      </footer>
    </main>
  );
}