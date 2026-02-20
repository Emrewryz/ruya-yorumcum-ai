"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { getDailyHoroscope } from "@/app/actions/daily-horoscope";
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
    const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' };
    setFormattedDate(new Date().toLocaleDateString('tr-TR', dateOptions));
    
    checkTodayData();
  }, []);

  const checkTodayData = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            router.push('/auth');
            return;
        }

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

  const handleGenerate = async () => {
    setGenerating(true);
    
    const res = await getDailyHoroscope(); 
    
    if (res.success) {
      setData(res.data);
      
      if (res.cached) {
          toast.success("Bugünkü yorumunuz zaten hazırdı.");
      } else {
          toast.success("Yıldızlar haritanızı okudu! (1 Kredi düştü)");
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } else {
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

  // Skor rengini belirle (Softlaştırılmış renkler)
  const getScoreColor = (score: number) => {
    if (!score) return "text-slate-400 border-slate-500/20";
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]";
    if (score >= 50) return "text-indigo-400 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]";
    return "text-amber-400 border-amber-500/30 shadow-[0_0_20px_rgba(251,191,36,0.15)]";
  };

  return (
    // İÇ İÇE GEÇMEYİ ENGELLEYEN YENİ LAYOUT (Sidebar'sız ve min-h'si içeriğe uygun)
    <div className="relative w-full flex flex-col items-center min-h-[calc(100vh-6rem)] z-10 pb-20">
      
      {/* Arkaplan Efektleri (Mistik ve Mat) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none -z-10"></div>
      
      {/* Üst Header */}
      <div className="w-full max-w-4xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mt-6">
        <div>
            <button 
                onClick={() => router.back()} 
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-xs font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl w-fit"
            >
                <ArrowLeft className="w-4 h-4" /> Geri Dön
            </button>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-2">
                Günlük Transit Analizi
            </h1>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg w-fit">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
            </div>
        </div>
      </div>

      <div className="w-full max-w-4xl">
        <AnimatePresence mode="wait">
        
        {loading ? (
            // LOADING STATE
            <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-64 w-full"
            >
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-400 text-sm font-mono tracking-widest uppercase animate-pulse">Hizalanıyor...</p>
            </motion.div>

        ) : data ? (
            // DATA STATE (SONUÇ KARTI)
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-6"
            >
                {/* ÜST BÖLÜM: Ana Yorum ve Skor */}
                <div className="relative rounded-[2rem] bg-[#131722]/80 backdrop-blur-xl border border-white/5 p-8 md:p-12 overflow-hidden shadow-2xl">
                    
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10 border-b border-white/5 pb-10 relative z-10">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                                <Sparkles className="w-3 h-3" /> Günün Teması
                            </div>
                            <h2 className="text-2xl md:text-3xl font-serif text-white leading-tight">
                                Yıldızların Senin İçin Mesajı
                            </h2>
                        </div>

                        {/* Şans Skoru */}
                        <div className="shrink-0 flex flex-col items-center">
                            <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center bg-[#0a0c10] ${getScoreColor(data.lucky_score)}`}>
                                <div className="text-center">
                                    <span className="text-3xl font-bold block leading-none mb-1">{data.lucky_score || "?"}</span>
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500">Enerji</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* ANA METİN */}
                    <div className="relative z-10">
                        <Quote className="w-8 h-8 text-white/10 mb-4" />
                        <p className="text-base md:text-lg text-slate-300 leading-relaxed font-light text-justify">
                            {data.general_vibe}
                        </p>
                    </div>
                </div>

                {/* DETAY KARTLARI (Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Aşk Kartı */}
                  <div className="bg-[#131722] p-8 rounded-[2rem] border border-white/5 hover:border-pink-500/30 transition-colors group">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="p-3 rounded-xl bg-pink-500/10 text-pink-500 border border-pink-500/20 group-hover:bg-pink-500/20 transition-colors">
                             <Heart className="w-5 h-5" />
                         </div>
                         <h3 className="text-lg font-serif text-white">Aşk & İlişkiler</h3>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed font-light">
                         {data.love_focus}
                      </p>
                  </div>

                  {/* Kariyer Kartı */}
                  <div className="bg-[#131722] p-8 rounded-[2rem] border border-white/5 hover:border-emerald-500/30 transition-colors group">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                             <Briefcase className="w-5 h-5" />
                         </div>
                         <h3 className="text-lg font-serif text-white">Kariyer & Para</h3>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed font-light">
                         {data.career_focus}
                      </p>
                  </div>

                </div>

                {/* Footer Notu */}
                <div className="mt-8 flex items-center justify-center text-center">
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest flex items-center gap-2">
                        <Zap className="w-3 h-3 text-amber-500" /> 
                        Doğum haritası ve anlık gezegen konumları baz alınmıştır.
                    </p>
                </div>
            </motion.div>
        ) : (
            // EMPTY STATE (BAŞLANGIÇ EKRANI)
            <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
            >
                <div className="relative bg-[#131722]/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-10 md:p-16 text-center shadow-2xl overflow-hidden">
                    
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto">
                        <div className="w-20 h-20 bg-[#0a0c10] border border-white/10 rounded-3xl flex items-center justify-center mb-8 shadow-inner rotate-3">
                            <Star className="w-8 h-8 text-blue-400" />
                        </div>
                        
                        <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">
                            Bugün Yıldızlar Ne Söylüyor?
                        </h2>
                        <p className="text-slate-400 text-sm mb-10 leading-relaxed font-light">
                            Doğum haritanla şu an gökyüzündeki gezegenlerin dansını analiz edelim. Sana özel günlük transit etkilerini keşfet.
                        </p>

                        <button 
                            onClick={handleGenerate} 
                            disabled={generating}
                            className="w-full md:w-auto px-10 py-4 bg-white text-[#0a0c10] font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                        >
                            {generating ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                            {generating ? "Gökyüzü Okunuyor..." : "Analizi Başlat (1 Kredi)"}
                        </button>
                    </div>
                </div>
            </motion.div>
        )}
        </AnimatePresence>
      </div>

    </div>
  );
}