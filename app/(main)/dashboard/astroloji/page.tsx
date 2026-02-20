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
    <div className="w-full flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
    </div>
  );

  return (
    // Dışarıdaki gereksiz layout sarmalayıcıları (Sidebar vs.) silindi.
    // Ana layout'un içine doğrudan oturacak relative bir kapsayıcı oluşturuldu.
    <div className="relative w-full flex flex-col justify-center min-h-[calc(100vh-6rem)] z-10">
        
       {/* BU SAYFAYA ÖZEL ARKAPLAN IŞIĞI */}
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/15 via-transparent to-transparent pointer-events-none -z-10"></div>

       {/* EĞER BİLGİLER EKSİKSE: ONBOARDING FORMU */}
       {!isProfileComplete ? (
          <motion.div 
             initial={{ opacity: 0, scale: 0.95, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             transition={{ duration: 0.5 }}
             className="w-full max-w-2xl mx-auto"
          >
             <div className="bg-[#131722]/80 backdrop-blur-2xl border border-white/5 p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                
                {/* Form Glow Effect */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                <div className="text-center mb-10 relative z-10">
                    <div className="w-16 h-16 bg-[#0a0c10] border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Sparkles className="w-7 h-7 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif text-white mb-3">Kozmik İmzanız</h1>
                    <p className="text-slate-400 text-sm font-light leading-relaxed max-w-md mx-auto">
                        Gökyüzünün doğduğunuz andaki fotoğrafını çekebilmemiz için temel koordinatlarınıza ihtiyacımız var.
                    </p>
                </div>

                <div className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Doğum Tarihi */}
                        <div className="space-y-2.5">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 pl-1">Doğum Tarihi</label>
                            <input 
                                type="date" 
                                value={formData.birth_date}
                                onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                                className="w-full bg-[#0a0c10]/50 border border-white/10 hover:border-white/20 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                            />
                        </div>
                        
                        {/* Doğum Saati */}
                        <div className="space-y-2.5 relative">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 pl-1 flex items-center gap-2">
                                Doğum Saati
                                <button onClick={() => setShowTimeInfo(!showTimeInfo)} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                    <Info className="w-3.5 h-3.5" />
                                </button>
                            </label>
                            <div className="relative">
                                <input 
                                    type="time" 
                                    value={formData.birth_time}
                                    onChange={(e) => setFormData({...formData, birth_time: e.target.value})}
                                    className="w-full bg-[#0a0c10]/50 border border-white/10 hover:border-white/20 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                                />
                            </div>

                            {/* Bilgi Kutucuğu */}
                            <AnimatePresence>
                                {showTimeInfo && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                                        className="absolute top-full mt-2 left-0 w-full bg-indigo-950 border border-indigo-500/30 p-4 rounded-xl z-20 shadow-xl"
                                    >
                                        <p className="text-[11px] text-indigo-200 leading-relaxed font-light">
                                            Saati tam bilmiyorsanız tahmini bir aralık girin. <span className="font-medium text-white">Yükselen burcunuzun</span> doğru hesaplanması için bu veri kritiktir.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Doğum Şehri */}
                    <div className="space-y-2.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 pl-1">Doğum Şehri (Türkiye)</label>
                        <div className="relative">
                            <select 
                                value={formData.city}
                                onChange={(e) => setFormData({...formData, city: e.target.value})}
                                className="w-full bg-[#0a0c10]/50 border border-white/10 hover:border-white/20 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-indigo-500 appearance-none transition-colors text-sm cursor-pointer"
                            >
                                <option value="" className="bg-[#0a0c10]">Şehir Seçiniz</option>
                                {TURKEY_CITIES.map(city => (
                                    <option key={city.id} value={city.name} className="bg-[#0a0c10] py-2">{city.name}</option>
                                ))}
                            </select>
                            <MapPin className="absolute right-5 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                        </div>
                    </div>

                    <button 
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="w-full py-4 mt-6 bg-white text-[#0a0c10] font-bold text-sm uppercase tracking-widest rounded-xl transition-all hover:bg-slate-200 disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_5px_20px_rgba(255,255,255,0.1)]"
                    >
                        {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        {saving ? "Hizalanıyor..." : "Haritamı Oluştur"}
                    </button>
                </div>
             </div>
          </motion.div>
       ) : (
           
          // --- BİLGİLER TAMSA: ASTROLOJİ MERKEZİ ---
          <div className="w-full">
             
             {/* HEADER */}
             <motion.div 
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6"
             >
                <div>
                    <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
                        Astroloji Merkezi
                    </h1>
                    <div className="flex items-center gap-3 text-slate-400 font-mono text-xs">
                        <div className="flex items-center gap-1.5 border border-white/10 bg-white/5 px-3 py-1.5 rounded-md">
                            <MapPin className="w-3 h-3 text-indigo-400" /> 
                            {profile.birth_city}
                        </div>
                        <div className="flex items-center gap-1.5 border border-white/10 bg-white/5 px-3 py-1.5 rounded-md">
                            <Calendar className="w-3 h-3 text-indigo-400" /> 
                            {new Date(profile.birth_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                    </div>
                </div>

                {/* PREMIUM KREDİ ROZETİ */}
                <button 
                   onClick={() => router.push('/dashboard/pricing')}
                   className="group px-5 py-2.5 bg-[#131722]/80 backdrop-blur-md rounded-xl text-xs font-bold uppercase tracking-widest border border-amber-500/20 flex items-center gap-3 hover:border-amber-500/40 transition-all shadow-sm"
                >
                   <div className="p-1 rounded bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                      <Coins className="w-4 h-4 text-amber-500" /> 
                   </div>
                   <span className="text-white">{profile.credits} <span className="text-slate-500 font-medium">Kredi</span></span>
                </button>
             </motion.div>

             {/* --- NAVIGATION GRID --- */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 
                 {/* 1. GÜNLÜK BURÇ KARTI */}
                 <motion.div 
                     initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                     onClick={() => router.push('/dashboard/astroloji/gunluk-burc')}
                     className="group relative p-8 rounded-[2rem] bg-[#131722]/80 border border-white/5 hover:border-blue-500/30 cursor-pointer transition-all duration-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.1)] flex flex-col min-h-[260px] overflow-hidden"
                 >
                     <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] group-hover:bg-blue-500/20 transition-colors duration-700 pointer-events-none"></div>

                     <div className="flex justify-between items-start mb-6 relative z-10">
                         <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                             <Star className="w-6 h-6 text-blue-400" />
                         </div>
                         <span className="text-[10px] font-mono text-slate-500 border border-white/5 px-3 py-1.5 rounded-lg bg-black/20">
                             1 KREDİ
                         </span>
                     </div>
                     
                     <div className="relative z-10 mt-auto">
                         <h2 className="text-2xl font-serif text-white mb-3">Günlük Transit Yorumu</h2>
                         <p className="text-slate-400 text-sm leading-relaxed mb-6">
                             Bugünün gezegen açılarının doğum haritana özel etkileri. Şans, ilişkiler ve kariyer enerjileri.
                         </p>
                         <div className="text-blue-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 group-hover:text-blue-300 transition-colors w-fit">
                             Analizi Başlat <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                         </div>
                     </div>
                 </motion.div>

                 {/* 2. DOĞUM HARİTASI KARTI */}
                 <motion.div 
                     initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                     onClick={() => router.push('/dashboard/astroloji/dogum-haritasi')}
                     className="group relative p-8 rounded-[2rem] bg-[#131722]/80 border border-white/5 hover:border-purple-500/30 cursor-pointer transition-all duration-500 hover:shadow-[0_0_40px_rgba(168,85,247,0.1)] flex flex-col min-h-[260px] overflow-hidden"
                 >
                     <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] group-hover:bg-purple-500/20 transition-colors duration-700 pointer-events-none"></div>

                     <div className="flex justify-between items-start mb-6 relative z-10">
                         <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                             <ScrollText className="w-6 h-6 text-purple-400" />
                         </div>
                         <span className="text-[10px] font-mono text-slate-500 border border-white/5 px-3 py-1.5 rounded-lg bg-black/20">
                             5 KREDİ
                         </span>
                     </div>
                     
                     <div className="relative z-10 mt-auto">
                         <h2 className="text-2xl font-serif text-white mb-3">Detaylı Doğum Haritası</h2>
                         <p className="text-slate-400 text-sm leading-relaxed mb-6">
                             Ruhunun yolculuğu, karmik bağların ve potansiyellerin. Kim olduğunu yıldızların dilinden öğren.
                         </p>
                         <div className="text-purple-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 group-hover:text-purple-300 transition-colors w-fit">
                             Haritayı İncele <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                         </div>
                     </div>
                 </motion.div>

                 {/* 3. GELECEK ÖZELLİK (Tam genişlik) */}
                 <motion.div 
                     initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                     className="md:col-span-2 relative p-6 rounded-2xl bg-[#0a0c10] border border-white/5 flex items-center justify-between opacity-50 cursor-not-allowed"
                 >
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-500">
                             <Calendar className="w-5 h-5" />
                         </div>
                         <div>
                             <h3 className="text-lg font-serif text-slate-300">Aylık & Yıllık Öngörüler</h3>
                             <p className="text-xs text-slate-500 mt-1">Kozmik döngüler hazırlanıyor...</p>
                         </div>
                      </div>
                      <span className="px-3 py-1 bg-[#131722] rounded-md text-[10px] font-bold text-slate-500 border border-white/5 uppercase tracking-widest">
                          Yakında
                      </span>
                 </motion.div>

             </div>
          </div>
       )}
    </div>
  );
}