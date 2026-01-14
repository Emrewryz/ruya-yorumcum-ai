"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  User, Edit3, Save, LogOut, Loader2, Sparkles, Heart, Briefcase, Smile, ArrowLeft, BookOpen
} from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form Verileri
  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    gender: "",
    marital_status: "",
    interest_area: "",
    bio: "" // YENİ EKLENDİ
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
          bio: profile.bio || "" // YENİ
        });
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

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        age: parseInt(formData.age) || null,
        gender: formData.gender,
        marital_status: formData.marital_status,
        interest_area: formData.interest_area,
        bio: formData.bio, // YENİ
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    setSaving(false);
    
    if (error) {
      alert("Hata: Bilgiler kaydedilemedi.");
    } else {
      // Başarılıysa Dashboard'a yönlendir
      router.push('/dashboard');
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
    <div className="min-h-screen bg-[#020617] text-white font-sans relative overflow-x-hidden p-6 md:p-12 flex flex-col items-center justify-center">
      
      {/* ATMOSFER */}
      <div className="bg-noise"></div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#8b5cf6]/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* GERİ DÖN BUTONU (SOL ÜST) */}
      <button 
        onClick={() => router.back()} 
        className="absolute top-6 left-6 md:top-10 md:left-10 z-50 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-2 group"
      >
         <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white" />
         <span className="text-sm font-bold text-gray-400 group-hover:text-white hidden md:inline">Geri Dön</span>
      </button>

      {/* ANA KART */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-2xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden mt-12 md:mt-0"
      >
        
        {/* Üst Kısım: Avatar ve İsim */}
        <div className="bg-gradient-to-b from-[#0f172a] to-transparent p-8 text-center relative">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent opacity-50"></div>
           
           <div className="relative w-24 h-24 mx-auto mb-4 group cursor-pointer">
              <div className="absolute inset-0 bg-[#8b5cf6] rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative w-full h-full bg-[#020617] rounded-full border border-white/10 flex items-center justify-center overflow-hidden">
                 <User className="w-10 h-10 text-gray-400" />
              </div>
              <div className="absolute bottom-0 right-0 p-1.5 bg-[#8b5cf6] rounded-full border border-[#020617]">
                 <Edit3 className="w-3 h-3 text-white" />
              </div>
           </div>
           
           <h2 className="text-2xl font-serif font-bold text-white">{formData.full_name || "İsimsiz Yolcu"}</h2>
           <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">Rüya Gezgini Profili</p>
        </div>

        {/* Form Alanı */}
        <div className="p-8 space-y-8">
           
           {/* 1. Satır: İsim & Yaş */}
           <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-xs text-gray-400 uppercase font-bold tracking-wider ml-1">Tam İsim</label>
                 <div className="relative group">
                    <User className="absolute left-4 top-3.5 w-4 h-4 text-gray-500 group-focus-within:text-[#8b5cf6] transition-colors" />
                    <input 
                      type="text" 
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="w-full bg-[#020617]/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-[#8b5cf6] outline-none transition-all placeholder-gray-600"
                      placeholder="Adınız Soyadınız"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-xs text-gray-400 uppercase font-bold tracking-wider ml-1">Yaş</label>
                 <div className="relative group">
                    <Sparkles className="absolute left-4 top-3.5 w-4 h-4 text-gray-500 group-focus-within:text-[#8b5cf6] transition-colors" />
                    <input 
                      type="number" 
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="w-full bg-[#020617]/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-[#8b5cf6] outline-none transition-all placeholder-gray-600"
                      placeholder="Örn: 25"
                    />
                 </div>
              </div>
           </div>

           {/* 2. Satır: Medeni Durum & Cinsiyet */}
           <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-xs text-gray-400 uppercase font-bold tracking-wider ml-1">Medeni Durum</label>
                 <div className="relative group">
                    <Heart className="absolute left-4 top-3.5 w-4 h-4 text-gray-500 group-focus-within:text-[#8b5cf6] transition-colors" />
                    <select 
                      value={formData.marital_status}
                      onChange={(e) => setFormData({...formData, marital_status: e.target.value})}
                      className="w-full bg-[#020617]/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-[#8b5cf6] outline-none transition-all appearance-none cursor-pointer"
                    >
                       <option value="" className="bg-[#020617]">Seçiniz...</option>
                       <option value="Single" className="bg-[#020617]">Bekar</option>
                       <option value="Married" className="bg-[#020617]">Evli</option>
                       <option value="Relationship" className="bg-[#020617]">İlişkisi Var</option>
                       <option value="Complicated" className="bg-[#020617]">Karmaşık</option>
                    </select>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-xs text-gray-400 uppercase font-bold tracking-wider ml-1">Cinsiyet</label>
                 <div className="relative group">
                    <Smile className="absolute left-4 top-3.5 w-4 h-4 text-gray-500 group-focus-within:text-[#8b5cf6] transition-colors" />
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full bg-[#020617]/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-[#8b5cf6] outline-none transition-all appearance-none cursor-pointer"
                    >
                       <option value="" className="bg-[#020617]">Seçiniz...</option>
                       <option value="Male" className="bg-[#020617]">Erkek</option>
                       <option value="Female" className="bg-[#020617]">Kadın</option>
                       <option value="Other" className="bg-[#020617]">Belirtmek İstemiyorum</option>
                    </select>
                 </div>
              </div>
           </div>

           {/* 3. Satır: İlgi Alanı / Meslek */}
           <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase font-bold tracking-wider ml-1">İlgi Alanı / Meslek</label>
              <div className="relative group">
                 <Briefcase className="absolute left-4 top-3.5 w-4 h-4 text-gray-500 group-focus-within:text-[#8b5cf6] transition-colors" />
                 <input 
                   type="text" 
                   value={formData.interest_area}
                   onChange={(e) => setFormData({...formData, interest_area: e.target.value})}
                   className="w-full bg-[#020617]/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-[#8b5cf6] outline-none transition-all placeholder-gray-600"
                   placeholder="Örn: Yazılım, Sanat, Öğrenci..."
                 />
              </div>
           </div>

           {/* 4. Satır: HAYAT HİKAYESİ (YENİ) */}
           <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase font-bold tracking-wider ml-1 flex items-center justify-between">
                 <span>Hayatından Bahset (Opsiyonel)</span>
                 <span className="text-[10px] text-[#fbbf24] bg-[#fbbf24]/10 px-2 py-0.5 rounded-full border border-[#fbbf24]/20 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Daha İyi Yorum İçin
                 </span>
              </label>
              <div className="relative group">
                 <BookOpen className="absolute left-4 top-3.5 w-4 h-4 text-gray-500 group-focus-within:text-[#8b5cf6] transition-colors" />
                 <textarea 
                   value={formData.bio}
                   onChange={(e) => setFormData({...formData, bio: e.target.value})}
                   className="w-full bg-[#020617]/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-[#8b5cf6] outline-none transition-all placeholder-gray-600 min-h-[100px] resize-none"
                   placeholder="Şu anki ruh halin, yaşadığın önemli olaylar veya seni sen yapan şeyler..."
                 />
              </div>
              <p className="text-[10px] text-gray-500 ml-1 leading-relaxed">
                 * Bu bilgiler yapay zekaya bağlam kazandırır. Örneğin "iş arıyorum" dersen, rüyandaki fırsatları ona göre yorumlar.
              </p>
           </div>

           {/* Butonlar */}
           <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row gap-4">
              <button 
                onClick={handleLogout}
                className="flex-1 py-3 rounded-xl border border-red-500/20 text-red-400 font-bold hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
              >
                 <LogOut className="w-4 h-4" /> Çıkış Yap
              </button>
              
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex-[2] py-3 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                 ) : (
                    <>
                       <Save className="w-5 h-5" /> Kaydet ve Devam Et
                    </>
                 )}
              </button>
           </div>

        </div>

      </motion.div>
    </div>
  );
}