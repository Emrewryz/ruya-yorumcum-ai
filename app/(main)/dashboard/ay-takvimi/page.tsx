"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Moon, Sparkles, CloudFog, Star, ChevronDown } from "lucide-react";
import { getMoonPhase, getNextDaysPhases, MoonPhase } from "@/utils/moon";
import { motion } from "framer-motion";

export default function MoonCalendarPage() {
  const router = useRouter();
  const [currentMoon, setCurrentMoon] = useState<MoonPhase | null>(null);
  const [nextDays, setNextDays] = useState<MoonPhase[]>([]);
  const [today, setToday] = useState("");

  useEffect(() => {
    // 1. Bugünün verisi
    const phase = getMoonPhase();
    setCurrentMoon(phase);

    // 2. Gelecek 14 günün verisi
    const forecast = getNextDaysPhases(14);
    setNextDays(forecast);

    // 3. Tarih
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setToday(new Date().toLocaleDateString('tr-TR', dateOptions));
  }, []);

  if (!currentMoon) return null;

  return (
    // İÇ İÇE GEÇMEYİ ENGELLEYEN YENİ LAYOUT (Sidebar'sız, relative ve layout.tsx'e tam oturan yapı)
    <div className="relative w-full flex flex-col items-center min-h-[calc(100vh-6rem)] z-10 pb-20 font-sans selection:bg-amber-500/30">
      
      {/* LOKAL ARKAPLAN EFEKTLERİ (Performans dostu, fixed değil absolute) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent pointer-events-none -z-10 transform-gpu"></div>

      {/* HEADER VE GERİ DÖN BUTONU */}
      <div className="w-full max-w-[1200px] px-4 md:px-0 py-6 flex items-center justify-between mt-2 md:mt-4 z-30">
        <button 
           onClick={() => router.back()} 
           className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-bold text-slate-300 hover:text-white uppercase tracking-widest backdrop-blur-md transform-gpu"
        >
          <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">Geri Dön</span>
        </button>

        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#131722]/80 backdrop-blur-md rounded-xl border border-white/5 shadow-sm transform-gpu">
           <Moon className="w-4 h-4 text-amber-500" />
           <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-white">Göksel Rehber</span>
        </div>
      </div>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-0 relative z-10 text-center flex flex-col">
         
         {/* ANA GÖRSEL (BÜYÜK AY) */}
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0a0c10] border border-white/5 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest shadow-inner">
               <Calendar className="w-3.5 h-3.5 text-amber-500/70" /> {today}
            </div>

            <div className="relative w-48 h-48 md:w-80 md:h-80 mx-auto my-8 md:my-10 flex items-center justify-center group">
               {/* Arkadaki sabit parlama (Kasmayı önlemek için pulse kaldırıldı) */}
               <div className="absolute inset-0 bg-amber-500/20 blur-[60px] md:blur-[100px] rounded-full transform-gpu pointer-events-none transition-opacity duration-700 group-hover:opacity-40"></div>
               
               {/* Dev Ay İkonu */}
               <div className="text-[120px] md:text-[220px] leading-none select-none filter drop-shadow-[0_0_40px_rgba(251,191,36,0.2)] transform group-hover:scale-105 transition-transform duration-1000">
                  {currentMoon.icon}
               </div>
               
               {/* Dekoratif İnce Yörüngeler */}
               <div className="absolute inset-0 border border-white/5 rounded-full scale-125 md:scale-[1.35] pointer-events-none"></div>
               <div className="absolute inset-0 border border-white/5 rounded-full scale-110 md:scale-[1.15] border-dashed opacity-50 pointer-events-none"></div>
            </div>

            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 px-4">
               {currentMoon.phase}
            </h2>
            
            <p className="text-sm md:text-lg text-amber-400/80 font-light mb-10 md:mb-16 max-w-2xl mx-auto italic leading-relaxed px-4">
               "{currentMoon.description}"
            </p>
         </motion.div>

         {/* DETAY KARTLARI (Bento Style) */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 text-left mb-16"
         >
            {/* Rüyalara Etkisi */}
            <div className="p-6 md:p-8 rounded-[2rem] bg-[#131722]/80 backdrop-blur-xl border border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-all shadow-xl">
               <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-purple-500/10 transition-colors transform-gpu"></div>
               
               <div className="flex items-center gap-3 mb-5 relative z-10">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shadow-inner">
                     <CloudFog className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg md:text-xl text-white">Rüyalara Etkisi</h3>
               </div>
               <p className="text-slate-400 text-sm leading-relaxed font-light relative z-10">
                  {currentMoon.dreamEffect}
               </p>
            </div>

            {/* Enerji Durumu */}
            <div className="p-6 md:p-8 rounded-[2rem] bg-[#131722]/80 backdrop-blur-xl border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition-all shadow-xl flex flex-col justify-between">
               <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-amber-500/10 transition-colors transform-gpu"></div>
               
               <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-inner">
                     <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg md:text-xl text-white">Enerji Seviyesi</h3>
               </div>
               
               <div className="space-y-4 relative z-10 mt-auto">
                  <div>
                     <div className="flex justify-between text-xs md:text-sm mb-2 font-bold tracking-widest uppercase">
                        <span className="text-slate-500">Aydınlanma</span>
                        <span className="text-amber-400">%{currentMoon.percentage}</span>
                     </div>
                     <div className="w-full h-1.5 md:h-2 bg-[#0a0c10] rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-amber-500" style={{ width: `${currentMoon.percentage}%` }}></div>
                     </div>
                  </div>
                  <p className="text-[10px] md:text-xs text-slate-500 font-mono uppercase tracking-widest text-right">
                     Ayın {currentMoon.age}. Günü
                  </p>
               </div>
            </div>
         </motion.div>

         {/* GELECEK GÜNLER (FORECAST) */}
         <motion.div 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="border-t border-white/5 pt-10 md:pt-14"
         >
             <div className="flex flex-col items-center justify-center gap-3 mb-8 md:mb-10 text-slate-400">
                <span className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-white">Gelecek Döngü</span>
                <ChevronDown className="w-4 h-4 animate-bounce text-amber-500" />
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {nextDays.map((day, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 md:p-5 rounded-2xl bg-[#0a0c10] border border-white/5 hover:border-white/10 transition-colors group">
                        <div className="text-3xl md:text-4xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform">
                           {day.icon}
                        </div>
                        <div className="flex-1 text-left">
                           <div className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-widest mb-0.5">{day.date}</div>
                           <div className="text-white font-serif text-sm md:text-base">{day.phase}</div>
                        </div>
                        <div className="text-right w-16">
                             <div className="text-[10px] md:text-xs text-amber-500/80 font-bold mb-1">%{day.percentage}</div>
                             <div className="w-full h-1 bg-[#131722] rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500" style={{ width: `${day.percentage}%` }}></div>
                             </div>
                        </div>
                    </div>
                ))}
             </div>
         </motion.div>

      </main>
    </div>
  );
}