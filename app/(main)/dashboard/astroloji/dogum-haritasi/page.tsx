"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { getAstrologyAnalysis } from "@/app/actions/astrology"; // Server Action
import Sidebar from "@/components/Sidebar";
import { 
  ArrowLeft, ScrollText, Loader2, Sparkles, Lock, 
  Sun, Moon, ArrowUpCircle, MapPin, Calendar, Clock, Coins
} from "lucide-react"; 
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function NatalChartPage() {
  const supabase = createClient();
  const router = useRouter();
  
  // State
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [data, setData] = useState<any>(null); // Analiz Verisi
  const [profile, setProfile] = useState<any>(null); // Kullanıcı Bilgileri
  const [isLockedMode, setIsLockedMode] = useState(false); // Kredi yetersizse kilitli mod

  useEffect(() => {
    initPage();
  }, []);

  // Sayfa açılınca çalışacak kısım
  const initPage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 1. Profil bilgilerini çek
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(userProfile);

      // 2. KAYITLI VERİYİ ÇEK (Cache Varsa Ücretsiz Göster)
      const { data: existing } = await supabase
        .from('astrology_readings')
        .select('analysis, sun_sign, moon_sign, ascendant_sign') 
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existing) {
        // Veriyi standardize et (Hem kolondan hem JSON'dan gelebilir)
        setData({
            ...existing.analysis, // JSON içindeki detaylar
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

  // 3. Yeni Analiz Yap (Kredi Kontrollü)
  const handleAnalyze = async () => {
    setAnalyzing(true);
    
    // Server Action Çağrısı (Kredi kontrolü serverda yapılır)
    // Parametre olarak null gönderiyoruz çünkü veriyi profilden çekecek
    const res = await getAstrologyAnalysis(null); 
    
    if (res.success) {
      setData(res.data);
      setIsLockedMode(false);
      toast.success("Analiz tamamlandı! (5 Kredi düştü)");
      
      // Başarılı olunca yukarı kaydır
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // --- KREDİ VE HATA YÖNETİMİ ---
      if (res.code === "NO_CREDIT") {
        
        // Kredi yetersiz olsa bile temel matematiksel veriyi gösterelim (Önizleme)
        if(res.basicData) {
             setIsLockedMode(true); // Detayları kilitle
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
            action: {
                label: "Yükle",
                onClick: () => router.push("/dashboard/pricing")
            },
            duration: 5000
        });

      } else {
        toast.error(res.error || "Bir hata oluştu.");
      }
    }
    setAnalyzing(false);
  };

  return (
    // APP FIX: pb-28 (Mobil alt menü payı)
    <div className="min-h-screen bg-[#020617] text-white flex pb-28 md:pb-0 font-sans overflow-x-hidden">
      <Sidebar />
      
      {/* Arkaplan */}
      <div className="bg-noise fixed inset-0 opacity-20 pointer-events-none z-0"></div>
      <div className="fixed top-0 left-0 w-full h-[300px] md:h-[400px] bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none z-0"></div>

      {/* MAIN CONTENT */}
      {/* md:pl-24 -> Masaüstü Sidebar boşluğu | p-4 -> Mobil kenar boşluğu */}
      <main className="flex-1 md:pl-24 p-4 md:p-12 relative z-10 w-full">
         <div className="max-w-5xl mx-auto pt-6 md:pt-0">
            
            {/* Geri Butonu */}
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 md:mb-6 transition-colors text-xs md:text-sm font-medium">
                <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" /> Astroloji Merkezi
            </button>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-serif font-bold">Doğum Haritası Analizi</h1>
                
                {/* --- PROFİL BİLGİLERİ KARTI --- */}
                {profile && (
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 bg-white/5 border border-white/10 px-3 py-2 md:px-4 md:py-2 rounded-xl md:rounded-full text-[10px] md:text-xs text-gray-300 backdrop-blur-sm w-fit max-w-full">
                        <div className="flex items-center gap-1 shrink-0">
                            <Calendar className="w-3 h-3 text-purple-400" />
                            {profile.birth_date ? new Date(profile.birth_date).toLocaleDateString('tr-TR') : '-'}
                        </div>
                        <div className="w-px h-3 bg-white/20 hidden md:block"></div>
                        <div className="flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3 text-purple-400" />
                            {profile.birth_time?.slice(0, 5) || '-'}
                        </div>
                        <div className="w-px h-3 bg-white/20 hidden md:block"></div>
                        <div className="flex items-center gap-1 truncate max-w-[120px] md:max-w-none">
                            <MapPin className="w-3 h-3 text-purple-400" />
                            {profile.birth_city || '-'}
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-500 w-8 h-8" /></div>
            ) : data ? (
                // --- 1. GÖRÜNÜM: ANALİZ SONUCU ---
                <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
                    
                    {/* Özet Kartlar (Burçlar) - MOBİLDE TEK KOLON */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Güneş */}
                        <div className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-white/10 flex items-center gap-4 hover:border-yellow-500/30 transition-colors">
                            <div className="p-3 bg-yellow-500/10 rounded-xl">
                                <Sun className="text-yellow-500 w-6 h-6 md:w-8 md:h-8" />
                            </div>
                            <div>
                                <div className="text-[10px] md:text-xs text-gray-400 uppercase font-bold">Güneş Burcu</div>
                                <div className="text-xl md:text-2xl font-serif font-bold text-white">{data.sun_sign}</div>
                            </div>
                        </div>
                        {/* Yükselen */}
                        <div className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-white/10 flex items-center gap-4 hover:border-purple-500/30 transition-colors">
                            <div className="p-3 bg-purple-500/10 rounded-xl">
                                <ArrowUpCircle className="text-purple-400 w-6 h-6 md:w-8 md:h-8" />
                            </div>
                            <div>
                                <div className="text-[10px] md:text-xs text-gray-400 uppercase font-bold">Yükselen</div>
                                <div className="text-xl md:text-2xl font-serif font-bold text-white">
                                    {data.ascendant_sign}
                                </div>
                            </div>
                        </div>
                        {/* Ay */}
                        <div className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-white/10 flex items-center gap-4 hover:border-blue-500/30 transition-colors">
                            <div className="p-3 bg-blue-500/10 rounded-xl">
                                <Moon className="text-blue-400 w-6 h-6 md:w-8 md:h-8" />
                            </div>
                            <div>
                                <div className="text-[10px] md:text-xs text-gray-400 uppercase font-bold">Ay Burcu</div>
                                <div className="text-xl md:text-2xl font-serif font-bold text-white">{data.moon_sign || "..."}</div>
                            </div>
                        </div>
                    </div>

                    {/* Detaylı Metinler (AI Analizi) - MOBİLDE TEK KOLON */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        
                        {/* Karakter Analizi */}
                        <div className="bg-slate-900/50 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 relative overflow-hidden">
                            <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2 text-purple-300">
                                <Sparkles className="w-4 h-4 md:w-5 md:h-5" /> Karakter & Ruh
                            </h3>
                            {isLockedMode ? (
                                <div className="flex flex-col items-center justify-center py-8 md:py-10 text-center select-none">
                                    <p className="blur-sm text-gray-600 mb-3 text-xs md:text-base">
                                        Lorem ipsum dolor sit amet character analysis hidden deeply mysterious content.
                                    </p>
                                    <Lock className="w-6 h-6 md:w-8 md:h-8 text-purple-500 mb-2"/> 
                                    <p className="text-gray-400 text-xs md:text-sm">Bu analiz için 5 kredi gereklidir.</p>
                                    <button onClick={() => router.push('/dashboard/pricing')} className="mt-3 px-4 py-2 bg-purple-600 rounded-full text-xs font-bold hover:bg-purple-500 transition-colors">Kredi Yükle</button>
                                </div>
                            ) : (
                                <p className="text-gray-300 leading-relaxed text-xs md:text-sm whitespace-pre-line text-justify">
                                    {data.character_analysis}
                                </p>
                            )}
                        </div>

                        {/* Kariyer & Aşk */}
                        <div className="bg-slate-900/50 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 relative overflow-hidden">
                            <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2 text-pink-300">
                                <ScrollText className="w-4 h-4 md:w-5 md:h-5" /> Kariyer & Aşk
                            </h3>
                             {isLockedMode ? (
                                <div className="flex flex-col items-center justify-center py-8 md:py-10 text-center select-none">
                                    <p className="blur-sm text-gray-600 mb-3 text-xs md:text-base">
                                        Lorem ipsum dolor sit amet career analysis hidden waiting for you to unlock.
                                    </p>
                                    <Lock className="w-6 h-6 md:w-8 md:h-8 text-pink-500 mb-2"/> 
                                    <p className="text-gray-400 text-xs md:text-sm">Bu analiz için 5 kredi gereklidir.</p>
                                    <button onClick={() => router.push('/dashboard/pricing')} className="mt-3 px-4 py-2 bg-pink-600 rounded-full text-xs font-bold hover:bg-pink-500 transition-colors">Kredi Yükle</button>
                                </div>
                            ) : (
                                <p className="text-gray-300 leading-relaxed text-xs md:text-sm whitespace-pre-line text-justify">
                                    {data.career_love}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                // --- 2. GÖRÜNÜM: HİÇ VERİ YOKSA BUTON ---
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 md:py-20 bg-white/5 rounded-3xl md:rounded-[2.5rem] border border-white/10 text-center px-6"
                >
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 md:mb-6">
                        <ScrollText className="w-8 h-8 md:w-10 md:h-10 text-purple-400" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">Haritanı Keşfet</h2>
                    <p className="text-gray-400 text-sm md:text-base max-w-md mb-6 md:mb-8">
                        Doğum haritanın matematiksel hesaplamasıyla Güneş, Ay ve Yükselen burcunu öğren. Bu işlem sadece bir kez yapılır.
                    </p>
                    
                    {/* Profil Bilgisi Uyarısı */}
                    {profile && (
                        <div className="mb-6 md:mb-8 p-3 md:p-4 bg-purple-900/20 rounded-xl border border-purple-500/30 text-xs md:text-sm text-purple-200">
                            <strong>Analiz edilecek bilgiler:</strong><br/>
                            {profile.birth_city || 'Şehir Yok'}, {profile.birth_date ? new Date(profile.birth_date).toLocaleDateString('tr-TR') : 'Tarih Yok'} - {profile.birth_time || 'Saat Yok'}
                        </div>
                    )}

                    <button 
                        onClick={handleAnalyze} 
                        disabled={analyzing}
                        className="w-full md:w-auto px-6 py-3 md:px-8 md:py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 shadow-lg shadow-purple-500/25 text-sm md:text-base"
                    >
                        {analyzing ? <Loader2 className="animate-spin w-4 h-4 md:w-5 md:h-5" /> : <Sparkles className="w-4 h-4 md:w-5 md:h-5" />}
                        {analyzing ? "Yıldızlar Hesaplanıyor..." : "Analiz Et ve Kaydet (5 Kredi)"}
                    </button>
                    
                    {!analyzing && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] md:text-xs text-gray-500">
                            <Coins className="w-3 h-3 text-[#fbbf24]" />
                            <span>Bu detaylı analiz için 5 kredi kullanılır.</span>
                        </div>
                    )}
                </motion.div>
            )}

         </div>
      </main>
    </div>
  );
}