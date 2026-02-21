"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, Mountain, Wind, Droplets, Sparkles, ArrowRight, Star, ArrowLeft
} from "lucide-react";

// --- BURÇ VERİLERİ VE ELEMENT KATEGORİLERİ ---
const ELEMENTS = [
  { id: 'all', name: 'Tümü', icon: Star, color: 'text-slate-300', bg: 'bg-white/5', border: 'border-white/10' },
  { id: 'fire', name: 'Ateş', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { id: 'earth', name: 'Toprak', icon: Mountain, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'air', name: 'Hava', icon: Wind, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  { id: 'water', name: 'Su', icon: Droplets, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
];

// Emoji görünümünü engellemek için Unicode varyasyon seçici (\uFE0E) eklendi
const ZODIAC_SIGNS = [
  { id: 'koc', name: 'Koç', symbol: '♈︎', dates: '21 Mar - 19 Nis', element: 'fire', theme: 'orange' },
  { id: 'boga', name: 'Boğa', symbol: '♉︎', dates: '20 Nis - 20 May', element: 'earth', theme: 'emerald' },
  { id: 'ikizler', name: 'İkizler', symbol: '♊︎', dates: '21 May - 20 Haz', element: 'air', theme: 'sky' },
  { id: 'yengec', name: 'Yengeç', symbol: '♋︎', dates: '21 Haz - 22 Tem', element: 'water', theme: 'indigo' },
  { id: 'aslan', name: 'Aslan', symbol: '♌︎', dates: '23 Tem - 22 Ağu', element: 'fire', theme: 'orange' },
  { id: 'basak', name: 'Başak', symbol: '♍︎', dates: '23 Ağu - 22 Eyl', element: 'earth', theme: 'emerald' },
  { id: 'terazi', name: 'Terazi', symbol: '♎︎', dates: '23 Eyl - 22 Eki', element: 'air', theme: 'sky' },
  { id: 'akrep', name: 'Akrep', symbol: '♏︎', dates: '23 Eki - 21 Kas', element: 'water', theme: 'indigo' },
  { id: 'yay', name: 'Yay', symbol: '♐︎', dates: '22 Kas - 21 Ara', element: 'fire', theme: 'orange' },
  { id: 'oglak', name: 'Oğlak', symbol: '♑︎', dates: '22 Ara - 19 Oca', element: 'earth', theme: 'emerald' },
  { id: 'kova', name: 'Kova', symbol: '♒︎', dates: '20 Oca - 18 Şub', element: 'air', theme: 'sky' },
  { id: 'balik', name: 'Balık', symbol: '♓︎', dates: '19 Şub - 20 Mar', element: 'water', theme: 'indigo' },
];

export default function ZodiacIndexPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredSigns = ZODIAC_SIGNS.filter(sign => activeFilter === 'all' || sign.element === activeFilter);

  // Performans dostu Tailwind renk haritası (Kutu hover efektleri)
  const themeStyles = {
    orange: { gradient: 'from-orange-500/10 to-transparent', border: 'hover:border-orange-500/40', text: 'text-orange-400' },
    emerald: { gradient: 'from-emerald-500/10 to-transparent', border: 'hover:border-emerald-500/40', text: 'text-emerald-400' },
    sky: { gradient: 'from-sky-500/10 to-transparent', border: 'hover:border-sky-500/40', text: 'text-sky-400' },
    indigo: { gradient: 'from-indigo-500/10 to-transparent', border: 'hover:border-indigo-500/40', text: 'text-indigo-400' },
  };

  return (
    // ZEMİN: Ana sayfayla birebir uyumlu Mat Koyu Lacivert/Siyah (#0B0F19)
    <div className="min-h-screen bg-[#0B0F19] text-slate-300 font-sans relative overflow-x-hidden selection:bg-amber-500/20 pb-20">
      
      {/* Arkaplan Dokusu */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay z-0" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none z-0 transform-gpu"></div>

      {/* Geri Butonu (SEO İçin Link Etiketine Çevrildi) */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-8 md:pt-12 relative z-20">
         <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors text-xs font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-full border border-white/5 backdrop-blur-md">
            <ArrowLeft className="w-4 h-4" /> Ana Sayfa
         </Link>
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-12 md:pt-16 relative z-10 flex flex-col items-center">
        
        {/* ================= HERO ALANI (Ana sayfayla uyumlu) ================= */}
        <header className="text-center mb-12 md:mb-16 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/5 border border-amber-500/10 text-amber-200/80 text-[11px] font-medium mb-6 backdrop-blur-md tracking-wider uppercase">
              <Star className="w-3 h-3" /> Gökyüzü Rehberi
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-[1.15] font-serif">
                Zodyak'ın <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400">12 Kapısı</span>
            </h1>
            
            <p className="text-sm md:text-base text-slate-400 leading-relaxed font-light mx-auto max-w-xl">
                Güneşin hangi takımyıldızından geçtiği, ruhunuzun temel kimliğini belirler. Burcunuzun kozmik ritmini keşfedin.
            </p>
          </motion.div>
        </header>

        {/* ================= ELEMENT FİLTRELERİ ================= */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10 md:mb-12">
           {ELEMENTS.map((elem) => {
              const isActive = activeFilter === elem.id;
              const Icon = elem.icon;
              return (
                 <button
                    key={elem.id}
                    onClick={() => setActiveFilter(elem.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border transition-all duration-300 font-bold text-[10px] md:text-xs uppercase tracking-widest ${
                       isActive 
                         ? `${elem.bg} ${elem.border} ${elem.color} shadow-lg` 
                         : `bg-transparent border-white/5 text-slate-500 hover:bg-white/5 hover:text-slate-300`
                    }`}
                 >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? elem.color : 'text-slate-500'}`} />
                    {elem.name}
                 </button>
              )
           })}
        </div>

        {/* ================= BURÇLAR GRID ================= */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 w-full">
            <AnimatePresence mode="popLayout">
              {filteredSigns.map((sign) => {
                 const theme = themeStyles[sign.theme as keyof typeof themeStyles];
                 const ElementObj = ELEMENTS.find(e => e.id === sign.element);
                 const ElementIcon = ElementObj?.icon || Star;

                 return (
                    <motion.div
                       key={sign.id}
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       transition={{ duration: 0.2 }}
                       className="h-full"
                    >
                       <Link href={`/burclar/${sign.id}`} className="block h-full">
                          <article className={`relative h-full bg-[#131722] border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center group transition-all duration-300 overflow-hidden shadow-lg hover:-translate-y-1 ${theme.border}`}>
                              
                              <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>

                              <div className="text-4xl md:text-5xl font-serif mb-3 transform group-hover:scale-110 transition-transform duration-500 bg-gradient-to-br from-slate-100 to-slate-400 bg-clip-text text-transparent select-none">
                                 {sign.symbol}
                              </div>

                              <h2 className="text-lg md:text-xl font-serif font-bold text-white mb-1 group-hover:text-amber-100 transition-colors">
                                 {sign.name}
                              </h2>
                              
                              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono mb-5">
                                 {sign.dates}
                              </p>

                              <div className="mt-auto w-full pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                                  <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest">
                                     <ElementIcon className={`w-3 h-3 ${ElementObj?.color}`} />
                                     <span className="text-slate-400">{ElementObj?.name}</span>
                                  </div>
                                  <div className="text-slate-600 group-hover:text-amber-400 transition-colors">
                                      <ArrowRight className="w-3.5 h-3.5 -rotate-45 group-hover:rotate-0 transition-transform" />
                                  </div>
                              </div>
                          </article>
                       </Link>
                    </motion.div>
                 );
              })}
            </AnimatePresence>
        </div>

        {/* ================= PREMIUM CTA KUTUSU ================= */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="w-full mt-16 md:mt-24 mb-6">
            <div className="bg-[#131722] border border-white/5 rounded-[2rem] p-6 md:p-10 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 group">
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-20"></div>
                
                <div className="relative z-10 flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-400 text-[9px] font-bold uppercase tracking-widest">
                       <Sparkles className="w-3 h-3" /> Size Özel Sentez
                    </div>
                    <h3 className="font-serif text-2xl md:text-3xl font-bold text-white mb-3">
                       Gerçek Kozmik Kimliğiniz
                    </h3>
                    <p className="text-xs md:text-sm text-slate-400 font-light leading-relaxed max-w-xl">
                       Sadece Güneş burcunuzdan ibaret değilsiniz. Doğum saatiniz ve yerinizle <strong>Yükselen</strong> ve <strong>Ay burcunuzu</strong> hesaplayıp, yapay zeka ile sadece size özel harita analizinizi çıkarıyoruz.
                    </p>
                </div>

                <div className="relative z-10 w-full md:w-auto shrink-0">
                    <Link href="/auth" className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-4 bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0B0F19] rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-[0_5px_20px_rgba(251,191,36,0.15)] active:scale-95">
                       Ücretsiz Harita Çıkar <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </motion.div>

      </main>
    </div>
  );
}