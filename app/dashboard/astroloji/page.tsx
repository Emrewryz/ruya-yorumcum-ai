"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { getMoonPhase } from "@/utils/moon"; // Ay fazı utility'niz
import Sidebar from "@/app/dashboard/Sidebar"; 
import { useRouter } from "next/navigation";
import { TURKEY_CITIES } from "@/constants/cities"; // Şehir listesi
import { 
  Sparkles, Moon, MapPin, ArrowRight, Crown, Star, 
  ScrollText, Calendar, Clock, Info, CheckCircle2, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function AstrologyHub() {
  const supabase = createClient();
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentMoon, setCurrentMoon] = useState<any>(null);

  // Form State (Eksik bilgi varsa)
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
        // Formu mevcut verilerle doldur (varsa)
        setFormData({
            birth_date: userProfile.birth_date || "",
            birth_time: userProfile.birth_time || "",
            city: userProfile.birth_city || ""
        });
    }
    setLoading(false);
  };

  // Veri Kaydetme Fonksiyonu
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
          toast.success("Astroloji profiliniz oluşturuldu!");
          // Sayfayı yenilemeye gerek yok, state'i güncelle
          setProfile({
              ...profile,
              birth_date: formData.birth_date,
              birth_time: formData.birth_time,
              birth_city: formData.city
          });
      }
      setSaving(false);
  };

  // Doğum bilgisi tam mı kontrolü
  const isProfileComplete = profile?.birth_date && profile?.birth_time && profile?.birth_city;

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white flex pb-20 overflow-hidden font-sans">
       <Sidebar activeTab="astro" />
       
       {/* Background Effects */}
       <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none z-0 mix-blend-overlay"></div>
       <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/20 via-purple-900/10 to-transparent pointer-events-none z-0"></div>

       <main className="flex-1 md:pl-24 p-4 md:p-12 relative z-10 w-full flex flex-col">
          
          {/* EĞER BİLGİLER EKSİKSE: ONBOARDING FORMU GÖSTER */}
          {!isProfileComplete ? (
             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto w-full my-auto"
             >
                <div className="bg-[#0B0F1F]/80 backdrop-blur-xl border border-indigo-500/30 p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                    
                    {/* Glow Effect */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none"></div>

                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Astroloji Kurulumu</h1>
                        <p className="text-gray-400">
                            Yıldız haritanızı çıkarabilmemiz için doğum bilgilerinize ihtiyacımız var. 
                            <br className="hidden md:block"/> Bu bilgiler sadece analiz hesaplamaları için kullanılır.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Tarih ve Saat */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Doğum Tarihi</label>
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        value={formData.birth_date}
                                        onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 relative">
                                <label className="text-sm font-medium text-gray-300 ml-1 flex items-center gap-2">
                                    Doğum Saati
                                    <button onClick={() => setShowTimeInfo(!showTimeInfo)} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                        <Info className="w-4 h-4" />
                                    </button>
                                </label>
                                <div className="relative">
                                    <input 
                                        type="time" 
                                        value={formData.birth_time}
                                        onChange={(e) => setFormData({...formData, birth_time: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                    <Clock className="absolute right-4 top-3.5 w-5 h-5 text-gray-500 pointer-events-none" />
                                </div>

                                {/* BİLGİ KUTUCUĞU (Neden Önemli?) */}
                                <AnimatePresence>
                                    {showTimeInfo && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-full left-0 w-full mt-2 bg-indigo-900/90 backdrop-blur-md border border-indigo-500/30 p-4 rounded-xl z-20 text-xs text-indigo-100 shadow-xl"
                                        >
                                            <p className="font-bold mb-1 text-white">Neden saat önemli?</p>
                                            <p>Doğum saati, <span className="text-yellow-300">Yükselen Burcunu (Ascendant)</span> ve harita evlerini belirler. Saati yanlış girerseniz; kariyer, aşk ve para evlerinizin hesaplaması kayar ve yorumlar isabetsiz olur.</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Şehir Seçimi */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Doğum Şehri</label>
                            <div className="relative">
                                <select 
                                    value={formData.city}
                                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 appearance-none transition-colors"
                                >
                                    <option value="" className="bg-[#0B0F1F]">Şehir Seçiniz</option>
                                    {TURKEY_CITIES.map(city => (
                                        <option key={city.id} value={city.name} className="bg-[#0B0F1F]">{city.name}</option>
                                    ))}
                                </select>
                                <MapPin className="absolute right-4 top-3.5 w-5 h-5 text-gray-500 pointer-events-none" />
                            </div>
                        </div>

                        <button 
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                            {saving ? "Kaydediliyor..." : "Bilgileri Kaydet ve Devam Et"}
                        </button>
                    </div>
                </div>
             </motion.div>
          ) : (
             
             // --- BİLGİLER TAMSA: DASHBOARD GÖSTER ---
             <div className="max-w-6xl mx-auto w-full">
                
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
                >
                    <div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-300 tracking-tight">
                            Astroloji Merkezi
                        </h1>
                        <div className="flex items-center gap-3 text-indigo-200/60 font-medium">
                            <MapPin className="w-4 h-4 text-indigo-400" /> 
                            <span>{profile.birth_city}</span>
                            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                            <span>{new Date(profile.birth_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="px-5 py-2.5 bg-white/5 backdrop-blur-sm rounded-full text-xs font-bold uppercase border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-colors">
        <Crown className={`w-4 h-4 ${profile.subscription_tier === 'elite' ? 'text-amber-400' : 'text-yellow-400'}`} /> 
        
        {/* Kontrolü güncelledik: Elite mi? Pro mu? Yoksa Free mi? */}
        {profile.subscription_tier === 'elite' 
            ? 'Elite Plan' 
            : (profile.subscription_tier === 'pro' ? 'Premium Üye' : 'Free Plan')
        }
    </div>
                    </div>
                </motion.div>

                {/* --- NAVIGATION GRID --- */}
                <div className="grid md:grid-cols-2 gap-8">
                    
                    {/* 1. GÜNLÜK BURÇ KARTI (Transit Odaklı) */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                        onClick={() => router.push('/dashboard/astroloji/gunluk-burc')}
                        className="group relative h-[320px] p-10 rounded-[2.5rem] bg-[#0f172a] border border-white/5 hover:border-indigo-500/50 cursor-pointer transition-all duration-300 hover:shadow-[0_0_50px_rgba(99,102,241,0.15)] overflow-hidden flex flex-col justify-between"
                    >
                        {/* Background Gradients */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[80px] group-hover:bg-indigo-600/20 transition-colors duration-500"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-[60px]"></div>

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-8 text-indigo-400 group-hover:scale-110 transition-transform duration-300 border border-white/5">
                                <Star className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-3 group-hover:text-indigo-200 transition-colors">Günlük Transit Yorumu</h2>
                            <p className="text-gray-400 leading-relaxed max-w-sm">
                                Bugünün gezegen açılarının senin natal haritana özel etkileri. Şans, aşk ve kariyer analizi.
                            </p>
                        </div>
                        
                        <div className="relative z-10 flex items-center text-indigo-400 font-bold text-sm tracking-widest uppercase group-hover:text-indigo-300 transition-colors">
                            Analizi Başlat <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                        </div>
                    </motion.div>

                    {/* 2. DOĞUM HARİTASI KARTI (Natal) */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        onClick={() => router.push('/dashboard/astroloji/dogum-haritasi')}
                        className="group relative h-[320px] p-10 rounded-[2.5rem] bg-[#0f172a] border border-white/5 hover:border-purple-500/50 cursor-pointer transition-all duration-300 hover:shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden flex flex-col justify-between"
                    >
                        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[80px] group-hover:bg-purple-600/20 transition-colors duration-500"></div>
                        
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-8 text-purple-400 group-hover:scale-110 transition-transform duration-300 border border-white/5">
                                <ScrollText className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors">Detaylı Doğum Haritası</h2>
                            <p className="text-gray-400 leading-relaxed max-w-sm">
                                Ruhunun yolculuğu, element dengen ve potansiyellerin. Kim olduğunu yıldızlardan öğren.
                            </p>
                        </div>

                        <div className="relative z-10 flex items-center text-purple-400 font-bold text-sm tracking-widest uppercase group-hover:text-purple-300 transition-colors">
                            Haritamı İncele <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                        </div>
                    </motion.div>

                    {/* 3. GELECEK ÖZELLİK */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="md:col-span-2 group relative p-8 rounded-[2rem] bg-[#0f172a]/40 border border-white/5 flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity cursor-not-allowed"
                    >
                         <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-400">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-300">Aylık & Yıllık Öngörüler</h3>
                                <p className="text-sm text-gray-500">Çok yakında sizlerle...</p>
                            </div>
                         </div>
                         <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold text-gray-500 border border-white/5">YAKINDA</span>
                    </motion.div>

                </div>
             </div>
          )}
       </main>
    </div>
  );
}