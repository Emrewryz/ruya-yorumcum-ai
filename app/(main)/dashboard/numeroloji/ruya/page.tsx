"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Hash, Binary, ArrowRight, Sparkles, 
  Crown, Star, Fingerprint, Lock, Zap, ArrowLeft, Loader2, Compass, Quote
} from "lucide-react";
import { explainNumbers } from "@/app/actions/explain-numerology";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

// İçerik Bileşeni
function DreamNumerologyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  // URL'den parametreleri al
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
  }, [dreamId, supabase]);

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
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-center px-4 bg-[#faf9f6] dark:bg-transparent transition-colors duration-500">
       <Hash className="w-12 h-12 text-stone-400 dark:text-slate-600 mb-4 transition-colors" />
       <p className="text-stone-500 dark:text-slate-400 font-serif text-lg transition-colors">Rüya verisi bulunamadı.</p>
       <button onClick={() => router.push('/dashboard/numeroloji')} className="mt-4 text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:text-indigo-500 transition-colors">Numeroloji Merkezine Dön</button>
    </div>
  );

  return (
    // Çift Tema Destekli Ana Kapsayıcı (Light Mode krem, Dark Mode şeffaf)
    <div className="relative w-full flex flex-col items-center min-h-[calc(100vh-6rem)] z-10 pb-20 font-sans selection:bg-indigo-200 dark:selection:bg-indigo-500/30 antialiased transition-colors duration-500">
      
      {/* LOKAL ARKAPLAN IŞIĞI */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/60 dark:from-indigo-900/10 via-transparent to-transparent pointer-events-none -z-10 transition-colors"></div>

      {/* HEADER (Geri Dön) */}
      <div className="w-full max-w-[1200px] px-4 md:px-0 py-6 flex flex-col items-start mt-2 md:mt-4 transition-colors">
        <button 
           onClick={() => router.back()} 
           className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-white/10 transition-colors text-xs font-bold text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white uppercase tracking-widest shadow-sm dark:shadow-none mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">Geri Dön</span>
        </button>
      </div>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-0 relative z-10 flex flex-col">
        <AnimatePresence mode="wait">
          {result ? (
            
            // ================= 1. GÖRÜNÜM: ANALİZ SONUCU =================
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
                <div className="bg-white dark:bg-[#131722]/90 dark:backdrop-blur-2xl border border-stone-200 dark:border-white/5 p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-lg dark:shadow-2xl relative overflow-hidden transition-colors">
                   
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 dark:bg-indigo-500/5 rounded-full blur-[60px] dark:blur-[80px] pointer-events-none transition-colors"></div>
                   
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10 border-b border-stone-100 dark:border-white/5 pb-8 relative z-10 transition-colors">
                      <div>
                         <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-4 transition-colors">
                            <Sparkles className="w-3 h-3" /> Numerolojik Uyum
                         </div>
                         <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white leading-tight transition-colors">
                            Rüya & Yaşam Yolu
                         </h2>
                      </div>
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-indigo-50 dark:bg-[#0a0c10] border border-indigo-100 dark:border-white/10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm dark:shadow-inner transition-colors">
                         <Hash className="w-7 h-7 md:w-8 md:h-8 text-indigo-500 dark:text-indigo-500/50 transition-colors" />
                      </div>
                   </div>

                   <div className="space-y-4 relative z-10">
                      
                      {/* Sayı Kartları */}
                      {result.numbers?.map((item: any, i: number) => (
                          <motion.div 
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                            key={i} 
                            className="bg-stone-50 dark:bg-[#0a0c10] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-stone-200 dark:border-white/5 flex flex-col md:flex-row gap-5 md:gap-6 hover:shadow-md dark:hover:border-indigo-500/30 transition-all group"
                          >
                              <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 bg-white dark:bg-indigo-500/10 rounded-2xl md:rounded-xl border border-stone-200 dark:border-indigo-500/20 flex items-center justify-center text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform shadow-sm dark:shadow-inner">
                                 {item.number}
                              </div>
                              <div className="flex flex-col justify-center">
                                  <h4 className="text-xl font-serif font-bold text-stone-900 dark:text-white mb-2 transition-colors">{item.title}</h4>
                                  <p className="text-stone-600 dark:text-slate-400 text-sm md:text-base leading-[1.8] font-light transition-colors">{item.meaning}</p>
                              </div>
                          </motion.div>
                      ))}

                      {/* Genel Sentez */}
                      <motion.div 
                         initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                         className="bg-indigo-50/50 dark:bg-indigo-950/20 p-8 md:p-10 rounded-[1.5rem] md:rounded-[2rem] border border-indigo-100 dark:border-indigo-500/20 mt-8 relative overflow-hidden transition-colors shadow-sm dark:shadow-none"
                      >
                         <Quote className="absolute top-6 right-6 w-20 h-20 text-indigo-200 dark:text-indigo-500/5 -rotate-12 pointer-events-none transition-colors" />
                         <h3 className="text-xl font-serif font-bold text-indigo-900 dark:text-indigo-300 mb-6 flex items-center gap-3 transition-colors">
                            <div className="p-2 bg-indigo-100 dark:bg-transparent rounded-xl border border-indigo-200 dark:border-none transition-colors">
                               <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> 
                            </div>
                            Kozmik Sentez
                         </h3>
                         <p className="text-stone-700 dark:text-slate-300 leading-[1.8] font-light text-justify text-sm md:text-base relative z-10 transition-colors">
                            {result.life_analysis}
                         </p>
                      </motion.div>
                   </div>
                </div>
            </motion.div>

          ) : (

            // ================= 2. GÖRÜNÜM: BAŞLANGIÇ EKRANI =================
            <motion.div 
               key="empty"
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
               className="w-full max-w-2xl mx-auto text-center py-10 md:py-16"
            >
               <div className="relative inline-block mb-12">
                  <div className="absolute inset-0 bg-indigo-100/80 dark:bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none transition-colors"></div>
                  
                  {/* Sayıların Görselleşimi (Responsive ve Temaya Uyumlu) */}
                  <div className="relative z-10 flex flex-wrap justify-center gap-3 md:gap-4 px-4">
                     {numbers.map((n, i) => (
                        <motion.div 
                           key={i} 
                           initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.1 }}
                           className="w-14 h-20 md:w-20 md:h-24 bg-white dark:bg-[#131722]/80 dark:backdrop-blur-xl border border-stone-200 dark:border-indigo-500/30 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-mono font-bold text-indigo-600 dark:text-indigo-300 shadow-md dark:shadow-[0_10px_30px_rgba(99,102,241,0.2)] overflow-hidden relative group transition-colors"
                        >
                           <div className="absolute inset-0 bg-indigo-50 dark:bg-indigo-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                           <span className="relative z-10">{n}</span>
                        </motion.div>
                     ))}
                  </div>
               </div>
               
               <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white mb-4 transition-colors">
                 Bu sayılar size ne anlatıyor?
               </h2>
               <p className="text-stone-500 dark:text-slate-400 text-sm md:text-base mb-12 leading-relaxed max-w-lg mx-auto font-light transition-colors">
                 Rüyanızda beliren bu sembolik sayıların, doğum haritanız ve Yaşam Yolu sayınızla olan gizli ilişkisini analiz etmek üzeresiniz.
               </p>

               <button 
                 onClick={handleAnalysis} 
                 disabled={loading}
                 className="w-full md:w-auto px-10 py-4 md:py-5 bg-indigo-600 dark:bg-white hover:bg-indigo-700 dark:hover:bg-slate-200 text-white dark:text-[#0a0c10] font-bold text-sm uppercase tracking-widest rounded-full md:rounded-2xl transition-all shadow-md dark:shadow-[0_10px_30px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100 active:scale-95 mx-auto"
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
       <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-[#faf9f6] dark:bg-transparent transition-colors duration-500">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
          <p className="text-stone-500 dark:text-slate-500 font-mono text-xs font-bold tracking-widest uppercase transition-colors">Bağlantı Kuruluyor...</p>
       </div>
    }>
      <DreamNumerologyContent />
    </Suspense>
  );
}