"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Moon, Sparkles, CloudFog, Star, ArrowDown, ChevronDown } from "lucide-react";
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
    // APP FIX: min-h-[100dvh] ve pb-24 (Mobil menü payı)
    <div className="min-h-[100dvh] bg-[#020617] text-white font-sans relative overflow-x-hidden flex flex-col items-center pb-24 md:pb-32">
      
      {/* Atmosfer */}
      <div className="bg-noise fixed inset-0 opacity-20 pointer-events-none"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#fbbf24]/10 blur-[100px] md:blur-[150px] rounded-full pointer-events-none"></div>

      {/* HEADER (Sticky) */}
      <nav className="sticky top-0 z-30 w-full bg-[#020617]/80 backdrop-blur-md border-b border-white/5 px-4 py-3 md:py-6 mb-6 md:mb-8 flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-all border border-white/5"
        >
          <ArrowLeft className="w-5 h-5 text-gray-300" />
        </button>
        <h1 className="font-serif text-sm md:text-xl tracking-[0.2em] text-[#fbbf24] flex items-center gap-2">
            <Moon className="w-4 h-4" /> GÖKSEL REHBER
        </h1>
        <div className="w-9"></div> {/* Dengeleyici */}
      </nav>

      {/* Ana Görsel (Büyük Ay) */}
      <main className="w-full max-w-4xl px-4 md:px-6 relative z-10 text-center">
         
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest backdrop-blur-md">
               <Calendar className="w-3 h-3" /> {today}
            </div>

            <div className="relative w-40 h-40 md:w-80 md:h-80 mx-auto my-6 md:my-10 flex items-center justify-center">
               <div className="absolute inset-0 bg-[#fbbf24] blur-[50px] md:blur-[80px] opacity-20 animate-pulse-slow"></div>
               {/* MOBİL: text-[100px], DESKTOP: text-[200px] */}
               <div className="text-[100px] md:text-[200px] leading-none select-none filter drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] transform hover:scale-105 transition-transform duration-700">
               {currentMoon.icon}
               </div>
               {/* Dekoratif Yörüngeler */}
               <div className="absolute inset-0 border border-white/5 rounded-full scale-125 md:scale-150 animate-spin-slow-reverse pointer-events-none"></div>
               <div className="absolute inset-0 border border-white/5 rounded-full scale-110 md:scale-125 border-dashed animate-spin-slow pointer-events-none"></div>
            </div>

            <h2 className="text-2xl md:text-6xl font-serif font-bold text-white mb-3 md:mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 px-4">
               {currentMoon.phase}
            </h2>
            
            <p className="text-sm md:text-xl text-[#fbbf24] font-medium mb-8 md:mb-12 max-w-2xl mx-auto italic leading-relaxed px-4">
               "{currentMoon.description}"
            </p>
         </motion.div>

         {/* Detay Kartları (MOBİLDE TEK KOLON) */}
         <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-left mb-12 md:mb-16"
         >
            {/* Rüyalara Etkisi */}
            <div className="p-5 md:p-8 rounded-2xl md:rounded-3xl bg-[#0f172a] border border-[#8b5cf6]/30 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <CloudFog className="w-16 h-16 md:w-24 md:h-24 text-[#8b5cf6]" />
               </div>
               <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <div className="p-2 rounded-lg bg-[#8b5cf6]/20 text-[#8b5cf6]">
                     <Moon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <h3 className="font-bold text-base md:text-lg text-white">Rüyalara Etkisi</h3>
               </div>
               <p className="text-gray-400 text-xs md:text-base leading-relaxed">
                  {currentMoon.dreamEffect}
               </p>
            </div>

            {/* Enerji Durumu */}
            <div className="p-5 md:p-8 rounded-2xl md:rounded-3xl bg-[#0f172a] border border-[#fbbf24]/30 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Star className="w-16 h-16 md:w-24 md:h-24 text-[#fbbf24]" />
               </div>
               <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <div className="p-2 rounded-lg bg-[#fbbf24]/20 text-[#fbbf24]">
                     <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <h3 className="font-bold text-base md:text-lg text-white">Enerji Seviyesi</h3>
               </div>
               
               <div className="space-y-3 md:space-y-4">
                  <div>
                     <div className="flex justify-between text-xs md:text-sm mb-1">
                        <span className="text-gray-400">Aydınlanma</span>
                        <span className="text-white font-bold">%{currentMoon.percentage}</span>
                     </div>
                     <div className="w-full h-1.5 md:h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#fbbf24]" style={{ width: `${currentMoon.percentage}%` }}></div>
                     </div>
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 italic">
                     Ayın {currentMoon.age}. günü.
                  </p>
               </div>
            </div>
         </motion.div>

         {/* GELECEK GÜNLER (FORECAST) */}
         <motion.div 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="border-t border-white/10 pt-8 md:pt-12"
         >
             <div className="flex items-center justify-center gap-2 mb-6 md:mb-8 text-gray-400">
                <ChevronDown className="w-4 h-4 animate-bounce" />
                <span className="text-xs md:text-sm font-bold uppercase tracking-widest">Gelecek Döngü</span>
             </div>

             <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                {nextDays.map((day, i) => (
                    <div key={i} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="text-2xl md:text-3xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                           {day.icon}
                        </div>
                        <div className="flex-1 text-left">
                           <div className="text-[#fbbf24] font-bold text-[10px] md:text-sm">{day.date}</div>
                           <div className="text-white font-serif text-sm md:text-lg">{day.phase}</div>
                        </div>
                        <div className="text-right">
                             <div className="text-[10px] md:text-xs text-gray-500 font-bold">%{day.percentage}</div>
                             <div className="w-10 md:w-12 h-1 bg-gray-800 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-[#fbbf24]" style={{ width: `${day.percentage}%` }}></div>
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