"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { getDailyHoroscope } from "@/app/actions/daily-horoscope";
import Sidebar from "@/components/Sidebar";
import { 
  ArrowLeft, Sparkles, Loader2, Star, Heart, 
  Briefcase, Quote, Zap, Calendar, Coins
} from "lucide-react"; 
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function DailyHoroscopePage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState<any>(null);
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    // Tarih formatı (Örn: 12 Şubat 2026 Perşembe)
    const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' };
    setFormattedDate(new Date().toLocaleDateString('tr-TR', dateOptions));
    
    checkTodayData();
  }, []);

  // 1. Veritabanı Kontrolü (Cache varsa ücretsiz göster)
  const checkTodayData = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            router.push('/login');
            return;
        }

        // Backend ile aynı tarih formatı (YYYY-MM-DD)
        const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });

        const { data: existing, error } = await supabase
            .from('daily_horoscopes')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', today)
            .single();

        if (existing) {
            setData(existing);
        }
    } catch (error) {
        console.error("Veri çekme hatası:", error);
    } finally {
        setLoading(false);
    }
  };

  // 2. Butona basılınca AI çalıştır (Yeni Analiz)
  const handleGenerate = async () => {
    setGenerating(true);
    
    // Server Action Çağrısı (Kredi kontrolü serverda yapılır)
    const res = await getDailyHoroscope(); 
    
    if (res.success) {
      setData(res.data);
      
      // Kullanıcıya bilgi ver
      if (res.cached) {
          toast.success("Bugünkü yorumunuz zaten hazırdı.");
      } else {
          toast.success("Yıldızlar haritanızı okudu! (1 Kredi düştü)");
      }
      
      // Sayfayı yukarı kaydır
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } else {
      // --- HATA VE KREDİ YÖNETİMİ ---
      if (res.code === "NO_CREDIT") {
          toast.error("Yetersiz Bakiye", {
              description: "Günlük burç yorumu için 1 krediye ihtiyacınız var.",
              action: {
                  label: "Yükle",
                  onClick: () => router.push("/dashboard/pricing")
              },
              duration: 5000
          });
      } else {
          toast.error(res.error || "Bir hata oluştu");
      }
    }
    setGenerating(false);
  };

  // Skor rengini belirle
  const getScoreColor = (score: number) => {
    if (!score) return "text-gray-400 border-gray-500/50";
    if (score >= 80) return "text-emerald-400 border-emerald-500/50 shadow-emerald-500/20";
    if (score >= 50) return "text-indigo-400 border-indigo-500/50 shadow-indigo-500/20";
    return "text-amber-400 border-amber-500/50 shadow-amber-500/20";
  };

  return (
    // APP FIX: pb-28 (Mobil alt menü payı), overflow-x-hidden (Yatay taşmayı önle)
    <div className="min-h-screen bg-[#020617] text-white flex pb-28 md:pb-0 overflow-x-hidden font-sans">
      <Sidebar />      
      
      {/* Arkaplan Efektleri */}
      <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none z-0 mix-blend-overlay"></div>
      <div className="fixed -top-[20%] -left-[10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-600/20 rounded-full blur-[80px] md:blur-[120px] pointer-events-none z-0 animate-pulse-slow"></div>
      <div className="fixed top-[40%] -right-[10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-purple-600/10 rounded-full blur-[60px] md:blur-[100px] pointer-events-none z-0"></div>

      {/* MAIN CONTENT */}
      {/* md:pl-24 -> Masaüstü Sidebar boşluğu | p-4 -> Mobil kenar boşluğu */}
      <main className="flex-1 md:pl-24 p-4 md:p-10 relative z-10 w-full flex flex-col items-center">
          
          {/* Üst Header */}
          <div className="max-w-4xl w-full mb-6 md:mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6 md:pt-0">
            <div>
                <button onClick={() => router.back()} className="flex items-center gap-2 text-indigo-300/60 hover:text-white transition-colors mb-3 md:mb-4 text-xs md:text-sm font-medium tracking-wide">
                    <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" /> Astroloji Merkezi
                </button>
                <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200 tracking-tight">
                    Günlük Analiz
                </h1>
                <div className="flex items-center gap-2 mt-2 text-indigo-300/50 text-xs md:text-sm">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                    <span>{formattedDate}</span>
                </div>
            </div>
          </div>

          <div className="max-w-4xl w-full min-h-[400px]">
            <AnimatePresence mode="wait">
            
            {loading ? (
                // LOADING STATE
                <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-64 w-full"
                >
                    <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-indigo-500 animate-spin mb-4" />
                    <p className="text-indigo-300/70 animate-pulse text-sm md:text-base">Veriler yükleniyor...</p>
                </motion.div>

            ) : data ? (
                // DATA STATE (SONUÇ KARTI)
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, y: 20, scale: 0.98 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="relative group"
                >
                    {/* Glow Border Effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl md:rounded-[2.5rem] opacity-30 blur md:group-hover:opacity-50 transition duration-1000"></div>

                    <div className="relative rounded-2xl md:rounded-[2.5rem] bg-[#0B0F1F]/90 backdrop-blur-xl border border-white/10 p-5 md:p-12 overflow-hidden">
                        
                        {/* İç Dekorasyon */}
                        <div className="absolute top-0 right-0 w-48 md:w-96 h-48 md:h-96 bg-indigo-500/10 rounded-full blur-[40px] md:blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        {/* ÜST BÖLÜM: Skor ve Başlık */}
                        <div className="flex flex-col-reverse md:flex-row md:items-start justify-between gap-6 mb-8 md:mb-10 border-b border-white/5 pb-6 md:pb-8">
                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-3 md:mb-4">
                                    <Sparkles className="w-3 h-3" /> Transit Etkiler Aktif
                                </div>
                                <h2 className="text-xl md:text-3xl font-semibold text-white leading-tight">
                                    Gökyüzü bugün senin için ne fısıldıyor?
                                </h2>
                            </div>

                            {/* Şans Skoru Dairesi */}
                            <div className="flex flex-col items-center">
                                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-4 flex items-center justify-center bg-black/20 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.3)] ${getScoreColor(data.lucky_score)}`}>
                                    <div className="text-center">
                                        <span className="text-2xl md:text-3xl font-bold block leading-none">{data.lucky_score || "?"}</span>
                                        <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest opacity-70">Puan</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* ANA METİN */}
                        <div className="mb-8 md:mb-10 relative">
                            <Quote className="absolute -top-3 -left-1 md:-top-4 md:-left-2 w-6 h-6 md:w-8 md:h-8 text-indigo-500/20 transform -scale-x-100" />
                            <p className="text-sm md:text-xl text-gray-200 leading-relaxed pl-5 md:pl-6 font-light text-justify">
                                {data.general_vibe}
                            </p>
                        </div>

                        {/* DETAY KARTLARI (Grid - Mobilde Tek Kolon) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          
                          {/* Aşk Kartı */}
                          <motion.div 
                             whileHover={{ scale: 1.02 }}
                             className="bg-gradient-to-br from-white/5 to-white/0 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 hover:border-pink-500/30 transition-colors group/card"
                          >
                             <div className="flex items-center gap-3 mb-3 md:mb-4">
                                <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-pink-500/20 text-pink-400 group-hover/card:bg-pink-500 group-hover/card:text-white transition-colors">
                                    <Heart className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <h3 className="text-base md:text-lg font-bold text-white">Aşk & İlişkiler</h3>
                             </div>
                             <p className="text-xs md:text-base text-gray-400 leading-relaxed text-justify">
                                {data.love_focus}
                             </p>
                          </motion.div>

                          {/* Kariyer Kartı */}
                          <motion.div 
                             whileHover={{ scale: 1.02 }}
                             className="bg-gradient-to-br from-white/5 to-white/0 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-colors group/card"
                          >
                             <div className="flex items-center gap-3 mb-3 md:mb-4">
                                <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-emerald-500/20 text-emerald-400 group-hover/card:bg-emerald-500 group-hover/card:text-white transition-colors">
                                    <Briefcase className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <h3 className="text-base md:text-lg font-bold text-white">Kariyer & Para</h3>
                             </div>
                             <p className="text-xs md:text-base text-gray-400 leading-relaxed text-justify">
                                {data.career_focus}
                             </p>
                          </motion.div>

                        </div>

                        {/* Footer Notu */}
                        <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-white/5 flex items-center justify-center text-center">
                            <p className="text-[10px] md:text-xs text-indigo-300/40 flex items-center gap-2">
                                <Zap className="w-3 h-3" /> 
                                Bu analiz doğum haritanız ve anlık gezegen konumları kullanılarak yapılmıştır.
                            </p>
                        </div>
                    </div>
                </motion.div>
            ) : (
                // EMPTY STATE (BAŞLANGIÇ EKRANI)
                <motion.div 
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative overflow-hidden rounded-3xl md:rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-sm p-8 md:p-16 text-center"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl md:rounded-3xl flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-indigo-500/30 rotate-3">
                            <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-white" />
                        </div>
                        
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">
                            Bugün Yıldızlar Ne Söylüyor?
                        </h2>
                        <p className="text-gray-400 text-sm md:text-lg mb-8 md:mb-10 leading-relaxed">
                            Doğum haritanla şu an gökyüzündeki gezegenlerin dansını analiz edelim. 
                            <span className="text-indigo-300 block mt-2">Sana özel transit etkileri keşfet.</span>
                        </p>

                        <button 
                            onClick={handleGenerate} 
                            disabled={generating}
                            className="group relative w-full md:w-auto inline-flex items-center justify-center gap-3 px-8 md:px-10 py-4 md:py-5 bg-white text-black font-bold text-base md:text-lg rounded-xl md:rounded-2xl hover:scale-105 transition-all disabled:opacity-70 disabled:scale-100 overflow-hidden shadow-xl"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 via-white to-indigo-200 opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
                            
                            <span className="relative flex items-center gap-2">
                                {generating ? <Loader2 className="animate-spin w-5 h-5" /> : <Star className="w-5 h-5 fill-black" />}
                                {generating ? "Yıldızlar Okunuyor..." : "Analizi Başlat (1 Kredi)"}
                            </span>
                        </button>
                        
                        {!generating && (
                            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] md:text-xs text-gray-500">
                                <Coins className="w-3 h-3 text-[#fbbf24]" />
                                <span>Bu işlem için 1 jeton kullanılır.</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
          </div>

      </main>
    </div>
  );
}