"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Hash, Star, Compass, Loader2 } from "lucide-react";
import { explainNumbers } from "@/app/actions/explain-numerology";

interface NumerologyItem {
  number: number;
  title: string;
  meaning: string;
}

export default function NumerologyPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [dreamDate, setDreamDate] = useState<string | null>(null);
  const [luckyNumbers, setLuckyNumbers] = useState<number[]>([]);
  
  // Veriler
  const [explanations, setExplanations] = useState<NumerologyItem[]>([]);
  const [lifeAnalysis, setLifeAnalysis] = useState<string>("");

  useEffect(() => {
    const initData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/auth'); return; }

        const { data: lastDream } = await supabase
          .from('dreams')
          .select('id, ai_response, created_at') 
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (lastDream && lastDream.ai_response?.lucky_numbers) {
          const numbers = lastDream.ai_response.lucky_numbers;
          setLuckyNumbers(numbers);
          setDreamDate(new Date(lastDream.created_at).toLocaleDateString('tr-TR'));

          // Backend'den veriyi al
          const result = await explainNumbers(numbers, lastDream.id);
          
          if (result.success && result.data) {
            // ÖNEMLİ: Gelen verinin yapısını kontrol ediyoruz
            if (Array.isArray(result.data)) {
               // ESKİ FORMAT (Sadece Array gelirse)
               setExplanations(result.data);
            } else if (result.data.numbers) {
               // YENİ FORMAT (Object gelirse)
               setExplanations(result.data.numbers);
               setLifeAnalysis(result.data.life_analysis || "");
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [router, supabase]);

  return (
    // APP FIX: min-h-[100dvh] ve pb-24
    <div className="min-h-[100dvh] bg-[#020617] text-white relative overflow-x-hidden flex flex-col items-center pb-32">
      
      {/* Arkaplan */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute bottom-[-20%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-amber-600/10 rounded-full blur-[80px] md:blur-[120px]" />
         <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-900/20 rounded-full blur-[80px] md:blur-[100px]" />
         <div className="bg-noise fixed inset-0 opacity-20"></div>
      </div>

      {/* HEADER (Sticky) */}
      <nav className="sticky top-0 z-30 w-full bg-[#020617]/80 backdrop-blur-md border-b border-white/5 px-4 py-3 md:py-6 mb-8 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-all border border-white/5">
          <ArrowLeft className="w-5 h-5 text-gray-300" />
        </button>
        <h1 className="font-serif text-sm md:text-xl tracking-[0.2em] text-[#fbbf24] flex items-center gap-2">
            <Hash className="w-4 h-4" /> SAYILARIN GİZEMİ
        </h1>
        <div className="w-9"></div> {/* Dengeleyici */}
      </nav>

      <div className="w-full max-w-4xl relative z-10 px-4 md:px-6">
        {loading ? (
           <div className="flex flex-col items-center justify-center py-32 md:py-40">
              <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-[#fbbf24] animate-spin mb-6" />
              <p className="text-gray-400 animate-pulse text-sm md:text-base">Sayıların frekansı çözülüyor...</p>
           </div>
        ) : luckyNumbers.length === 0 ? (
           <div className="text-center py-20 px-6 bg-white/5 rounded-3xl border border-white/10 mx-auto max-w-sm">
              <Hash className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-serif text-gray-300">Henüz Bir Sayı Yok</h3>
              <p className="text-gray-500 mt-2 text-sm">Önce bir rüya yorumlatmalısın.</p>
              <button onClick={() => router.push('/dashboard')} className="mt-6 px-8 py-3 bg-purple-600 rounded-full text-sm font-bold shadow-lg shadow-purple-500/20 active:scale-95 transition-transform">
                 Rüya Yorumla
              </button>
           </div>
        ) : (
           <>
              <div className="text-center mb-8 md:mb-12">
                 <span className="inline-block px-3 py-1 md:px-4 md:py-1 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[#fbbf24] text-[10px] md:text-xs font-bold tracking-widest mb-4">
                    SON RÜYANDAN GELEN İŞARETLER • {dreamDate}
                 </span>
                 <h2 className="text-2xl md:text-4xl font-serif text-white leading-tight px-4">
                    Evren Sana Ne Söylüyor?
                 </h2>
              </div>

              {/* 1. KARTLAR */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
                 {explanations.map((item, idx) => (
                    <motion.div 
                       key={idx}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: idx * 0.1 }}
                       className="group relative bg-[#0f172a] border border-white/10 rounded-3xl p-6 md:p-8 shadow-lg active:scale-[0.98] transition-transform duration-200"
                    >
                       <div className="absolute inset-0 bg-gradient-to-br from-[#fbbf24]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
                       <div className="relative z-10 flex flex-col items-center text-center">
                          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-black border border-[#fbbf24]/50 flex items-center justify-center mb-4 md:mb-6 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
                             <span className="text-2xl md:text-3xl font-mono font-bold text-[#fbbf24]">{item.number}</span>
                          </div>
                          <h3 className="text-base md:text-lg font-serif text-white mb-2 md:mb-3 flex items-center gap-2">
                             <Sparkles className="w-4 h-4 text-purple-400" />
                             {item.title}
                          </h3>
                          <p className="text-gray-400 text-sm leading-relaxed font-light">
                             {item.meaning}
                          </p>
                       </div>
                    </motion.div>
                 ))}
              </div>

              {/* 2. HAYAT YOLU SENTEZİ */}
              {lifeAnalysis && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative p-6 md:p-10 rounded-3xl bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border border-indigo-500/30 shadow-2xl overflow-hidden"
                >
                   <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Compass className="w-32 h-32 md:w-40 md:h-40 text-indigo-400" /></div>
                   <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4 md:mb-6">
                         <div className="p-2 md:p-3 rounded-xl bg-indigo-500/20 text-indigo-300"><Star className="w-5 h-5 md:w-6 md:h-6 fill-current" /></div>
                         <h3 className="text-xl md:text-2xl font-serif font-bold text-white">Hayat Yolu Sentezi</h3>
                      </div>
                      <p className="text-gray-300 text-sm md:text-lg leading-relaxed md:leading-loose font-light text-justify">
                         {lifeAnalysis}
                      </p>
                   </div>
                </motion.div>
              )}

              {/* Alt Bilgi */}
              <div className="mt-8 md:mt-12 p-4 md:p-6 bg-white/5 rounded-2xl border border-white/5 flex gap-4 items-start">
                 <Sparkles className="w-5 h-5 text-gray-500 shrink-0 mt-1" />
                 <div>
                    <h4 className="text-white font-bold text-xs md:text-sm mb-1">Bunu Biliyor Muydun?</h4>
                    <p className="text-gray-400 text-[10px] md:text-xs leading-relaxed">
                       Bu sayılar rüyanızdaki sembollerin "Ebcet" değeri ve evrensel numeroloji frekanslarının kişisel hayat hikayenizle harmanlanmasıyla hesaplanmıştır.
                    </p>
                 </div>
              </div>
           </>
        )}
      </div>
    </div>
  );
}