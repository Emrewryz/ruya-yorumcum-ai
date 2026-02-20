"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2, Zap, Hash, Compass, Quote } from "lucide-react";
import { explainNumbers } from "@/app/actions/explain-numerology";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

function DreamNumerologyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const dreamId = searchParams.get('dreamId');
  const numbersParam = searchParams.get('numbers');
  const numbers = numbersParam ? numbersParam.split(',').map(Number) : [];

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Sayfa açıldığında daha önce analiz var mı kontrol et
  useEffect(() => {
    if(!dreamId) return;
    const checkExisting = async () => {
        const { data } = await supabase.from('numerology_reports').select('analysis').eq('dream_id', dreamId).single();
        if(data) setResult(data.analysis);
    };
    checkExisting();
  }, [dreamId]);

  const handleAnalysis = async () => {
    if (!dreamId || numbers.length === 0) return;
    setLoading(true);
    const res = await explainNumbers(numbers, dreamId);
    
    if (res.success) {
      setResult(res.data);
      toast.success("Kozmik Bağlantı Çözüldü!");
    } else {
      toast.error(res.error || "Hata oluştu");
    }
    setLoading(false);
  };

  if (!dreamId) return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
       <Hash className="w-12 h-12 text-slate-600 mb-4" />
       <p className="text-slate-400 font-serif text-lg">Rüya verisi bulunamadı.</p>
       <button onClick={() => router.push('/dashboard/numeroloji')} className="mt-4 text-indigo-400 text-sm hover:text-indigo-300">Numeroloji Merkezine Dön</button>
    </div>
  );

  return (
    // İÇ İÇE GEÇMEYİ ENGELLEYEN YENİ LAYOUT (Sidebar'sız, relative ve layout.tsx'e tam oturan yapı)
    <div className="relative w-full flex flex-col items-center min-h-[calc(100vh-6rem)] z-10 pb-20 font-sans selection:bg-indigo-500/30">
      
      {/* LOKAL ARKAPLAN EFEKTLERİ */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent pointer-events-none -z-10 transform-gpu"></div>

      {/* HEADER */}
      <div className="w-full max-w-[1200px] px-4 md:px-0 py-6 flex flex-col items-start mt-2 md:mt-4">
        <button 
           onClick={() => router.back()} 
           className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-bold text-slate-300 hover:text-white uppercase tracking-widest backdrop-blur-md mb-8 transform-gpu"
        >
          <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">Geri Dön</span>
        </button>
      </div>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-0 relative z-10 flex flex-col">
        <AnimatePresence mode="wait">
          {result ? (
            // --- 1. GÖRÜNÜM: ANALİZ SONUCU ---
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
                <div className="bg-[#131722]/90 backdrop-blur-2xl border border-white/5 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden transform-gpu">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>
                   
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-white/5 pb-8 relative z-10">
                      <div>
                         <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                            <Sparkles className="w-3 h-3" /> Numerolojik Uyum
                         </div>
                         <h2 className="text-3xl md:text-4xl font-serif text-white leading-tight">
                            Rüya & Yaşam Yolu
                         </h2>
                      </div>
                      <div className="w-16 h-16 bg-[#0a0c10] border border-white/10 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                         <Hash className="w-8 h-8 text-indigo-500/50" />
                      </div>
                   </div>

                   <div className="space-y-4 relative z-10">
                      {/* Sayı Kartları */}
                      {result.numbers?.map((item: any, i: number) => (
                          <motion.div 
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                            key={i} 
                            className="bg-[#0a0c10] p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-5 md:gap-6 hover:border-indigo-500/30 transition-colors group"
                          >
                              <div className="w-16 h-16 shrink-0 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center justify-center text-2xl font-mono font-bold text-indigo-400 group-hover:scale-105 transition-transform shadow-inner">
                                 {item.number}
                              </div>
                              <div className="flex flex-col justify-center">
                                  <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                                  <p className="text-slate-400 text-sm leading-relaxed font-light">{item.meaning}</p>
                              </div>
                          </motion.div>
                      ))}

                      {/* Genel Sentez */}
                      <motion.div 
                         initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                         className="bg-indigo-950/20 p-8 rounded-3xl border border-indigo-500/20 mt-8 relative overflow-hidden"
                      >
                         <Quote className="absolute top-6 right-6 w-20 h-20 text-indigo-500/5 -rotate-12 pointer-events-none" />
                         <h3 className="text-xl font-serif text-indigo-300 mb-4 flex items-center gap-3">
                            <Compass className="w-5 h-5" /> Kozmik Sentez
                         </h3>
                         <p className="text-slate-300 leading-[1.8] font-light text-justify text-sm md:text-base relative z-10">
                            {result.life_analysis}
                         </p>
                      </motion.div>
                   </div>
                </div>
            </motion.div>

          ) : (

            // --- 2. GÖRÜNÜM: BAŞLANGIÇ EKRANI ---
            <motion.div 
               key="empty"
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
               className="w-full max-w-2xl mx-auto text-center py-10 md:py-16"
            >
               <div className="relative inline-block mb-12">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none transform-gpu"></div>
                  
                  {/* Sayıların Görselleşimi */}
                  <div className="relative z-10 flex flex-wrap justify-center gap-4 px-4">
                     {numbers.map((n, i) => (
                        <motion.div 
                           key={i} 
                           initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.1 }}
                           className="w-16 h-20 md:w-20 md:h-24 bg-[#131722]/80 backdrop-blur-xl border border-indigo-500/30 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-mono font-bold text-indigo-300 shadow-[0_10px_30px_rgba(99,102,241,0.2)] overflow-hidden relative group"
                        >
                           <div className="absolute inset-0 bg-indigo-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                           <span className="relative z-10">{n}</span>
                        </motion.div>
                     ))}
                  </div>
               </div>
               
               <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
                 Bu sayılar size ne anlatıyor?
               </h2>
               <p className="text-slate-400 text-sm md:text-base mb-12 leading-relaxed max-w-lg mx-auto font-light">
                 Rüyanızda beliren bu sembolik sayıların, doğum haritanız ve Yaşam Yolu sayınızla olan gizli ilişkisini analiz etmek üzeresiniz.
               </p>

               <button 
                 onClick={handleAnalysis} 
                 disabled={loading}
                 className="w-full md:w-auto px-10 py-4 md:py-5 bg-white hover:bg-slate-200 text-[#0a0c10] font-bold text-sm uppercase tracking-widest rounded-2xl transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100 active:scale-95 mx-auto"
               >
                 {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Zap className="w-5 h-5" />}
                 {loading ? "Evrensel Kayıtlar Taranıyor..." : "Kozmik Uyumu Analiz Et (2 Kredi)"}
               </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Suspense Wrapper (useSearchParams için gerekli)
export default function Page() {
  return (
    <Suspense fallback={
       <div className="w-full min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
          <p className="text-slate-500 font-mono text-xs tracking-widest uppercase">Bağlantı Kuruluyor...</p>
       </div>
    }>
      <DreamNumerologyContent />
    </Suspense>
  );
}