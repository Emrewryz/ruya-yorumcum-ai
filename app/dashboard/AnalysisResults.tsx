"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, Moon, Lock, Check, ImageIcon, Download, Heart, Star, ChevronRight, Layers, MessageCircle, Sparkles } from "lucide-react";

// --- YARDIMCI BİLEŞENLER ---
const TypewriterText = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) { setDisplayed(prev => prev + text.charAt(i)); i++; }
      else clearInterval(timer);
    }, 15);
    return () => clearInterval(timer);
  }, [text]);
  return <p className="text-gray-300 leading-relaxed text-sm md:text-base font-light text-justify">{displayed}</p>;
};

const LockedFeature = ({ title }: { title: string }) => {
  const router = useRouter();
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl p-6 text-center group cursor-pointer transition-all rounded-3xl md:rounded-[2rem]" onClick={(e) => { e.stopPropagation(); router.push('/dashboard/pricing'); }}>
       <div className="p-4 rounded-full bg-white/5 border border-white/10 mb-4 group-hover:bg-white/10 group-hover:scale-110 transition-all"><Lock className="w-5 h-5 text-gray-300" /></div>
       <h3 className="text-white font-serif text-lg mb-2">{title}</h3>
       <p className="text-gray-500 text-xs mb-6 max-w-[180px]">Premium'a geçin.</p>
       <button className="px-6 py-2 rounded-full border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all">Yükselt</button>
    </div>
  );
};

// --- ANA BİLEŞEN ---
interface Props {
  result: any;
  userTier: 'free' | 'pro' | 'elite';
  currentDreamId: string | null;
  generatedImage: string | null;
  onDownloadImage: () => void;
}

