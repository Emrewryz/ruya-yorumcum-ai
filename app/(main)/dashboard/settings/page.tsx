"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { TURKEY_CITIES } from "@/constants/cities"; // Şehir verisi
import { 
  User, Save, LogOut, Loader2, Sparkles, Heart, Briefcase, 
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
  
  // Form Verileri
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
        birth_date: formData.birth_date || null,
        birth_time: formData.birth_time || null,
        birth_city: formData.birth_city || null,
        birth_lat: selectedCity ? selectedCity.lat : undefined, 
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
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
        <p className="text-slate-500 text-sm tracking-widest uppercase font-mono animate-pulse">Profil Yükleniyor...</p>
      </div>
    );
  }

  return (
    // İÇ İÇE GEÇMEYİ ENGELLEYEN YENİ LAYOUT (Sidebar'sız, relative yapı)
    <div className="relative w-full flex flex-col items-center min-h-[calc(100vh-6rem)] z-10 pb-20 font-sans selection:bg-purple-500/30">
      
      {/* LOKAL ARKAPLAN EFEKTLERİ */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent pointer-events-none -z-10 transform-gpu"></div>

      {/* HEADER */}
      <div className="w-full max-w-[1200px] px-4 md:px-0 py-6 flex items-center justify-between mt-2 md:mt-4 z-30">
        <button 
           onClick={() => router.back()} 
           className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-bold text-slate-300 hover:text-white uppercase tracking-widest backdrop-blur-md transform-gpu"
        >
          <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">Geri Dön</span>
        </button>
        
        <div className="flex items-center gap-2 px-5 py-2.5 bg-[#131722]/80 backdrop-blur-md rounded-xl border border-white/5 shadow-sm transform-gpu">
           <Settings className="w-4 h-4 text-purple-400" />
           <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-white">Ayarlar</span>
        </div>
      </div>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-0 relative z-10 flex flex-col">
          
        {/* ANA KART */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-[#131722]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden mt-4 md:mt-8 transform-gpu"
        >
          
          {/* Üst Kısım: Avatar ve İsim */}
          <div className="bg-gradient-to-b from-[#0a0c10] to-transparent p-8 md:p-10 text-center relative border-b border-white/5">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30"></div>
             
             <div className="relative w-24 h-24 md:w-28 md:h-28 mx-auto mb-5 group cursor-pointer">
                <div className="absolute inset-0 bg-purple-500 rounded-full blur-[30px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative w-full h-full bg-[#131722] rounded-full border border-white/10 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-purple-500/50 transition-colors">
                   <User className="w-10 h-10 md:w-12 md:h-12 text-slate-500 group-hover:text-purple-400 transition-colors" />
                </div>
             </div>
             
             <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">{formData.full_name || "İsimsiz Yolcu"}</h2>
             
             <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0a0c10] border border-white/5 shadow-inner">
                {userTier === 'free' ? (
                   <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Çırak (Ücretsiz)</span>
                ) : (
                   <>
                      <Crown className={`w-3.5 h-3.5 ${userTier === 'elite' ? 'text-amber-500' : 'text-emerald-500'}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${userTier === 'elite' ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {userTier === 'pro' ? 'Kaşif' : 'Kahin'}
                      </span>
                   </>
                )}
             </div>
          </div>

          {/* Form Alanı */}
          <div className="p-6 md:p-10 space-y-10">
              
              {/* BÖLÜM 1: KİŞİSEL BİLGİLER */}
              <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                         <User className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest">Kişisel Bilgiler</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                      <div className="space-y-2">
                          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest ml-1">Tam İsim</label>
                          <div className="relative group">
                              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                              <input 
                                  type="text" 
                                  value={formData.full_name}
                                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                  className="w-full bg-[#0a0c10] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-600 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all shadow-inner"
                                  placeholder="Adınız Soyadınız"
                              />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest ml-1">Yaş</label>
                          <input 
                              type="number" 
                              value={formData.age}
                              onChange={(e) => setFormData({...formData, age: e.target.value})}
                              className="w-full bg-[#0a0c10] border border-white/5 rounded-2xl py-3.5 px-5 text-sm text-white placeholder-slate-600 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all shadow-inner"
                              placeholder="Örn: 28"
                          />
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest ml-1">İlgi Alanı / Meslek</label>
                          <div className="relative group">
                               <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                               <input 
                                  type="text" 
                                  value={formData.interest_area}
                                  onChange={(e) => setFormData({...formData, interest_area: e.target.value})}
                                  className="w-full bg-[#0a0c10] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-600 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all shadow-inner"
                                  placeholder="Örn: Yazılım, Sanat"
                               />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest ml-1">Medeni Durum</label>
                          <div className="relative group">
                              <Heart className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                              <select 
                                  value={formData.marital_status}
                                  onChange={(e) => setFormData({...formData, marital_status: e.target.value})}
                                  className="w-full bg-[#0a0c10] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none appearance-none cursor-pointer shadow-inner"
                              >
                                  <option value="" className="bg-[#0a0c10]">Seçiniz...</option>
                                  <option value="Single" className="bg-[#0a0c10]">Bekar</option>
                                  <option value="Married" className="bg-[#0a0c10]">Evli</option>
                                  <option value="Relationship" className="bg-[#0a0c10]">İlişkisi Var</option>
                              </select>
                          </div>
                       </div>
                  </div>
              </div>

              <div className="h-px bg-white/5 w-full"></div>

              {/* BÖLÜM 2: ASTROLOJİ BİLGİLERİ */}
              <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                             <Star className="w-4 h-4" />
                          </div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Doğum Haritası</h3>
                      </div>
                      <span className="text-[9px] md:text-[10px] bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-lg border border-amber-500/20 uppercase tracking-widest font-bold hidden md:block">
                          Analiz İçin Gerekli
                      </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                      <div className="space-y-2">
                          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest ml-1">Doğum Tarihi</label>
                          <div className="relative group">
                              <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                              <input 
                                  type="date" 
                                  value={formData.birth_date}
                                  onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                                  className="w-full bg-[#0a0c10] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all [color-scheme:dark] min-h-[52px] shadow-inner"
                              />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest ml-1">Doğum Saati</label>
                          <div className="relative group">
                              <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                              <input 
                                  type="time" 
                                  value={formData.birth_time}
                                  onChange={(e) => setFormData({...formData, birth_time: e.target.value})}
                                  className="w-full bg-[#0a0c10] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all [color-scheme:dark] min-h-[52px] shadow-inner"
                              />
                          </div>
                      </div>
                  </div>

                  <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest ml-1">Doğum Şehri (Türkiye)</label>
                      <div className="relative group">
                          <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                          <select 
                              value={formData.birth_city}
                              onChange={(e) => setFormData({...formData, birth_city: e.target.value})}
                              className="w-full bg-[#0a0c10] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none appearance-none cursor-pointer shadow-inner"
                          >
                              <option value="" className="bg-[#0a0c10]">Şehir Seçiniz</option>
                              {TURKEY_CITIES.map(city => (
                                  <option key={city.id} value={city.name} className="bg-[#0a0c10]">{city.name}</option>
                              ))}
                          </select>
                      </div>
                      <p className="text-[10px] text-slate-500 ml-1 mt-1 font-light">
                          * Şehir ve saat bilgisi Yükselen Burcunuzu (Ascendant) doğru hesaplamak için gereklidir.
                      </p>
                  </div>
              </div>

              <div className="h-px bg-white/5 w-full"></div>

              {/* BÖLÜM 3: BİYOGRAFİ */}
              <div className="space-y-2">
                 <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest ml-1 flex items-center justify-between">
                    <span>Hayat Hikayesi (Opsiyonel)</span>
                    <span className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 flex items-center gap-1">
                       <Sparkles className="w-3 h-3" /> Daha İyi Yorum
                    </span>
                 </label>
                 <div className="relative group">
                    <BookOpen className="absolute left-5 top-4 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                    <textarea 
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full bg-[#0a0c10] border border-white/5 rounded-2xl py-4 pl-12 pr-5 text-sm text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all placeholder-slate-600 min-h-[120px] resize-none shadow-inner"
                      placeholder="Şu anki ruh haliniz, hedefleriniz veya sizi siz yapan şeyler..."
                    />
                 </div>
              </div>

              {/* BUTONLAR */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                 <button 
                   onClick={handleLogout}
                   className="w-full sm:w-1/3 py-4 rounded-2xl border border-red-500/20 text-red-400 font-bold text-xs uppercase tracking-widest hover:bg-red-500/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                 >
                    <LogOut className="w-4 h-4" /> Çıkış Yap
                 </button>
                 
                 <button 
                   onClick={handleSave}
                   disabled={saving}
                   className="w-full sm:w-2/3 py-4 rounded-2xl bg-purple-600 text-white font-bold text-xs uppercase tracking-widest shadow-[0_10px_30px_rgba(139,92,246,0.2)] hover:bg-purple-500 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    {saving ? (
                       <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                       <>
                          <Save className="w-4 h-4" /> Değişiklikleri Kaydet
                       </>
                    )}
                 </button>
              </div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}