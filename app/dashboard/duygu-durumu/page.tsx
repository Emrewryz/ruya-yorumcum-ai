"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Heart, Activity, PieChart, Zap, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// GENİŞLETİLMİŞ RENK PALETİ
const MOOD_COLORS: { [key: string]: string } = {
  "Mutlu": "#10b981",      // Zümrüt Yeşili
  "Huzurlu": "#3b82f6",    // Parlak Mavi
  "Endişeli": "#f59e0b",   // Amber
  "Korku": "#ef4444",      // Kırmızı
  "Karmasik": "#8b5cf6",   // Mor
  "Nötr": "#6b7280",       // Gri
  "Heyecanlı": "#ec4899",  // Pembe
  "Melankolik": "#6366f1", // İndigo
  "Belirsiz": "#a855f7",   // Açık Mor
  "Meraklı": "#06b6d4",    // Turkuaz
  "Hüzünlü": "#374151",    // Koyu Gri
  "Öfkeli": "#dc2626",     // Koyu Kırmızı
  "Romantik": "#f43f5e",   // Gül Rengi
  "Yorgun": "#78716c",     // Kahverengi-Gri
  "Umutlu": "#84cc16",     // Limon Yeşili
  "Yalnız": "#1e40af",     // Koyu Mavi
};

const DEFAULT_COLORS = ["#f472b6", "#22d3ee", "#fbbf24", "#a78bfa", "#34d399", "#fb7185"];

