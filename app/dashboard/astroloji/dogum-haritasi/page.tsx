"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { getAstrologyAnalysis } from "@/app/actions/astrology"; // Server Action
import Sidebar from "@/app/dashboard/Sidebar"; 
import { 
  ArrowLeft, ScrollText, Loader2, Sparkles, Lock, 
  Sun, Moon, ArrowUpCircle, MapPin, Calendar, Clock 
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
  const [isFreeUser, setIsFreeUser] = useState(false);

  useEffect(() => {
    initPage();
  }, []);

  // Sayfa açılınca çalışacak kısım
  const initPage = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Profil bilgilerini çek (İsim, Şehir vb. için)
    const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    setProfile(userProfile);

    // 2. KAYITLI VERİYİ ÇEK (DÜZELTME BURADA)
    // Sadece 'analysis' değil, garanti olsun diye ayrı sütunları da çekiyoruz.
    const { data: existing } = await supabase
      .from('astrology_readings')
      .select('analysis, sun_sign, moon_sign, ascendant_sign') 
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      console.log("✅ Veritabanından kayıtlı harita bulundu!");
      
      // Verileri birleştiriyoruz: Metinler JSON'dan, Burçlar Sütunlardan gelsin (Garanti Yöntem)
      setData({
          ...existing.analysis, // AI Yorumları
          sun_sign: existing.sun_sign, // Kesin Veri
          moon_sign: existing.moon_sign, // Kesin Veri
          ascendant_sign: existing.ascendant_sign // Kesin Veri
      });
      
      setIsFreeUser(false); 
    } else {
      console.log("ℹ️ Kayıtlı harita yok, analiz butonu gösterilecek.");
    }
    
    setLoading(false);
  };

  // 3. Yeni Analiz Yap (Sadece veri yoksa butona basınca çalışır)
  const handleAnalyze = async () => {
    setAnalyzing(true);
    // null gönderiyoruz, çünkü Server Action profildeki mevcut veriyi kullanacak
    const res = await getAstrologyAnalysis(null); 
    
    if (res.success) {
      setData(res.data);
      setIsFreeUser(false);
      toast.success("Analiz tamamlandı!");
    } else {
      // Limit veya Free durumu
      if (res.code === "LIMIT_REACHED" || res.isFreeTier) {
        setIsFreeUser(true);
        // Backend'den gelen MATEMATİKSEL veriyi göster
        if(res.basicData) {
             setData({
                 sun_sign: res.basicData.sun_sign,
                 moon_sign: res.basicData.moon_sign,
                 ascendant_sign: res.basicData.ascendant_sign,
                 character_analysis: "Bu detaylı analiz Premium üyelere özeldir.",
                 career_love: "Bu detaylı analiz Premium üyelere özeldir."
             });
        }
        toast.info(res.error || "Ücretsiz planda sadece temel burçlar görünür.");
      } else {
        toast.error(res.error);
      }
    }
    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex pb-20">
      <Sidebar activeTab="astro" />
      
      {/* Arkaplan */}
      <div className="bg-noise fixed inset-0 opacity-20 pointer-events-none z-0"></div>
      <div className="fixed top-0 left-0 w-full h-[400px] bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none z-0"></div>

      <main className="flex-1 md:pl-24 p-4 md:p-12 relative z-10 w-full">
         <div className="max-w-5xl mx-auto">
            
            {/* Geri Butonu */}
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Astroloji Merkezi
            </button>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <h1 className="text-3xl font-serif font-bold">Doğum Haritası Analizi</h1>
                
                {/* --- PROFİL BİLGİLERİ KARTI --- */}
                {profile && (
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs text-gray-300 backdrop-blur-sm">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-purple-400" />
                            {new Date(profile.birth_date).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="w-px h-3 bg-white/20"></div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-purple-400" />
                            {profile.birth_time?.slice(0, 5)}
                        </div>
                        <div className="w-px h-3 bg-white/20"></div>
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-purple-400" />
                            {profile.birth_city}
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-500 w-8 h-8" /></div>
            ) : data ? (
                // --- 1. GÖRÜNÜM: ANALİZ SONUCU (KAYITLI VERİ) ---
                <div className="space-y-8 animate-in fade-in duration-500">
                    
                    {/* Özet Kartlar (Burçlar) */}
                    <div className="grid md:grid-cols-3 gap-4">
                        {/* Güneş */}
                        <div className="bg-slate-900 p-6 rounded-2xl border border-white/10 flex items-center gap-4 hover:border-yellow-500/30 transition-colors">
                            <div className="p-3 bg-yellow-500/10 rounded-xl">
                                <Sun className="text-yellow-500 w-8 h-8" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 uppercase font-bold">Güneş Burcu</div>
                                <div className="text-2xl font-serif font-bold text-white">{data.sun_sign}</div>
                            </div>
                        </div>
                        {/* Yükselen */}
                        <div className="bg-slate-900 p-6 rounded-2xl border border-white/10 flex items-center gap-4 hover:border-purple-500/30 transition-colors">
                            <div className="p-3 bg-purple-500/10 rounded-xl">
                                <ArrowUpCircle className="text-purple-400 w-8 h-8" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 uppercase font-bold">Yükselen</div>
                                <div className="text-2xl font-serif font-bold text-white">
                                    {isFreeUser && data.ascendant_sign === "Gizli" ? "Gizli" : data.ascendant_sign}
                                </div>
                            </div>
                        </div>
                        {/* Ay */}
                        <div className="bg-slate-900 p-6 rounded-2xl border border-white/10 flex items-center gap-4 hover:border-blue-500/30 transition-colors">
                            <div className="p-3 bg-blue-500/10 rounded-xl">
                                <Moon className="text-blue-400 w-8 h-8" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 uppercase font-bold">Ay Burcu</div>
                                <div className="text-2xl font-serif font-bold text-white">{data.moon_sign || "..."}</div>
                            </div>
                        </div>
                    </div>

                    {/* Detaylı Metinler (AI Analizi) */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 relative overflow-hidden">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-purple-300">
                                <Sparkles className="w-5 h-5" /> Karakter & Ruh
                            </h3>
                            {isFreeUser && !data.character_analysis?.includes(" ") ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <p className="blur-sm select-none text-gray-600 mb-4">Lorem ipsum dolor sit amet character analysis hidden text example.</p>
                                    <Lock className="w-8 h-8 text-purple-500 mb-2"/> 
                                    <p className="text-gray-400 text-sm">Detaylı analiz için Premium'a geç.</p>
                                </div>
                            ) : (
                                <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                                    {data.character_analysis}
                                </p>
                            )}
                        </div>

                        <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 relative overflow-hidden">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-pink-300">
                                <ScrollText className="w-5 h-5" /> Kariyer & Aşk
                            </h3>
                             {isFreeUser && !data.career_love?.includes(" ") ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <p className="blur-sm select-none text-gray-600 mb-4">Lorem ipsum dolor sit amet career analysis hidden text example.</p>
                                    <Lock className="w-8 h-8 text-pink-500 mb-2"/> 
                                    <p className="text-gray-400 text-sm">Detaylı analiz için Premium'a geç.</p>
                                </div>
                            ) : (
                                <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">
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
                    className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[2.5rem] border border-white/10 text-center px-6"
                >
                    <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mb-6">
                        <ScrollText className="w-10 h-10 text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">Haritanı Keşfet</h2>
                    <p className="text-gray-400 max-w-md mb-8">
                        Doğum haritanın matematiksel hesaplamasıyla Güneş, Ay ve Yükselen burcunu öğren. Bu işlem sadece bir kez yapılır.
                    </p>
                    
                    {/* Profil Bilgisi Uyarısı */}
                    {profile && (
                        <div className="mb-8 p-4 bg-purple-900/20 rounded-xl border border-purple-500/30 text-sm text-purple-200">
                            <strong>Analiz edilecek bilgiler:</strong><br/>
                            {profile.birth_city}, {new Date(profile.birth_date).toLocaleDateString('tr-TR')} - {profile.birth_time}
                        </div>
                    )}

                    <button 
                        onClick={handleAnalyze} 
                        disabled={analyzing}
                        className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center gap-3 shadow-lg shadow-purple-500/25"
                    >
                        {analyzing ? <Loader2 className="animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        {analyzing ? "Yıldızlar Hesaplanıyor..." : "Analiz Et ve Kaydet"}
                    </button>
                </motion.div>
            )}

         </div>
      </main>
    </div>
  );
}