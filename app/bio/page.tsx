import { Metadata } from 'next';
import SmartLinkButton from '@/components/ui/SmartLinkButton';
import { 
  Moon, Sparkles, Layers, Compass, Hash, 
  ArrowRight, Instagram, BrainCircuit, Globe, Palette 
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Linkler | Rüya Yorumcum AI',
  description: 'Rüya tabirleri, Tarot ve Astroloji analizleri.',
};

export default function BioPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-x-hidden font-sans flex flex-col items-center py-12 px-4">
      
      {/* --- ARKAPLAN EFEKTLERİ --- */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#fbbf24]/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-slow"></div>
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay -z-10"></div>

      {/* --- PROFİL BAŞLIĞI --- */}
      <div className="text-center mb-8 relative z-10 animate-in fade-in slide-in-from-top-10 duration-700">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#fbbf24] text-[11px] font-bold tracking-widest uppercase mb-6 backdrop-blur-md shadow-lg shadow-[#fbbf24]/10">
           <Sparkles className="w-3 h-3" /> Türkiye'nin #1 Yapay Zekası
        </div>
        
        <h1 className="font-serif text-5xl font-bold mb-3 leading-tight tracking-tight">
          Rüya Yorumcum <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d97706] drop-shadow-sm">
             AI
          </span>
        </h1>
        <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed mb-6">
          Bilinçaltınızın şifrelerini çözün.<br/>Rüya, Tarot ve Astroloji rehberiniz.
        </p>
      </div>

      {/* --- BUTON LİSTESİ --- */}
      <div className="w-full max-w-md space-y-4 relative z-10 pb-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
        
        {/* 0. ANA SAYFA BUTONU (EN ÜSTTE) */}
        <a 
          href="https://ruyayorumcum.com.tr/" 
          target="_blank"
          className="w-full group relative overflow-hidden rounded-2xl bg-white text-black font-bold text-lg p-1 transition-transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-white/5 block text-center"
        >
          <div className="relative bg-white h-full w-full rounded-xl px-6 py-4 flex items-center justify-center gap-3">
             <Globe className="w-5 h-5" />
             Web Sitesine Git
          </div>
        </a>

        {/* 1. RÜYA ANALİZİ (GOLD) */}
        <SmartLinkButton 
          targetUrl="/ruya-tabiri"
          className="w-full group relative overflow-hidden p-[1px] rounded-2xl shadow-xl shadow-[#fbbf24]/10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#fbbf24] to-[#d97706] opacity-100"></div>
          <div className="relative bg-[#fbbf24] text-black h-full w-full rounded-2xl px-6 py-5 flex items-center justify-between font-bold text-lg group-hover:bg-[#fcd34d] transition-colors">
            <span className="flex items-center gap-4">
              <div className="bg-black/10 p-2 rounded-lg"><Moon className="w-6 h-6 fill-black" /></div>
              Rüya Analizi
            </span>
            <div className="bg-black/10 p-2 rounded-full group-hover:translate-x-1 transition-transform">
               <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </SmartLinkButton>

        {/* 2. RÜYA GÖRSELLEŞTİRME (PURPLE) */}
        <SmartLinkButton 
          targetUrl="/ruya-gorsellestirme"
          className="w-full group relative overflow-hidden p-[1px] rounded-2xl shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-fuchsia-600 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative bg-[#0f172a] h-full w-full rounded-2xl px-6 py-4 flex items-center justify-between border border-purple-500/20 group-hover:bg-[#0f172a]/90 transition-all">
            <span className="flex items-center gap-4 text-purple-100 font-semibold text-lg">
              <div className="bg-purple-500/20 p-2 rounded-lg"><Palette className="w-6 h-6 text-purple-400" /></div>
              Rüya Görselleştirme
            </span>
            <ArrowRight className="w-5 h-5 text-purple-400 opacity-70 group-hover:translate-x-1 transition-transform" />
          </div>
        </SmartLinkButton>

        {/* 3. TAROT FALI (PINK) */}
        <SmartLinkButton 
          targetUrl="/tarot"
          className="w-full group relative overflow-hidden p-[1px] rounded-2xl shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-600 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative bg-[#0f172a] h-full w-full rounded-2xl px-6 py-4 flex items-center justify-between border border-pink-500/20 group-hover:bg-[#0f172a]/90 transition-all">
            <span className="flex items-center gap-4 text-pink-100 font-semibold text-lg">
              <div className="bg-pink-500/20 p-2 rounded-lg"><Layers className="w-6 h-6 text-pink-400" /></div>
              Tarot Falı Bak
            </span>
            <ArrowRight className="w-5 h-5 text-pink-400 opacity-70 group-hover:translate-x-1 transition-transform" />
          </div>
        </SmartLinkButton>

        {/* 4. ASTROLOJİ (INDIGO) */}
        <SmartLinkButton 
          targetUrl="/astroloji"
          className="w-full group relative overflow-hidden p-[1px] rounded-2xl shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative bg-[#0f172a] h-full w-full rounded-2xl px-6 py-4 flex items-center justify-between border border-indigo-500/20 group-hover:bg-[#0f172a]/90 transition-all">
            <span className="flex items-center gap-4 text-indigo-100 font-semibold text-lg">
              <div className="bg-indigo-500/20 p-2 rounded-lg"><Compass className="w-6 h-6 text-indigo-400" /></div>
              Astroloji
            </span>
            <ArrowRight className="w-5 h-5 text-indigo-400 opacity-70 group-hover:translate-x-1 transition-transform" />
          </div>
        </SmartLinkButton>

        {/* 5. NUMEROLOJİ (AMBER) */}
        <SmartLinkButton 
          targetUrl="/numeroloji"
          className="w-full group relative overflow-hidden p-[1px] rounded-2xl shadow-lg"
        >
           <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 opacity-40 group-hover:opacity-80 transition-opacity"></div>
           <div className="relative bg-[#0f172a] h-full w-full rounded-2xl px-6 py-4 flex items-center justify-between border border-amber-500/20 group-hover:bg-[#0f172a]/90 transition-all">
            <span className="flex items-center gap-4 text-amber-100 font-semibold text-lg">
               <div className="bg-amber-500/20 p-2 rounded-lg"><Hash className="w-6 h-6 text-amber-500" /></div>
              Numeroloji
            </span>
            <ArrowRight className="w-5 h-5 text-amber-500 opacity-70 group-hover:translate-x-1 transition-transform" />
          </div>
        </SmartLinkButton>

         {/* 6. DUYGU ANALİZİ (EMERALD) */}
        <SmartLinkButton 
          targetUrl="/duygu-analizi"
          className="w-full group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
        >
          <div className="relative px-6 py-4 flex items-center justify-between">
            <span className="flex items-center gap-4 text-gray-300 font-medium">
               <div className="bg-emerald-500/10 p-2 rounded-lg"><BrainCircuit className="w-5 h-5 text-emerald-500" /></div>
              Duygu Analizi
            </span>
            <ArrowRight className="w-4 h-4 text-gray-500" />
          </div>
        </SmartLinkButton>

        {/* SOSYAL MEDYA LİNKLERİ (Footer) */}
        <div className="flex justify-center gap-6 mt-8 pt-6 border-t border-white/10 w-full">
            
            {/* Instagram */}
            <a 
              href="https://www.instagram.com/ruyayorumcum_ai?igsh=MWxlemozdzU4NGNjcg==" 
              target="_blank" 
              className="p-4 rounded-full bg-gradient-to-tr from-purple-600 to-orange-500 text-white shadow-lg hover:scale-110 transition-transform"
            >
                <Instagram className="w-6 h-6" />
            </a>

            {/* TikTok */}
            <a 
              href="https://www.tiktok.com/@ruya.yorumcum.ai?is_from_webapp=1&sender_device=pc" 
              target="_blank" 
              className="p-4 rounded-full bg-black border border-white/20 text-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
            >
                {/* TikTok SVG İkonu (Lucide kütüphanesinde olmadığı için manuel SVG) */}
                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
            </a>

            {/* Web Sitesi (Alternatif) */}
            <a 
              href="https://ruyayorumcum.com.tr/" 
              target="_blank" 
              className="p-4 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 hover:scale-110 transition-transform"
            >
                <Globe className="w-6 h-6" />
            </a>
        </div>

      </div>

      {/* --- FOOTER --- */}
      <footer className="mt-auto text-center space-y-2 pb-6">
        <p className="text-gray-500 text-xs">© 2026 Rüya Yorumcum AI</p>
        <p className="text-[#fbbf24]/40 text-[10px] uppercase tracking-widest">Tüm Hakları Saklıdır</p>
      </footer>

    </main>
  );
}