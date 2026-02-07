"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { TURKEY_CITIES } from "@/constants/cities"; // Şehir verisi
import { 
  User, Edit3, Save, LogOut, Loader2, Sparkles, Heart, Briefcase, Smile, 
  ArrowLeft, BookOpen, Crown, Settings, Calendar, Clock, MapPin, Star
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userTier, setUserTier] = useState("free");
  
  // Form Verileri (Astroloji alanları eklendi)
  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    gender: "",
    marital_status: "",
    interest_area: "",
    bio: "",
    birth_date: "",
    birth_time: "",
    birth_city: ""
  });

  // 1. Mevcut Verileri Çek
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFormData({
          full_name: profile.full_name || "",
          age: profile.age?.toString() || "",
          gender: profile.gender || "",
          marital_status: profile.marital_status || "",
          interest_area: profile.interest_area || "",
          bio: profile.bio || "",
          // Astroloji Verileri
          birth_date: profile.birth_date || "",
          birth_time: profile.birth_time || "",
          birth_city: profile.birth_city || ""
        });
        
        let tier = profile.subscription_tier?.toLowerCase() || 'free';
        if (tier === 'explorer') tier = 'pro';
        if (tier === 'seer') tier = 'elite';
        setUserTier(tier);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [router, supabase]);

  // 2. Verileri Kaydet (Update)
  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (navigator.vibrate) navigator.vibrate(20);

    // Şehir değiştiyse koordinatları da güncelle
    const selectedCity = TURKEY_CITIES.find(c => c.name === formData.birth_city);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        age: parseInt(formData.age) || null,
        gender: formData.gender,
        marital_status: formData.marital_status,
        interest_area: formData.interest_area,
        bio: formData.bio,
        // Astroloji Güncellemeleri
        birth_date: formData.birth_date || null,
        birth_time: formData.birth_time || null,
        birth_city: formData.birth_city || null,
        birth_lat: selectedCity ? selectedCity.lat : undefined, // Şehir varsa güncelle
        birth_lng: selectedCity ? selectedCity.lng : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    setSaving(false);
    
    if (error) {
      toast.error("Hata: Bilgiler kaydedilemedi.");
    } else {
      toast.success("Profilin ve doğum haritası bilgilerin güncellendi! ✨");
      if (document.activeElement instanceof HTMLElement) {
         document.activeElement.blur();
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#8b5cf6]" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#020617] text-white font-sans relative overflow-x-hidden p-4 md:p-12 flex flex-col items-center pb-24">
      
      {/* ATMOSFER */}
      <div className="bg-noise"></div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#8b5cf6]/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* HEADER */}
      <nav className="w-full max-w-2xl flex justify-between items-center mb-8 relative z-20">
        <button onClick={() => router.back()} className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors active:scale-90">
          <ArrowLeft className="w-5 h-5 text-gray-300" />
        </button>
        <h1 className="font-serif text-lg tracking-widest text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#8b5cf6]" /> AYARLAR
        </h1>
        <div className="w-9"></div>
      </nav>

      {/* ANA KART */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-2xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >
        
        {/* Üst Kısım: Avatar ve İsim */}
        <div className="bg-gradient-to-b from-[#0f172a] to-transparent p-8 text-center relative">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent opacity-50"></div>
           
           <div className="relative w-24 h-24 mx-auto mb-4 group cursor-pointer">
              <div className="absolute inset-0 bg-[#8b5cf6] rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative w-full h-full bg-[#020617] rounded-full border border-white/10 flex items-center justify-center overflow-hidden">
                 <User className="w-10 h-10 text-gray-400" />
              </div>
           </div>
           
           <h2 className="text-2xl font-serif font-bold text-white">{formData.full_name || "İsimsiz Yolcu"}</h2>
           
           <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              {userTier === 'free' ? (
                 <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Çırak (Ücretsiz)</span>
              ) : (
                 <>
                    <Crown className={`w-3 h-3 ${userTier === 'elite' ? 'text-amber-400' : 'text-emerald-400'}`} />
                    <span className={`text-xs font-bold uppercase tracking-widest ${userTier === 'elite' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {userTier === 'pro' ? 'Kaşif' : 'Kahin'}
                    </span>
                 </>
              )}
           </div>
        </div>

        {/* Form Alanı */}
        <div className="p-6 md:p-8 space-y-8">
            
            {/* BÖLÜM 1: KİŞİSEL BİLGİLER */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <User className="w-4 h-4 text-[#8b5cf6]" />
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Kişisel Bilgiler</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500 uppercase font-bold ml-1">Tam İsim</label>
                        <input 
                            type="text" 
                            value={formData.full_name}
                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                            className="w-full bg-[#020617]/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#8b5cf6] outline-none transition-all"
                            placeholder="Adınız Soyadınız"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500 uppercase font-bold ml-1">Yaş</label>
                        <input 
                            type="number" 
                            value={formData.age}
                            onChange={(e) => setFormData({...formData, age: e.target.value})}
                            className="w-full bg-[#020617]/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#8b5cf6] outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-xs text-gray-500 uppercase font-bold ml-1">İlgi Alanı / Meslek</label>
                        <div className="relative">
                             <Briefcase className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                             <input 
                                type="text" 
                                value={formData.interest_area}
                                onChange={(e) => setFormData({...formData, interest_area: e.target.value})}
                                className="w-full bg-[#020617]/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-[#8b5cf6] outline-none transition-all"
                                placeholder="Örn: Yazılım"
                             />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs text-gray-500 uppercase font-bold ml-1">Medeni Durum</label>
                        <div className="relative">
                            <Heart className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                            <select 
                                value={formData.marital_status}
                                onChange={(e) => setFormData({...formData, marital_status: e.target.value})}
                                className="w-full bg-[#020617]/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-[#8b5cf6] outline-none appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-[#020617]">Seçiniz...</option>
                                <option value="Single" className="bg-[#020617]">Bekar</option>
                                <option value="Married" className="bg-[#020617]">Evli</option>
                                <option value="Relationship" className="bg-[#020617]">İlişkisi Var</option>
                            </select>
                        </div>
                     </div>
                </div>
            </div>

            <div className="h-px bg-white/5 w-full"></div>

            {/* BÖLÜM 2: ASTROLOJİ BİLGİLERİ (YENİ) */}
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-purple-400" />
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Doğum Haritası Bilgileri</h3>
                    </div>
                    <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-1 rounded border border-purple-500/20">
                        Analiz için Gerekli
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500 uppercase font-bold ml-1">Doğum Tarihi</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                            <input 
                                type="date" 
                                value={formData.birth_date}
                                onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                                className="w-full bg-[#020617]/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-500 outline-none transition-all [color-scheme:dark]"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500 uppercase font-bold ml-1">Doğum Saati</label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                            <input 
                                type="time" 
                                value={formData.birth_time}
                                onChange={(e) => setFormData({...formData, birth_time: e.target.value})}
                                className="w-full bg-[#020617]/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-500 outline-none transition-all [color-scheme:dark]"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase font-bold ml-1">Doğum Şehri</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                        <select 
                            value={formData.birth_city}
                            onChange={(e) => setFormData({...formData, birth_city: e.target.value})}
                            className="w-full bg-[#020617]/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="" className="bg-[#020617]">Şehir Seçiniz</option>
                            {TURKEY_CITIES.map(city => (
                                <option key={city.id} value={city.name} className="bg-[#020617]">{city.name}</option>
                            ))}
                        </select>
                    </div>
                    <p className="text-[10px] text-gray-500 ml-1">
                        * Şehir ve saat bilgisi Yükselen Burcunuzu (Ascendant) doğru hesaplamak için gereklidir.
                    </p>
                </div>
            </div>

            <div className="h-px bg-white/5 w-full"></div>

            {/* BÖLÜM 3: BİYOGRAFİ */}
            <div className="space-y-2">
               <label className="text-xs text-gray-500 uppercase font-bold ml-1 flex items-center justify-between">
                  <span>Hayat Hikayesi (Opsiyonel)</span>
                  <span className="text-[10px] text-[#fbbf24] bg-[#fbbf24]/10 px-2 py-0.5 rounded-full border border-[#fbbf24]/20 flex items-center gap-1">
                     <Sparkles className="w-3 h-3" /> Daha İyi Yorum İçin
                  </span>
               </label>
               <div className="relative">
                  <BookOpen className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full bg-[#020617]/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-base md:text-sm text-white focus:border-[#8b5cf6] outline-none transition-all placeholder-gray-600 min-h-[100px] resize-none"
                    placeholder="Şu anki ruh halin, hedeflerin veya seni sen yapan şeyler..."
                  />
               </div>
            </div>

            {/* Butonlar */}
            <div className="pt-2 flex flex-col md:flex-row gap-4">
               <button 
                 onClick={handleLogout}
                 className="flex-1 py-3.5 rounded-xl border border-red-500/20 text-red-400 font-bold hover:bg-red-500/10 active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                  <LogOut className="w-4 h-4" /> Çıkış Yap
               </button>
               
               <button 
                 onClick={handleSave}
                 disabled={saving}
                 className="flex-[2] py-3.5 rounded-xl bg-[#8b5cf6] text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  {saving ? (
                     <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                     <>
                        <Save className="w-5 h-5" /> Değişiklikleri Kaydet
                     </>
                  )}
               </button>
            </div>

        </div>

      </motion.div>
    </div>
  );
}