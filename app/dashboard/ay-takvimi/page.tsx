"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Moon, Sparkles, CloudFog, Star, ArrowDown } from "lucide-react";
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
    <div className="min-h-screen bg-[#020617] text-white font-sans relative overflow-x-hidden flex flex-col items-center">
      
      {/* Atmosfer */}
      <div className="bg-noise"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#fbbf24]/10 blur-[150px] rounded-full pointer-events-none"></div>

      {/* Navigasyon */}
      <nav className="w-full max-w-4xl mx-auto px-6 py-8 flex items-center justify-between relative z-20">
         <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" /> <span>Geri Dön</span>
         </button>
         <h1 className="font-serif text-lg font-bold text-[#fbbf24]">Göksel Rehber</h1>
      </nav>

      {/* Ana Görsel (Büyük Ay) */}
      <main className="w-full max-w-4xl px-6 relative z-10 text-center mt-4 pb-20">
         
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <Calendar className="w-3 h-3" /> {today}
            </div>

            <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto my-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-[#fbbf24] blur-[80px] opacity-20 animate-pulse-slow"></div>
                <div className="text-[150px] md:text-[200px] leading-none select-none filter drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] transform hover:scale-105 transition-transform duration-700">
                {currentMoon.icon}
                </div>
                {/* Dekoratif Yörüngeler */}
                <div className="absolute inset-0 border border-white/5 rounded-full scale-150 animate-spin-slow-reverse"></div>
                <div className="absolute inset-0 border border-white/5 rounded-full scale-125 border-dashed animate-spin-slow"></div>
            </div>

            <h2 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                {currentMoon.phase}
            </h2>
            
            <p className="text-lg md:text-xl text-[#fbbf24] font-medium mb-12 max-w-2xl mx-auto italic leading-relaxed">
                "{currentMoon.description}"
            </p>
         </motion.div>

         {/* Detay Kartları */}
         <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 gap-6 text-left mb-20"
         >
            {/* Rüyalara Etkisi */}
            <div className="p-8 rounded-3xl bg-[#0f172a] border border-[#8b5cf6]/30 hover:border-[#8b5cf6] transition-colors relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <CloudFog className="w-24 h-24 text-[#8b5cf6]" />
               </div>
               <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-[#8b5cf6]/20 text-[#8b5cf6]">
                     <Moon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-white">Rüyalara Etkisi</h3>
               </div>
               <p className="text-gray-400 leading-relaxed">
                  {currentMoon.dreamEffect}
               </p>
            </div>

            {/* Enerji Durumu */}
            <div className="p-8 rounded-3xl bg-[#0f172a] border border-[#fbbf24]/30 hover:border-[#fbbf24] transition-colors relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Star className="w-24 h-24 text-[#fbbf24]" />
               </div>
               <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-[#fbbf24]/20 text-[#fbbf24]">
                     <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-white">Enerji Seviyesi</h3>
               </div>
               
               <div className="space-y-4">
                  <div>
                     <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Aydınlanma</span>
                        <span className="text-white font-bold">%{currentMoon.percentage}</span>
                     </div>
                     <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#fbbf24]" style={{ width: `${currentMoon.percentage}%` }}></div>
                     </div>
                  </div>
                  <p className="text-sm text-gray-500 italic">
                     Ayın {currentMoon.age}. günü.
                  </p>
               </div>
            </div>
         </motion.div>

         {/* GELECEK GÜNLER (FORECAST) */}
         <motion.div 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="border-t border-white/10 pt-12"
         >
             <div className="flex items-center justify-center gap-2 mb-8 text-gray-400">
                <ArrowDown className="w-4 h-4 animate-bounce" />
                <span className="text-sm font-bold uppercase tracking-widest">Gelecek Döngü</span>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nextDays.map((day, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="text-3xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                            {day.icon}
                        </div>
                        <div className="flex-1 text-left">
                            <div className="text-[#fbbf24] font-bold text-sm">{day.date}</div>
                            <div className="text-white font-serif text-lg">{day.phase}</div>
                        </div>
                        <div className="text-right">
                             <div className="text-xs text-gray-500 font-bold">%{day.percentage}</div>
                             <div className="w-12 h-1 bg-gray-800 rounded-full mt-1 overflow-hidden">
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