export default function AnalysisResults({ result, userTier, currentDreamId, generatedImage, onDownloadImage }: Props) {
  const router = useRouter();
  const hasAccess = (req: string) => {
    const levels = { free: 0, pro: 1, elite: 2 };
    return levels[userTier as keyof typeof levels] >= levels[req as keyof typeof levels];
  };

  return (
    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="pb-32 space-y-8 md:space-y-12">
      
      {/* 1. ÖZET BÖLÜMÜ */}
      <div className="text-center mb-10 md:mb-16 px-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[#fbbf24] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6">
            <Check className="w-3 h-3 md:w-4 md:h-4" /> Analiz Tamamlandı
        </div>
        <h2 className="font-serif text-2xl md:text-5xl font-bold text-white mb-6 md:mb-8 leading-tight">
            {result.title || "Rüyanın Gizli Mesajı"}
        </h2>
        
        {/* MOBİL: p-5, DESKTOP: p-8 */}
        <div className="max-w-3xl mx-auto p-5 md:p-8 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm relative text-left">
           <TypewriterText text={result.summary} />
        </div>
      </div>

      {/* 2. DETAYLI ANALİZ (SOL/SAĞ) */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
         {/* KART 1: BİLİNÇALTI */}
         <div className="relative p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] bg-[#0f172a] border border-blue-500/10 hover:border-blue-500/30 transition-colors shadow-2xl overflow-hidden group">
            <h3 className="font-serif text-xl md:text-2xl text-blue-400 mb-4 md:mb-6 flex items-center gap-3">
                <Brain className="w-5 h-5 md:w-6 md:h-6" /> Bilinçaltı
            </h3>
            {!hasAccess('pro') ? <LockedFeature title="Psikolojik Derinlik" /> : <div className="prose prose-invert text-gray-300 text-sm leading-relaxed"><TypewriterText text={result.psychological} /></div>}
         </div>
         
         {/* KART 2: MANEVİ */}
         <div className="relative p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] bg-[#022c22] border border-emerald-500/10 hover:border-emerald-500/30 transition-colors shadow-2xl overflow-hidden group">
            <h3 className="font-serif text-xl md:text-2xl text-emerald-400 mb-4 md:mb-6 flex items-center gap-3">
                <Moon className="w-5 h-5 md:w-6 md:h-6" /> Manevi Mesaj
            </h3>
            {!hasAccess('pro') ? <LockedFeature title="Manevi Tabir" /> : <div className="prose prose-invert text-gray-300 text-sm leading-relaxed"><TypewriterText text={result.spiritual} /></div>}
         </div>
      </div>

      {/* 3. GRID SİSTEMİ (GÖRSEL, MOOD, NUMEROLOJİ, TAROT) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
         
         {/* GÖRSEL STUDIO */}
         <div className="relative col-span-1 md:col-span-2 rounded-3xl md:rounded-[2rem] overflow-hidden bg-[#080808] border border-white/10 group shadow-2xl min-h-[400px] md:min-h-[450px]">
            <div className="grid md:grid-cols-2 h-full relative z-10">
               <div className="p-6 md:p-10 flex flex-col justify-center order-2 md:order-1">
                  <h3 className="font-serif text-2xl md:text-3xl text-white mb-4 md:mb-6">
                      Rüyanın <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Sanat Hali</span>
                  </h3>
                  <p className="text-gray-400 mb-6 md:mb-10 text-xs md:text-sm">Bilinçaltındaki görüntüleri dijital sanata dönüştür.</p>
                  
                  {hasAccess('pro') ? (
                     <button onClick={() => router.push(`/dashboard/gorsel-olustur/${currentDreamId}`)} className="self-start w-full md:w-auto justify-center px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-xs md:text-sm flex items-center gap-3">
                        <ImageIcon className="w-4 h-4 md:w-5 md:h-5" /> Görseli Oluştur
                     </button>
                  ) : <div className="text-gray-500 font-bold text-sm flex items-center gap-3"><Lock className="w-4 h-4" /> Kilitli</div>}
               </div>
               
               <div className="relative h-[250px] md:h-full bg-[#050505] border-b md:border-b-0 md:border-l border-white/10 order-1 md:order-2">
                  {generatedImage ? (
                     <>
                        <img src={generatedImage} className="w-full h-full object-cover" alt="Dream" />
                        <button onClick={onDownloadImage} className="absolute bottom-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 text-white"><Download className="w-4 h-4" /></button>
                     </>
                  ) : <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"><Sparkles className="w-8 h-8 text-violet-400 mb-2" /><p className="text-violet-200/50 text-xs">AI Canvas Boş</p></div>}
               </div>
            </div>
         </div>

         {/* MOOD */}
         <div onClick={() => hasAccess('pro') && router.push('/dashboard/duygu-durumu')} className="relative group rounded-3xl md:rounded-[2rem] bg-[#080808] border border-white/10 p-6 md:p-8 overflow-hidden hover:border-rose-500/30 transition-all cursor-pointer min-h-[280px] md:min-h-[320px]">
            {!hasAccess('pro') && <LockedFeature title="Duygu Analizi" />}
            <div className="flex items-center gap-3 mb-6"><Heart className="w-5 h-5 text-rose-400" /><span className="text-gray-400 text-xs font-bold uppercase">Duygu</span></div>
            <h3 className="font-serif text-3xl md:text-4xl text-rose-400 mb-2">{result.mood}</h3>
            <p className="text-gray-500 text-sm mb-4">Yoğunluk: %{result.mood_score}</p>
            <div className="flex items-end gap-1 h-12 w-full">{[...Array(12)].map((_, i) => (<div key={i} className="w-full rounded-t-sm bg-rose-500/40" style={{ height: `${Math.random() * 80 + 10}%`, opacity: (i+1)/12 }}></div>))}</div>
         </div>

         {/* NUMEROLOJİ */}
         <div className="relative group rounded-3xl md:rounded-[2rem] bg-[#080808] border border-white/10 p-6 md:p-8 overflow-hidden hover:border-sky-500/30 transition-all min-h-[280px] md:min-h-[320px]">
            {!hasAccess('pro') && <LockedFeature title="Numeroloji" />}
            <div className="flex items-center gap-3 mb-6"><Star className="w-5 h-5 text-sky-400" /><span className="text-gray-400 text-xs font-bold uppercase">Kozmik</span></div>
            <div className="flex flex-wrap gap-3 mb-6">
               {result.lucky_numbers?.map((num: any, i: number) => (
                  <div key={i} className="w-10 h-12 md:w-12 md:h-14 rounded-xl bg-[#0f172a] border border-sky-500/20 flex items-center justify-center font-mono text-lg md:text-xl text-sky-400">{num}</div>
               ))}
            </div>
            <button onClick={() => hasAccess('pro') && router.push('/dashboard/numeroloji')} className="w-full py-3 rounded-xl bg-sky-900/20 text-sky-400 text-xs font-bold uppercase flex items-center justify-center gap-2">Detaylı Analiz <ChevronRight className="w-3 h-3" /></button>
         </div>

         {/* TAROT */}
         <div className="relative group rounded-3xl md:rounded-[2rem] bg-[#080808] border border-white/10 p-6 md:p-8 overflow-hidden hover:border-amber-500/30 transition-all min-h-[280px] md:min-h-[320px]">
            {!hasAccess('pro') && <LockedFeature title="Tarot" />}
            <div className="flex items-center gap-3 mb-6"><Layers className="w-5 h-5 text-amber-400" /><span className="text-gray-400 text-xs font-bold uppercase">Mistik</span></div>
            <div className="flex items-center gap-4 bg-amber-900/10 p-4 rounded-2xl mb-6">
                <div className="w-10 h-14 md:w-12 md:h-16 bg-gradient-to-br from-amber-700 to-amber-900 rounded border border-amber-500/40"></div>
                <div className="text-amber-400 font-serif text-base md:text-lg">Gizli Kart</div>
            </div>
            <button onClick={() => hasAccess('pro') && router.push('/dashboard/tarot')} className="w-full py-3 rounded-xl bg-amber-900/20 text-amber-400 text-xs font-bold uppercase flex items-center justify-center gap-2">Kartı Aç <ChevronRight className="w-3 h-3" /></button>
         </div>

         {/* CHAT (ELITE) - MOBİLDE ALT ALTA */}
         <div className="relative col-span-1 md:col-span-2 rounded-3xl md:rounded-[2rem] bg-[#0c0a09] border border-white/10 p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 group hover:border-orange-500/30 transition-all">
            {!hasAccess('elite') && <LockedFeature title="Kahin Sohbet" />}
            <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="p-3 rounded-2xl bg-orange-500/20"><MessageCircle className="w-6 h-6 text-orange-400" /></div>
                <div>
                    <h3 className="font-serif text-lg md:text-xl text-white">Rüya Kahini ile Konuş</h3>
                    <p className="text-gray-400 text-xs">Sorular sorarak analizi derinleştir.</p>
                </div>
            </div>
            <button onClick={() => hasAccess('elite') && router.push(`/dashboard/sohbet/${currentDreamId}`)} className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-black font-bold text-xs uppercase hover:scale-105 transition-transform">Sohbeti Başlat</button>
         </div>

      </div>
    </motion.div>
  );
}