"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { getMoonPhase } from "@/utils/moon"; 
import { useRouter } from "next/navigation";
import { TURKEY_CITIES } from "@/constants/cities"; 
import { 
  Sparkles, MapPin, ArrowRight, Star, 
  ScrollText, Calendar, Clock, Info, CheckCircle2, Loader2, Coins
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function AstrologyHub() {
  const supabase = createClient();
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentMoon, setCurrentMoon] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    birth_date: "",
    birth_time: "",
    city: ""
  });
  const [saving, setSaving] = useState(false);
  const [showTimeInfo, setShowTimeInfo] = useState(false);

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    setCurrentMoon(getMoonPhase());
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (userProfile) {
        setProfile(userProfile);
        setFormData({
            birth_date: userProfile.birth_date || "",
            birth_time: userProfile.birth_time || "",
            city: userProfile.birth_city || ""
        });
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
      if (!formData.birth_date || !formData.birth_time || !formData.city) {
          toast.error("Lütfen tüm alanları doldurun.");
          return;
      }

      setSaving(true);
      const selectedCity = TURKEY_CITIES.find(c => c.name === formData.city);

      const { error } = await supabase.from('profiles').update({
          birth_date: formData.birth_date,
          birth_time: formData.birth_time,
          birth_city: selectedCity?.name,
          birth_lat: selectedCity?.lat,
          birth_lng: selectedCity?.lng
      }).eq('id', profile.id);

      if (error) {
          toast.error("Hata oluştu: " + error.message);
      } else {
          toast.success("Kozmik profiliniz oluşturuldu!");
          setProfile({
              ...profile,
              birth_date: formData.birth_date,
              birth_time: formData.birth_time,
              birth_city: formData.city
          });
      }
      setSaving(false);
  };

  const isProfileComplete = profile?.birth_date && profile?.birth_time && profile?.birth_city;

  if (loading) return (
    <div className="w-full flex items-center justify-center min-h-[60vh] bg-[#faf9f6] dark:bg-transparent transition-colors duration-500">
        <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
    </div>
  );

  return (
    <div className="relative w-full flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] z-10 pb-20 pt-6 md:pt-10 antialiased transition-colors duration-500">
        
       {/* BU SAYFAYA ÖZEL ARKAPLAN IŞIĞI (Çift Tema) */}
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/60 dark:from-indigo-900/15 via-transparent to-transparent pointer-events-none -z-10 transition-colors"></div>

       {/* ================= EĞER BİLGİLER EKSİKSE: ONBOARDING FORMU ================= */}
       {!isProfileComplete ? (
          <motion.div 
             initial={{ opacity: 0, scale: 0.95, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             transition={{ duration: 0.5 }}
             className="w-full max-w-2xl mx-auto px-4 md:px-0"
          >
             <div className="bg-white dark:bg-[#131722]/80 dark:backdrop-blur-2xl border border-stone-200 dark:border-white/5 p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden shadow-lg dark:shadow-2xl transition-colors">
                
                {/* Form Glow Effect */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-100 dark:bg-indigo-500/10 rounded-full blur-[60px] dark:blur-[80px] pointer-events-none transition-colors"></div>

                <div className="text-center mb-8 md:mb-10 relative z-10">
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-[#0a0c10] border border-indigo-100 dark:border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm dark:shadow-inner transition-colors">
                        <Sparkles className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white mb-3 transition-colors">Kozmik İmzanız</h1>
                    <p className="text-stone-500 dark:text-slate-400 text-sm font-light leading-relaxed max-w-md mx-auto transition-colors">
                        Gökyüzünün doğduğunuz andaki fotoğrafını çekebilmemiz için temel koordinatlarınıza ihtiyacımız var.
                    </p>
                </div>

                <div className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Doğum Tarihi */}
                        <div className="space-y-2.5">
                            <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-slate-500 pl-1 transition-colors">Doğum Tarihi</label>
                            <input 
                                type="date" 
                                value={formData.birth_date}
                                onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                                className="w-full bg-stone-50 dark:bg-[#0a0c10]/50 border border-stone-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-white/20 rounded-xl px-4 md:px-5 py-3.5 text-stone-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/10 transition-all text-sm shadow-sm dark:shadow-none"
                            />
                        </div>
                        
                        {/* Doğum Saati */}
                        <div className="space-y-2.5 relative">
                            <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-slate-500 pl-1 flex items-center gap-2 transition-colors">
                                Doğum Saati
                                <button onClick={() => setShowTimeInfo(!showTimeInfo)} className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                                    <Info className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </button>
                            </label>
                            <div className="relative">
                                <input 
                                    type="time" 
                                    value={formData.birth_time}
                                    onChange={(e) => setFormData({...formData, birth_time: e.target.value})}
                                    className="w-full bg-stone-50 dark:bg-[#0a0c10]/50 border border-stone-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-white/20 rounded-xl px-4 md:px-5 py-3.5 text-stone-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/10 transition-all text-sm shadow-sm dark:shadow-none"
                                />
                            </div>

                            {/* Bilgi Kutucuğu (Mobil Optimizeli) */}
                            <AnimatePresence>
                                {showTimeInfo && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                                        className="absolute top-full mt-2 left-0 w-full bg-white dark:bg-indigo-950 border border-stone-200 dark:border-indigo-500/30 p-4 rounded-xl z-20 shadow-xl"
                                    >
                                        <p className="text-[11px] text-stone-600 dark:text-indigo-200 leading-relaxed font-light transition-colors">
                                            Saati tam bilmiyorsanız tahmini bir aralık girin. <span className="font-bold text-stone-900 dark:text-white">Yükselen burcunuzun</span> doğru hesaplanması için bu veri kritiktir.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Doğum Şehri */}
                    <div className="space-y-2.5">
                        <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-slate-500 pl-1 transition-colors">Doğum Şehri (Türkiye)</label>
                        <div className="relative">
                            <select 
                                value={formData.city}
                                onChange={(e) => setFormData({...formData, city: e.target.value})}
                                className="w-full bg-stone-50 dark:bg-[#0a0c10]/50 border border-stone-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-white/20 rounded-xl px-4 md:px-5 py-3.5 text-stone-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/10 appearance-none transition-all text-sm cursor-pointer shadow-sm dark:shadow-none"
                            >
                                <option value="" className="bg-white dark:bg-[#0a0c10] text-stone-500">Şehir Seçiniz</option>
                                {TURKEY_CITIES.map(city => (
                                    <option key={city.id} value={city.name} className="bg-white dark:bg-[#0a0c10] text-stone-900 dark:text-white py-2">{city.name}</option>
                                ))}
                            </select>
                            <MapPin className="absolute right-5 top-3.5 w-4 h-4 text-stone-400 dark:text-slate-500 pointer-events-none transition-colors" />
                        </div>
                    </div>

                    <button 
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="w-full py-4 mt-8 bg-indigo-600 dark:bg-white text-white dark:text-[#0a0c10] font-bold text-sm uppercase tracking-widest rounded-xl transition-all hover:bg-indigo-700 dark:hover:bg-slate-200 disabled:opacity-50 flex items-center justify-center gap-3 shadow-md dark:shadow-[0_5px_20px_rgba(255,255,255,0.1)]"
                    >
                        {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        {saving ? "Hizalanıyor..." : "Haritamı Oluştur"}
                    </button>
                </div>
             </div>
          </motion.div>
       ) : (
           
          // ================= BİLGİLER TAMSA: ASTROLOJİ MERKEZİ DASHBOARD =================
          <div className="w-full max-w-4xl mx-auto px-4 md:px-0">
             
             {/* HEADER */}
             <motion.div 
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6"
             >
                <div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 dark:text-white mb-4 transition-colors">
                        Astroloji Merkezi
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-stone-500 dark:text-slate-400 font-mono text-xs transition-colors">
                        <div className="flex items-center gap-1.5 border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 rounded-md shadow-sm dark:shadow-none">
                            <MapPin className="w-3 h-3 text-indigo-500 dark:text-indigo-400" /> 
                            {profile.birth_city}
                        </div>
                        <div className="flex items-center gap-1.5 border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 rounded-md shadow-sm dark:shadow-none">
                            <Calendar className="w-3 h-3 text-indigo-500 dark:text-indigo-400" /> 
                            {new Date(profile.birth_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                    </div>
                </div>

                {/* PREMIUM KREDİ ROZETİ */}
                <button 
                   onClick={() => router.push('/dashboard/pricing')}
                   className="group px-5 py-2.5 bg-white dark:bg-[#131722]/80 dark:backdrop-blur-md rounded-xl text-xs font-bold uppercase tracking-widest border border-stone-200 dark:border-amber-500/20 flex items-center gap-3 hover:border-amber-400 dark:hover:border-amber-500/40 transition-all shadow-sm"
                >
                   <div className="p-1 rounded bg-amber-50 dark:bg-amber-500/10 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20 transition-colors">
                      <Coins className="w-4 h-4 text-amber-500" /> 
                   </div>
                   <span className="text-stone-900 dark:text-white">{profile.credits} <span className="text-stone-400 dark:text-slate-500 font-medium">Kredi</span></span>
                </button>
             </motion.div>

             {/* --- NAVIGATION GRID --- */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 
                 {/* 1. GÜNLÜK BURÇ KARTI */}
                 <motion.div 
                     initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                     onClick={() => router.push('/dashboard/astroloji/gunluk-burc')}
                     className="group relative p-6 md:p-8 rounded-[2rem] bg-white dark:bg-[#131722]/80 border border-stone-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 cursor-pointer transition-all duration-500 hover:shadow-lg dark:hover:shadow-[0_0_40px_rgba(59,130,246,0.1)] flex flex-col min-h-[260px] overflow-hidden shadow-sm"
                 >
                     <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100/50 dark:bg-blue-500/10 rounded-full blur-[60px] dark:blur-[80px] group-hover:bg-blue-200/50 dark:group-hover:bg-blue-500/20 transition-colors duration-700 pointer-events-none"></div>

                     <div className="flex justify-between items-start mb-6 relative z-10">
                         <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors">
                             <Star className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                         </div>
                         <span className="text-[10px] font-mono font-bold text-stone-500 dark:text-slate-400 border border-stone-200 dark:border-white/5 px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-black/20 shadow-sm dark:shadow-none transition-colors">
                             1 KREDİ
                         </span>
                     </div>
                     
                     <div className="relative z-10 mt-auto">
                         <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-900 dark:text-white mb-3 transition-colors">Günlük Transit Yorumu</h2>
                         <p className="text-stone-500 dark:text-slate-400 text-sm leading-relaxed mb-6 transition-colors">
                             Bugünün gezegen açılarının doğum haritana özel etkileri. Şans, ilişkiler ve kariyer enerjileri.
                         </p>
                         <div className="text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors w-fit">
                             Analizi Başlat <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                         </div>
                     </div>
                 </motion.div>

                 {/* 2. DOĞUM HARİTASI KARTI */}
                 <motion.div 
                     initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                     onClick={() => router.push('/dashboard/astroloji/dogum-haritasi')}
                     className="group relative p-6 md:p-8 rounded-[2rem] bg-white dark:bg-[#131722]/80 border border-stone-200 dark:border-white/5 hover:border-purple-300 dark:hover:border-purple-500/30 cursor-pointer transition-all duration-500 hover:shadow-lg dark:hover:shadow-[0_0_40px_rgba(168,85,247,0.1)] flex flex-col min-h-[260px] overflow-hidden shadow-sm"
                 >
                     <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-100/50 dark:bg-purple-500/10 rounded-full blur-[60px] dark:blur-[80px] group-hover:bg-purple-200/50 dark:group-hover:bg-purple-500/20 transition-colors duration-700 pointer-events-none"></div>

                     <div className="flex justify-between items-start mb-6 relative z-10">
                         <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 group-hover:bg-purple-100 dark:group-hover:bg-purple-500/20 transition-colors">
                             <ScrollText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                         </div>
                         <span className="text-[10px] font-mono font-bold text-stone-500 dark:text-slate-400 border border-stone-200 dark:border-white/5 px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-black/20 shadow-sm dark:shadow-none transition-colors">
                             5 KREDİ
                         </span>
                     </div>
                     
                     <div className="relative z-10 mt-auto">
                         <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-900 dark:text-white mb-3 transition-colors">Detaylı Doğum Haritası</h2>
                         <p className="text-stone-500 dark:text-slate-400 text-sm leading-relaxed mb-6 transition-colors">
                             Ruhunun yolculuğu, karmik bağların ve potansiyellerin. Kim olduğunu yıldızların dilinden öğren.
                         </p>
                         <div className="text-purple-600 dark:text-purple-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors w-fit">
                             Haritayı İncele <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                         </div>
                     </div>
                 </motion.div>

                 {/* 3. GELECEK ÖZELLİK (Tam genişlik - Yakında) */}
                 <motion.div 
                     initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                     className="md:col-span-2 relative p-5 md:p-6 rounded-2xl bg-stone-50 dark:bg-[#0a0c10] border border-stone-200 dark:border-white/5 flex items-center justify-between opacity-70 dark:opacity-50 cursor-not-allowed transition-colors"
                 >
                      <div className="flex items-center gap-4 md:gap-5">
                         <div className="w-12 h-12 bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-xl flex items-center justify-center text-stone-400 dark:text-slate-500 shadow-sm dark:shadow-none transition-colors">
                             <Calendar className="w-5 h-5" />
                         </div>
                         <div>
                             <h3 className="text-base md:text-lg font-serif font-bold text-stone-700 dark:text-slate-300 transition-colors">Aylık & Yıllık Öngörüler</h3>
                             <p className="text-xs text-stone-400 dark:text-slate-500 mt-1 transition-colors">Kozmik döngüler hazırlanıyor...</p>
                         </div>
                      </div>
                      <span className="px-3 py-1.5 bg-white dark:bg-[#131722] rounded-md text-[10px] font-bold text-stone-400 dark:text-slate-500 border border-stone-200 dark:border-white/5 uppercase tracking-widest shadow-sm dark:shadow-none transition-colors">
                          Yakında
                      </span>
                 </motion.div>

             </div>
          </div>
       )}
    </div>
  );
}