"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Heart, Activity, PieChart, Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

// GENİŞLETİLMİŞ RENK PALETİ (Daha fazla çeşit)
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

// Varsayılan renkler (Eğer listede yoksa sırayla bunları kullan)
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
  const [aiInsight, setAiInsight] = useState(""); // YENİ: Dinamik Yorum

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: dreams } = await supabase
        .from('dreams')
        .select('ai_response')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50); // Son 50 rüyaya bakıyoruz

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

        // Veriyi işle ve renk ata
        for (const [mood, count] of Object.entries(moodCounts)) {
           const percent = (count / totalDreams) * 100;
           
           // Renk Seçimi: Varsa listeden, yoksa sıradaki varsayılan renkten
           let color = MOOD_COLORS[mood];
           if (!color) {
              color = DEFAULT_COLORS[colorIndex % DEFAULT_COLORS.length];
              colorIndex++;
           }
           
           processedData.push({ mood, percent: Math.round(percent), color, count });

           // CSS Conic Gradient stringini oluştur
           gradientParts.push(`${color} ${cumulativePercent}% ${cumulativePercent + percent}%`);
           cumulativePercent += percent;
        }

        // Büyükten küçüğe sırala
        const sortedData = processedData.sort((a, b) => b.percent - a.percent);
        setChartData(sortedData);
        setGradientString(`conic-gradient(${gradientParts.join(', ')})`);

        // 4. YENİ: DİNAMİK RUHSAL ANALİZ ÜRETİMİ
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
  }, [supabase]);

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans relative overflow-x-hidden p-6">
      
      {/* Arkaplan */}
      <div className="bg-noise"></div>
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Navigasyon */}
      <nav className="max-w-4xl mx-auto mb-12 flex items-center gap-4">
         <button onClick={() => router.back()} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-6 h-6" />
         </button>
         <h1 className="font-serif text-2xl font-bold">Ruhsal Spektrum</h1>
      </nav>

      <main className="max-w-4xl mx-auto">
         
         {loading ? (
            <div className="text-center py-20 text-gray-500 animate-pulse">Ruhsal veriler işleniyor...</div>
         ) : chartData.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
               <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
               <h3 className="text-xl font-bold text-gray-300">Henüz Veri Yok</h3>
               <p className="text-gray-500 mt-2">Rüya yorumlattıkça duygu haritan burada oluşacak.</p>
            </div>
         ) : (
            <>
               {/* Özet Kartları */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-3xl bg-[#0f172a] border border-white/10 relative overflow-hidden group flex items-center gap-6">
                     <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"></div>
                     <div className="p-4 rounded-full bg-blue-500/20 text-blue-400">
                        <Activity className="w-8 h-8" />
                     </div>
                     <div>
                        <div className="text-4xl font-bold text-white">%{averageScore}</div>
                        <div className="text-xs text-blue-200 uppercase tracking-widest">Ruhsal Denge</div>
                     </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-[#0f172a] border border-white/10 relative overflow-hidden group flex items-center gap-6">
                     <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent"></div>
                     <div className="p-4 rounded-full bg-purple-500/20 text-purple-400">
                        <Zap className="w-8 h-8" />
                     </div>
                     <div>
                        <div className="text-3xl font-serif font-bold text-white">{dominantMood}</div>
                        <div className="text-xs text-purple-200 uppercase tracking-widest">Baskın Frekans</div>
                     </div>
                  </div>
               </div>

               {/* YUVARLAK ANALİZ & LİSTE */}
               <div className="grid md:grid-cols-3 gap-8 mb-8">
                  
                  {/* Sol Taraf: Grafik */}
                  <div className="md:col-span-1 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="relative w-48 h-48 group">
                        {/* Glow Efekti */}
                        <div className="absolute inset-0 rounded-full blur-2xl opacity-20 bg-white animate-pulse-slow"></div>
                        
                        {/* Pasta Grafiği */}
                        <div 
                           className="w-full h-full rounded-full transition-all duration-1000 rotate-[-90deg]"
                           style={{ background: gradientString }}
                        ></div>

                        {/* Ortadaki Boşluk */}
                        <div className="absolute inset-3 bg-[#0b0f19] rounded-full flex flex-col items-center justify-center border border-white/5 shadow-inner">
                           <span className="text-gray-400 text-[10px] uppercase tracking-widest">Toplam</span>
                           <span className="text-3xl font-bold text-white">{chartData.reduce((acc, curr) => acc + curr.count, 0)}</span>
                           <span className="text-gray-500 text-[10px]">Rüya</span>
                        </div>
                     </div>
                  </div>

                  {/* Sağ Taraf: Detaylı Liste */}
                  <div className="md:col-span-2 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-white/10">
                      <div className="flex items-center gap-2 mb-6 text-gray-400">
                         <PieChart className="w-4 h-4" />
                         <span className="text-xs font-bold uppercase tracking-widest">Duygu Dağılımı</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {chartData.map((item, i) => (
                           <motion.div 
                              key={i}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 hover:bg-white/5 transition-colors group"
                           >
                              <div className="flex items-center gap-3">
                                 <div className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: item.color, color: item.color }}></div>
                                 <span className="text-sm font-medium text-gray-200 group-hover:text-white">{item.mood}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                 <span className="text-xs text-gray-500">{item.count} adet</span>
                                 <span className="text-xs font-bold text-black px-2 py-0.5 rounded-md" style={{ backgroundColor: item.color }}>%{item.percent}</span>
                              </div>
                           </motion.div>
                        ))}
                      </div>
                  </div>
               </div>

               {/* YENİ: KİŞİSEL RUHSAL ANALİZ KUTUSU */}
               <div className="p-8 rounded-3xl bg-gradient-to-r from-[#1e1b4b] to-[#0f172a] border border-[#8b5cf6]/30 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                     <Sparkles className="w-32 h-32 text-[#8b5cf6]" />
                  </div>
                  
                  <div className="relative z-10">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-[#8b5cf6]/20 text-[#8b5cf6]">
                           <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="font-serif text-lg font-bold text-white">Ruhsal Harita Analizi</h3>
                     </div>
                     
                     <p className="text-gray-300 leading-relaxed text-lg font-light">
                        {aiInsight}
                     </p>
                  </div>
               </div>

            </>
         )}

      </main>
    </div>
  );
}