"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Hash, Star, Compass } from "lucide-react";
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
               // ESKİ FORMAT (Sadece Array gelirse) -> Kartları doldur, analizi boş geç
               setExplanations(result.data);
            } else if (result.data.numbers) {
               // YENİ FORMAT (Object gelirse) -> Hem kartları hem analizi doldur
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
    <div className="min-h-screen bg-[#020617] text-white p-6 relative overflow-hidden flex flex-col items-center">
      
      {/* Arkaplan */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[120px]" />
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px]" />
      </div>

      <nav className="w-full max-w-4xl flex justify-between items-center mb-12 relative z-10">
        <button onClick={() => router.back()} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-serif text-xl tracking-widest text-[#fbbf24]">SAYILARIN GİZEMİ</h1>
        <div className="w-9"></div>
      </nav>

      <div className="w-full max-w-4xl relative z-10 pb-20">
        {loading ? (
           <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-t-2 border-[#fbbf24] rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400 animate-pulse">Sayıların frekansı çözülüyor...</p>
           </div>
        ) : luckyNumbers.length === 0 ? (
           <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
              <Hash className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-serif text-gray-300">Henüz Bir Sayı Yok</h3>
              <p className="text-gray-500 mt-2">Önce bir rüya yorumlatmalısın.</p>
              <button onClick={() => router.push('/dashboard')} className="mt-6 px-6 py-2 bg-purple-600 rounded-full text-sm font-bold">Rüya Yorumla</button>
           </div>
        ) : (
           <>
              <div className="text-center mb-12">
                 <span className="inline-block px-4 py-1 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[#fbbf24] text-xs font-bold tracking-widest mb-4">
                    SON RÜYANDAN GELEN İŞARETLER • {dreamDate}
                 </span>
                 <h2 className="text-3xl md:text-4xl font-serif text-white leading-tight">
                    Evren Sana Ne Söylüyor?
                 </h2>
              </div>

              {/* 1. KARTLAR (Her durumda gösterilir) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                 {explanations.map((item, idx) => (
                    <motion.div 
                       key={idx}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: idx * 0.1 }}
                       className="group relative bg-[#0f172a] border border-white/10 rounded-3xl p-8 hover:border-[#fbbf24]/30 transition-all duration-300 hover:-translate-y-1 h-full"
                    >
                       <div className="absolute inset-0 bg-gradient-to-br from-[#fbbf24]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
                       <div className="relative z-10 flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-2xl bg-black border border-[#fbbf24]/50 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(251,191,36,0.15)] group-hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] transition-shadow">
                             <span className="text-3xl font-mono font-bold text-[#fbbf24]">{item.number}</span>
                          </div>
                          <h3 className="text-lg font-serif text-white mb-3 flex items-center gap-2">
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

              {/* 2. HAYAT YOLU SENTEZİ (Sadece yeni verilerde gösterilir) */}
              {lifeAnalysis && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border border-indigo-500/30 shadow-2xl overflow-hidden"
                >
                   <div className="absolute top-0 right-0 p-8 opacity-10"><Compass className="w-40 h-40 text-indigo-400" /></div>
                   <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-300"><Star className="w-6 h-6 fill-current" /></div>
                         <h3 className="text-2xl font-serif font-bold text-white">Hayat Yolu Sentezi</h3>
                      </div>
                      <p className="text-gray-300 text-lg leading-loose font-light text-justify">
                         {lifeAnalysis}
                      </p>
                   </div>
                </motion.div>
              )}

              {/* Alt Bilgi */}
              <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/5 flex gap-4 items-start">
                 <Sparkles className="w-5 h-5 text-gray-500 shrink-0 mt-1" />
                 <div>
                    <h4 className="text-white font-bold text-sm mb-1">Bunu Biliyor Muydun?</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">
                       Bu sayılar rüyanızdaki sembollerin "Ebcet" değeri ve evrensel numeroloji frekanslarının kişisel hayat hikayenizle (Bio) harmanlanmasıyla hesaplanmıştır.
                    </p>
                 </div>
              </div>
           </>
        )}
      </div>
    </div>
  );
}