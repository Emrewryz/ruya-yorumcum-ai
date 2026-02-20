"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { getAstrologyAnalysis } from "@/app/actions/astrology"; 
import { 
  ArrowLeft, ScrollText, Loader2, Sparkles, Lock, 
  Sun, Moon, ArrowUpCircle, MapPin, Calendar, Clock, Coins
} from "lucide-react"; 
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function NatalChartPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [data, setData] = useState<any>(null); 
  const [profile, setProfile] = useState<any>(null); 
  const [isLockedMode, setIsLockedMode] = useState(false); 

  useEffect(() => {
    initPage();
  }, []);

  const initPage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(userProfile);

      const { data: existing } = await supabase
        .from('astrology_readings')
        .select('analysis, sun_sign, moon_sign, ascendant_sign') 
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existing) {
        setData({
            ...existing.analysis, 
            sun_sign: existing.sun_sign, 
            moon_sign: existing.moon_sign, 
            ascendant_sign: existing.ascendant_sign 
        });
        
        setIsLockedMode(false); 
      }
    } catch (error) {
      console.error("Başlangıç hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    
    const res = await getAstrologyAnalysis(null); 
    
    if (res.success) {
      setData(res.data);
      setIsLockedMode(false);
      toast.success("Analiz tamamlandı! (5 Kredi düştü)");
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (res.code === "NO_CREDIT") {
        if(res.basicData) {
             setIsLockedMode(true);
             setData({
                 sun_sign: res.basicData.sun_sign,
                 moon_sign: res.basicData.moon_sign,
                 ascendant_sign: res.basicData.ascendant_sign,
                 character_analysis: "Bu detaylı analiz için 5 krediye ihtiyacınız var.",
                 career_love: "Bu detaylı analiz için 5 krediye ihtiyacınız var."
             });
             window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        toast.error("Yetersiz Bakiye", {
            description: "Detaylı Natal Harita analizi için 5 krediye ihtiyacınız var.",
            action: { label: "Yükle", onClick: () => router.push("/dashboard/pricing") },
            duration: 5000
        });

      } else {
        toast.error(res.error || "Bir hata oluştu.");
      }
    }
    setAnalyzing(false);
  };

  return (
    // İÇ İÇE GEÇMEYİ ENGELLEYEN YENİ LAYOUT YAPISI
    <div className="relative w-full flex flex-col items-center min-h-[calc(100vh-6rem)] z-10 pb-20">
      
      {/* Arkaplan Mistik Efektleri */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/15 via-transparent to-transparent pointer-events-none -z-10"></div>

      <div className="w-full max-w-5xl mt-6 px-4 md:px-0">
         
         {/* Geri Butonu ve Header */}
         <div className="mb-8">
            <button 
                onClick={() => router.back()} 
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-xs font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl w-fit"
            >
                <ArrowLeft className="w-4 h-4" /> Astroloji Merkezi
            </button>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white">Doğum Haritası</h1>
                
                {/* Profil Bilgileri Kartı (Kompakt ve Şık) */}
                {profile && (
                    <div className="flex flex-wrap items-center gap-2 bg-[#131722]/80 border border-white/5 px-4 py-2.5 rounded-xl text-xs text-slate-300 backdrop-blur-md w-fit">
                        <div className="flex items-center gap-1.5 shrink-0">
                            <Calendar className="w-3.5 h-3.5 text-purple-400" />
                            {profile.birth_date ? new Date(profile.birth_date).toLocaleDateString('tr-TR') : '-'}
                        </div>
                        <div className="w-1 h-1 bg-white/20 rounded-full hidden md:block"></div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <Clock className="w-3.5 h-3.5 text-purple-400" />
                            {profile.birth_time?.slice(0, 5) || '-'}
                        </div>
                        <div className="w-1 h-1 bg-white/20 rounded-full hidden md:block"></div>
                        <div className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-purple-400" />
                            {profile.birth_city || '-'}
                        </div>
                    </div>
                )}
            </div>
         </div>

         <div className="w-full min-h-[400px]">
         <AnimatePresence mode="wait">
            {loading ? (
                <motion.div 
                   key="loading"
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                   className="flex flex-col items-center justify-center py-32"
                >
                   <Loader2 className="animate-spin text-purple-500 w-10 h-10 mb-4" />
                   <p className="text-slate-400 text-sm font-mono tracking-widest uppercase animate-pulse">Harita Çıkarılıyor...</p>
                </motion.div>
            ) : data ? (
                // --- 1. GÖRÜNÜM: ANALİZ SONUCU ---
                <motion.div 
                   key="result"
                   initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                   className="space-y-6 md:space-y-8"
                >
                    {/* Temel Burçlar (3'lü Grid) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Güneş */}
                        <div className="bg-[#131722] p-6 rounded-[2rem] border border-white/5 flex items-center gap-5 hover:border-yellow-500/30 transition-all group">
                            <div className="p-4 bg-[#0a0c10] border border-yellow-500/20 rounded-2xl group-hover:bg-yellow-500/10 transition-colors">
                                <Sun className="text-yellow-500 w-7 h-7" />
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Güneş Burcu</div>
                                <div className="text-2xl font-serif font-bold text-white">{data.sun_sign}</div>
                            </div>
                        </div>
                        {/* Yükselen */}
                        <div className="bg-[#131722] p-6 rounded-[2rem] border border-white/5 flex items-center gap-5 hover:border-purple-500/30 transition-all group">
                            <div className="p-4 bg-[#0a0c10] border border-purple-500/20 rounded-2xl group-hover:bg-purple-500/10 transition-colors">
                                <ArrowUpCircle className="text-purple-400 w-7 h-7" />
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Yükselen</div>
                                <div className="text-2xl font-serif font-bold text-white">{data.ascendant_sign}</div>
                            </div>
                        </div>
                        {/* Ay */}
                        <div className="bg-[#131722] p-6 rounded-[2rem] border border-white/5 flex items-center gap-5 hover:border-blue-500/30 transition-all group">
                            <div className="p-4 bg-[#0a0c10] border border-blue-500/20 rounded-2xl group-hover:bg-blue-500/10 transition-colors">
                                <Moon className="text-blue-400 w-7 h-7" />
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Ay Burcu</div>
                                <div className="text-2xl font-serif font-bold text-white">{data.moon_sign || "..."}</div>
                            </div>
                        </div>
                    </div>

                    {/* Detaylı Metinler (Grid) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Karakter Analizi */}
                        <div className="bg-[#0a0c10]/80 p-8 md:p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden flex flex-col">
                            <h3 className="text-xl md:text-2xl font-serif font-bold mb-6 flex items-center gap-3 text-white">
                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                    <Sparkles className="w-5 h-5 text-purple-400" />
                                </div>
                                Karakter & Ruh
                            </h3>
                            {isLockedMode ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center relative">
                                    <div className="absolute inset-0 overflow-hidden opacity-20 select-none blur-[4px] text-slate-500 text-sm leading-relaxed text-justify">
                                        Doğum anınızdaki gezegen dizilimleri, ruhunuzun ana iskeletini oluşturur. Sizin doğanız gereği, liderlik vasıflarınız ve içsel motivasyonlarınız bu analizde çok derin bir şekilde incelenmektedir.
                                    </div>
                                    <div className="relative z-10 flex flex-col items-center">
                                        <Lock className="w-8 h-8 text-purple-500 mb-3"/> 
                                        <p className="text-slate-300 text-sm mb-6">Detaylı karakter analizi için 5 kredi gereklidir.</p>
                                        <button onClick={() => router.push('/dashboard/pricing')} className="px-6 py-3 bg-purple-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-purple-500 transition-colors text-white">Kredi Yükle</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-slate-300 leading-relaxed text-sm md:text-base font-light whitespace-pre-line text-justify">
                                    {data.character_analysis}
                                </p>
                            )}
                        </div>

                        {/* Kariyer & Aşk */}
                        <div className="bg-[#0a0c10]/80 p-8 md:p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden flex flex-col">
                            <h3 className="text-xl md:text-2xl font-serif font-bold mb-6 flex items-center gap-3 text-white">
                                <div className="p-2 bg-pink-500/10 rounded-lg">
                                    <ScrollText className="w-5 h-5 text-pink-400" />
                                </div>
                                Kariyer & Aşk
                            </h3>
                             {isLockedMode ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center relative">
                                    <div className="absolute inset-0 overflow-hidden opacity-20 select-none blur-[4px] text-slate-500 text-sm leading-relaxed text-justify">
                                        Aşk hayatınızdaki dönüm noktaları ve kariyerinizde sizi zirveye taşıyacak potansiyeller haritanızın gizli evlerinde yatıyor. Bu alanda şanslı olduğunuz konular listelenmiştir.
                                    </div>
                                    <div className="relative z-10 flex flex-col items-center">
                                        <Lock className="w-8 h-8 text-pink-500 mb-3"/> 
                                        <p className="text-slate-300 text-sm mb-6">Gelecek projeksiyonları için 5 kredi gereklidir.</p>
                                        <button onClick={() => router.push('/dashboard/pricing')} className="px-6 py-3 bg-pink-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-pink-500 transition-colors text-white">Kredi Yükle</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-slate-300 leading-relaxed text-sm md:text-base font-light whitespace-pre-line text-justify">
                                    {data.career_love}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>
            ) : (
                // --- 2. GÖRÜNÜM: HİÇ VERİ YOKSA (BAŞLANGIÇ EKRANI) ---
                <motion.div 
                    key="empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 px-6 max-w-2xl mx-auto text-center"
                >
                    <div className="w-24 h-24 bg-[#131722] border border-white/10 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner rotate-3">
                        <ScrollText className="w-10 h-10 text-purple-400" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">Haritanı Keşfet</h2>
                    <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-10">
                        Doğum haritanın matematiksel hesaplamasıyla Güneş, Ay ve Yükselen burcunu öğren. Kişiliğine ve geleceğine dair detaylı sentezi okumak için analizi başlat.
                    </p>
                    
                    <button 
                        onClick={handleAnalyze} 
                        disabled={analyzing}
                        className="w-full md:w-auto px-10 py-5 bg-white hover:bg-slate-200 text-[#0a0c10] font-bold text-sm uppercase tracking-widest rounded-2xl transition-all disabled:opacity-70 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                    >
                        {analyzing ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                        {analyzing ? "Yıldızlar Hesaplanıyor..." : "Analiz Et ve Kaydet (5 Kredi)"}
                    </button>
                    
                    {!analyzing && (
                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                            <Coins className="w-4 h-4 text-amber-500" />
                            <span>Bu detaylı analiz için bir defaya mahsus 5 kredi kullanılır.</span>
                        </div>
                    )}
                </motion.div>
            )}
         </AnimatePresence>
         </div>
      </div>
    </div>
  );
}