export default function MoodPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  
  // Analiz Verileri
  const [averageScore, setAverageScore] = useState(0);
  const [dominantMood, setDominantMood] = useState("Nötr");
  const [chartData, setChartData] = useState<any[]>([]); 
  const [gradientString, setGradientString] = useState(""); 
  const [aiInsight, setAiInsight] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth'); return; }

      const { data: dreams } = await supabase
        .from('dreams')
        .select('ai_response')
        .eq('user_id', user.id)
        .not('ai_response', 'is', null) // GÜVENLİK: Boş analizleri filtrele
        .order('created_at', { ascending: false })
        .limit(50); // Son 50 rüya

      if (dreams && dreams.length > 0) {
        
        // 1. Ortalama Skor
        const totalScore = dreams.reduce((acc, curr) => acc + (curr.ai_response?.mood_score || 50), 0);
        setAverageScore(Math.round(totalScore / dreams.length));

        // 2. En Son Hissiyat
        setDominantMood(dreams[0].ai_response?.mood || "Bilinmiyor");

        // 3. Duygu Dağılımını Hesapla
        const moodCounts: { [key: string]: number } = {};
        
        dreams.forEach(d => {
           const m = d.ai_response?.mood || "Tanımsız";
           moodCounts[m] = (moodCounts[m] || 0) + 1;
        });

        const totalDreams = dreams.length;
        let cumulativePercent = 0;
        let gradientParts = [];
        const processedData = [];
        let colorIndex = 0;

        for (const [mood, count] of Object.entries(moodCounts)) {
           const percent = (count / totalDreams) * 100;
           
           let color = MOOD_COLORS[mood];
           if (!color) {
              color = DEFAULT_COLORS[colorIndex % DEFAULT_COLORS.length];
              colorIndex++;
           }
           
           processedData.push({ mood, percent: Math.round(percent), color, count });

           gradientParts.push(`${color} ${cumulativePercent}% ${cumulativePercent + percent}%`);
           cumulativePercent += percent;
        }

        const sortedData = processedData.sort((a, b) => b.percent - a.percent);
        setChartData(sortedData);
        setGradientString(`conic-gradient(${gradientParts.join(', ')})`);

        // 4. DİNAMİK ANALİZ (Insight)
        const topMood = sortedData[0]?.mood || "Nötr";
        const topScore = sortedData[0]?.percent || 0;
        
        let insight = "";
        if (topMood === "Endişeli" || topMood === "Korku") {
           insight = `Son zamanlarda rüyalarında ${topMood} teması öne çıkıyor (%${topScore}). Bilinçaltın, yüzleşmekten kaçındığın bir konuyu sana hatırlatıyor olabilir. Günlük hayatta kontrol edemediğin durumlara odaklanmak yerine akışa güvenmeyi dene.`;
        } else if (topMood === "Mutlu" || topMood === "Huzurlu" || topMood === "Umutlu") {
           insight = `Harika bir ruhsal dengeye sahipsin! Rüyalarının %${topScore}'u ${topMood} enerjisi taşıyor. Bu dönemde sezgilerin çok güçlü olabilir, yaratıcı projelere başlamak için ideal bir zaman.`;
        } else if (topMood === "Karmasik" || topMood === "Belirsiz") {
           insight = `Zihnin biraz karışık görünüyor (%${topScore} ${topMood}). Hayatında bir karar aşamasında olabilirsin. Rüyalarındaki sembolleri not almak, bu belirsizliği netleştirmene yardımcı olacaktır.`;
        } else {
           insight = `Ruh halin şu aralar ${topMood} ağırlıklı seyrediyor (%${topScore}). Bu duygu, şu anki yaşam döngünde deneyimlemen gereken bir süreç olabilir. Kendine karşı nazik ol ve hislerini bastırma.`;
        }
        setAiInsight(insight);

      }
      setLoading(false);
    };

    fetchData();
  }, [router, supabase]);

  return (
    // APP FIX: min-h-[100dvh] ve pb-24 (mobilde alt bar için boşluk)
    <div className="min-h-[100dvh] bg-[#020617] text-white font-sans relative overflow-x-hidden flex flex-col pb-24 md:pb-32">
      
      {/* Arkaplan */}
      <div className="bg-noise fixed inset-0 opacity-20 pointer-events-none"></div>
      <div className="fixed top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-600/10 rounded-full blur-[100px] md:blur-[150px] pointer-events-none"></div>

      {/* HEADER (Sticky) */}
      <nav className="sticky top-0 z-30 w-full bg-[#020617]/80 backdrop-blur-md border-b border-white/5 px-4 py-3 md:py-6 mb-6 md:mb-8 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-all border border-white/5">
          <ArrowLeft className="w-5 h-5 text-gray-300" />
        </button>
        <h1 className="font-serif text-sm md:text-xl tracking-[0.2em] text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#fbbf24]" /> RUHSAL SPEKTRUM
        </h1>
        <div className="w-9"></div>
      </nav>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-6 relative z-10">
         
         {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
               <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#fbbf24]" />
               <p className="text-sm animate-pulse">Ruhsal veriler işleniyor...</p>
            </div>
         ) : chartData.length === 0 ? (
            <div className="text-center py-20 px-6 bg-white/5 rounded-3xl border border-white/10 mx-auto max-w-sm">
               <Heart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
               <h3 className="text-lg font-bold text-gray-300">Henüz Veri Yok</h3>
               <p className="text-gray-500 mt-2 text-sm">Rüya yorumlattıkça duygu haritan burada oluşacak.</p>
               {/* YENİ SİSTEM BUTONU */}
               <button onClick={() => router.push('/dashboard')} className="mt-6 px-6 py-2 bg-[#fbbf24] rounded-full text-black font-bold text-xs uppercase tracking-wide hover:scale-105 transition-transform active:scale-95">
                  Rüya Analizi Başlat (1 Kredi)
               </button>
            </div>
         ) : (
            <>
               {/* 1. Özet Kartları (MOBİLDE TEK KOLON) */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                  {/* Ruhsal Denge */}
                  <motion.div 
                     initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                     className="p-5 md:p-6 rounded-2xl md:rounded-3xl bg-[#0f172a] border border-white/10 relative overflow-hidden group flex items-center gap-4 md:gap-6"
                  >
                     <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"></div>
                     <div className="p-3 md:p-4 rounded-full bg-blue-500/20 text-blue-400 shrink-0">
                        <Activity className="w-6 h-6 md:w-8 md:h-8" />
                     </div>
                     <div>
                        <div className="text-3xl md:text-4xl font-bold text-white">%{averageScore}</div>
                        <div className="text-[10px] md:text-xs text-blue-200 uppercase tracking-widest">Ruhsal Denge</div>
                     </div>
                  </motion.div>

                  {/* Baskın Frekans */}
                  <motion.div 
                     initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                     className="p-5 md:p-6 rounded-2xl md:rounded-3xl bg-[#0f172a] border border-white/10 relative overflow-hidden group flex items-center gap-4 md:gap-6"
                  >
                     <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent"></div>
                     <div className="p-3 md:p-4 rounded-full bg-purple-500/20 text-purple-400 shrink-0">
                        <Zap className="w-6 h-6 md:w-8 md:h-8" />
                     </div>
                     <div>
                        <div className="text-2xl md:text-3xl font-serif font-bold text-white line-clamp-1">{dominantMood}</div>
                        <div className="text-[10px] md:text-xs text-purple-200 uppercase tracking-widest">Baskın Frekans</div>
                     </div>
                  </motion.div>
               </div>

               {/* 2. Grafik ve Liste */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
                  
                  {/* Grafik */}
                  <motion.div 
                     initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
                     className="md:col-span-1 p-6 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden"
                  >
                     <div className="relative w-40 h-40 md:w-48 md:h-48 group">
                        <div className="absolute inset-0 rounded-full blur-2xl opacity-20 bg-white animate-pulse-slow"></div>
                        
                        {/* Pasta Grafiği */}
                        <div 
                           className="w-full h-full rounded-full transition-all duration-1000 rotate-[-90deg]"
                           style={{ background: gradientString }}
                        ></div>

                        {/* Orta Boşluk */}
                        <div className="absolute inset-3 bg-[#0b0f19] rounded-full flex flex-col items-center justify-center border border-white/5 shadow-inner">
                           <span className="text-gray-400 text-[10px] uppercase tracking-widest">Toplam</span>
                           <span className="text-2xl md:text-3xl font-bold text-white">{chartData.reduce((acc, curr) => acc + curr.count, 0)}</span>
                           <span className="text-gray-500 text-[10px]">Rüya</span>
                        </div>
                     </div>
                  </motion.div>

                  {/* Liste */}
                  <motion.div 
                     initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                     className="md:col-span-2 p-5 md:p-6 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md"
                  >
                     <div className="flex items-center gap-2 mb-4 md:mb-6 text-gray-400">
                        <PieChart className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Duygu Dağılımı</span>
                     </div>
                     
                     <div className="grid grid-cols-1 gap-2 md:gap-3 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-2">
                        {chartData.map((item, i) => (
                           <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 hover:bg-white/5 transition-colors">
                              <div className="flex items-center gap-3">
                                 <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: item.color, color: item.color }}></div>
                                 <span className="text-xs md:text-sm font-medium text-gray-200">{item.mood}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                 <span className="text-[10px] md:text-xs text-gray-500">{item.count} adet</span>
                                 <span className="text-[10px] md:text-xs font-bold text-black px-2 py-0.5 rounded-md min-w-[35px] text-center" style={{ backgroundColor: item.color }}>%{item.percent}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </motion.div>
               </div>

               {/* 3. Kişisel Analiz */}
               <motion.div 
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                  className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-gradient-to-r from-[#1e1b4b] to-[#0f172a] border border-[#8b5cf6]/30 relative overflow-hidden group shadow-lg"
               >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                     <Sparkles className="w-24 h-24 md:w-32 md:h-32 text-[#8b5cf6]" />
                  </div>
                  
                  <div className="relative z-10">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-[#8b5cf6]/20 text-[#8b5cf6]">
                           <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <h3 className="font-serif text-base md:text-lg font-bold text-white">Ruhsal Harita Analizi</h3>
                     </div>
                     
                     <p className="text-gray-300 leading-relaxed text-sm md:text-lg font-light text-justify">
                        {aiInsight}
                     </p>
                  </div>
               </motion.div>

            </>
         )}

      </main>
    </div>
  );
}