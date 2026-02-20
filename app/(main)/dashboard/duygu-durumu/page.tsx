"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Heart, Activity, PieChart, Zap, Sparkles, Loader2, BarChart3, Quote } from "lucide-react";
import { motion } from "framer-motion";

// GENİŞLETİLMİŞ RENK PALETİ (Daha soft ve premium tonlar)
const MOOD_COLORS: { [key: string]: string } = {
  "Mutlu": "#10b981",      // Zümrüt Yeşili
  "Huzurlu": "#3b82f6",    // Parlak Mavi
  "Endişeli": "#f59e0b",   // Amber
  "Korku": "#ef4444",      // Kırmızı
  "Karmasik": "#8b5cf6",   // Mor
  "Nötr": "#94a3b8",       // Gri (Açıklaştırıldı)
  "Heyecanlı": "#ec4899",  // Pembe
  "Melankolik": "#6366f1", // İndigo
  "Belirsiz": "#a855f7",   // Açık Mor
  "Meraklı": "#06b6d4",    // Turkuaz
  "Hüzünlü": "#4b5563",    // Koyu Gri
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
    <div className="relative w-full flex flex-col items-center min-h-[calc(100vh-6rem)] z-10 pb-20 font-sans selection:bg-rose-500/30">
      
      {/* LOKAL ARKAPLAN EFEKTLERİ (GPU Hızlandırması Eklendi) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-900/10 via-transparent to-transparent pointer-events-none -z-10 transform-gpu"></div>
      
      {/* HEADER */}
      <div className="w-full max-w-[1200px] px-4 md:px-0 py-6 flex items-center justify-between mt-2 md:mt-4">
        <button 
           onClick={() => router.back()} 
           className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-bold text-slate-300 hover:text-white uppercase tracking-widest backdrop-blur-md transform-gpu"
        >
          <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">Geri Dön</span>
        </button>
        
        <div className="flex items-center gap-3 bg-[#131722]/80 backdrop-blur-md border border-white/5 px-5 py-2.5 rounded-xl shadow-sm transform-gpu">
            <Activity className="w-4 h-4 text-rose-400" />
            <span className="text-[10px] md:text-xs text-white font-bold uppercase tracking-widest">Ruhsal Spektrum</span>
        </div>
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-0 pt-4 md:pt-6 relative z-10 flex flex-col">
         
         {loading ? (
            <div className="flex flex-col items-center justify-center py-32 w-full">
               <Loader2 className="w-10 h-10 animate-spin mb-4 text-rose-500" />
               <p className="text-sm font-mono uppercase tracking-widest text-slate-400 animate-pulse">Ruhsal veriler işleniyor...</p>
            </div>
         ) : chartData.length === 0 ? (
            <motion.div 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
               className="text-center py-20 px-8 bg-[#131722]/80 backdrop-blur-xl rounded-[2.5rem] border border-white/5 mx-auto max-w-lg mt-10 shadow-2xl transform-gpu"
            >
               <div className="w-20 h-20 bg-[#0a0c10] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/5 rotate-3">
                   <Heart className="w-8 h-8 text-rose-500/50" />
               </div>
               <h3 className="text-2xl font-serif text-white mb-2">Henüz Veri Yok</h3>
               <p className="text-slate-400 text-sm leading-relaxed mb-8">Rüya yorumlattıkça bilinçaltınızın duygu haritası burada şekillenecektir.</p>
               <button 
                  onClick={() => router.push('/dashboard')} 
                  className="px-8 py-4 bg-white text-[#0a0c10] rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all shadow-[0_10px_20px_rgba(255,255,255,0.1)] flex items-center gap-2 mx-auto will-change-transform"
               >
                  <Sparkles className="w-4 h-4" /> Rüya Analizi Başlat
               </button>
            </motion.div>
         ) : (
            <div className="w-full">
               
               {/* SAYFA BAŞLIĞI */}
               <div className="mb-10 md:mb-12">
                   <h1 className="text-4xl md:text-5xl font-serif text-white mb-3">Duygu Haritanız</h1>
                   <p className="text-slate-400 font-light text-sm md:text-base">Bilinçaltınızın renkli dünyasını ve baskın frekanslarını keşfedin.</p>
               </div>

               {/* 1. ÖZET KARTLARI (Bento Style) */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-6 md:mb-8">
                  {/* Ruhsal Denge */}
                  <motion.div 
                     initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                     className="p-6 md:p-8 rounded-[2rem] bg-[#131722] border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-lg flex items-center justify-between transform-gpu will-change-transform"
                  >
                     <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-blue-500/10 transition-colors transform-gpu"></div>
                     <div>
                        <div className="flex items-center gap-2 mb-2">
                           <Activity className="w-4 h-4 text-blue-400" />
                           <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Ruhsal Denge</span>
                        </div>
                        <div className="text-4xl md:text-5xl font-serif font-bold text-white">%{averageScore}</div>
                     </div>
                     <div className="p-4 bg-[#0a0c10] rounded-2xl border border-white/5 shadow-inner relative z-10">
                         <BarChart3 className="w-6 h-6 text-blue-500/50" />
                     </div>
                  </motion.div>

                  {/* Baskın Frekans */}
                  <motion.div 
                     initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                     className="p-6 md:p-8 rounded-[2rem] bg-[#131722] border border-white/5 relative overflow-hidden group hover:border-rose-500/30 transition-all shadow-lg flex items-center justify-between transform-gpu will-change-transform"
                  >
                     <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-rose-500/10 transition-colors transform-gpu"></div>
                     <div>
                        <div className="flex items-center gap-2 mb-2">
                           <Zap className="w-4 h-4 text-rose-400" />
                           <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Baskın Frekans</span>
                        </div>
                        <div className="text-3xl md:text-4xl font-serif font-bold text-white line-clamp-1">{dominantMood}</div>
                     </div>
                     <div className="p-4 bg-[#0a0c10] rounded-2xl border border-white/5 shadow-inner relative z-10">
                         <Heart className="w-6 h-6 text-rose-500/50" />
                     </div>
                  </motion.div>
               </div>

               {/* 2. GRAFİK VE LİSTE (Asimetrik Grid) */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
                  
                  {/* Grafik Kutusu */}
                  <motion.div 
                     initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
                     className="md:col-span-1 p-8 rounded-[2.5rem] bg-[#131722]/60 backdrop-blur-xl border border-white/5 flex flex-col items-center justify-center relative shadow-xl min-h-[300px] transform-gpu"
                  >
                     <div className="relative w-48 h-48 md:w-56 md:h-56 group">
                        {/* Performansı öldüren pulse animasyonu yerine sabit hafif ışıma */}
                        <div className="absolute inset-0 rounded-full blur-[40px] opacity-10 bg-white transform-gpu pointer-events-none"></div>
                        
                        {/* Pasta Grafiği (Donut formu - transition kaldırıldı, kasmayı önler) */}
                        <div 
                           className="w-full h-full rounded-full rotate-[-90deg] shadow-[0_0_30px_rgba(0,0,0,0.5)] transform-gpu"
                           style={{ background: gradientString }}
                        ></div>

                        {/* Orta Boşluk (Donut Delik) */}
                        <div className="absolute inset-4 bg-[#131722] rounded-full flex flex-col items-center justify-center border border-white/5 shadow-inner z-10">
                           <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">Toplam</span>
                           <span className="text-4xl font-serif font-bold text-white leading-none">{chartData.reduce((acc, curr) => acc + curr.count, 0)}</span>
                           <span className="text-slate-400 text-xs mt-1">Rüya</span>
                        </div>
                     </div>
                  </motion.div>

                  {/* Detay Listesi */}
                  <motion.div 
                     initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                     className="md:col-span-2 p-6 md:p-8 rounded-[2.5rem] bg-[#131722]/60 backdrop-blur-xl border border-white/5 shadow-xl transform-gpu"
                  >
                     <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                        <PieChart className="w-5 h-5 text-slate-400" />
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Duygu Dağılımı</span>
                     </div>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] md:max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-2 overscroll-contain">
                        {chartData.map((item, i) => (
                           <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[#0a0c10] border border-white/5 hover:border-white/10 transition-colors group will-change-transform">
                              <div className="flex items-center gap-3">
                                 <div className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] transition-transform group-hover:scale-110" style={{ backgroundColor: item.color, color: item.color }}></div>
                                 <span className="text-sm font-medium text-slate-200">{item.mood}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                 <span className="text-[10px] md:text-xs text-slate-500 font-mono">{item.count} Adet</span>
                                 <span className="text-[10px] font-bold text-[#0a0c10] px-2.5 py-1 rounded-md min-w-[40px] text-center" style={{ backgroundColor: item.color }}>%{item.percent}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </motion.div>
               </div>

               {/* 3. Yapay Zeka Sentezi (Editoryal Kutu) */}
               <motion.div 
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                  className="p-8 md:p-12 rounded-[2.5rem] bg-[#131722]/90 backdrop-blur-2xl border border-white/5 relative overflow-hidden shadow-2xl transform-gpu"
               >
                  {/* Arkadan vuran hafif renk */}
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                     <Quote className="w-32 h-32 text-white -rotate-12" />
                  </div>
                  
                  <div className="relative z-10">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                           <Sparkles className="w-5 h-5 text-purple-400" />
                        </div>
                        <h3 className="font-serif text-xl md:text-2xl text-white">Ruhsal Harita Analizi</h3>
                     </div>
                     
                     <p className="text-slate-300 leading-[1.8] text-base md:text-lg font-light text-justify max-w-4xl">
                        {aiInsight}
                     </p>
                  </div>
               </motion.div>

            </div>
         )}
      </main>
    </div>
  );
}