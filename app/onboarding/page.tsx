"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Heart, User, Sparkles, Moon, Brain, Scale, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Form Verileri
  const [formData, setFormData] = useState({
    full_name: "",
    age: 25,
    gender: "",
    marital_status: "",
    interest_area: "Karma"
  });

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Veritabanına Kayıt
  const completeOnboarding = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            age: formData.age,
            gender: formData.gender,
            marital_status: formData.marital_status,
            interest_area: formData.interest_area,
          })
          .eq('id', user.id);

        if (error) throw error;

        // ANIMASYON BAŞLAT
        setIsExploding(true);
        
        // 2.5 saniye sonra dashboard'a at
        setTimeout(() => {
          router.push("/dashboard");
        }, 2500);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // EKRANLAR
  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center relative overflow-hidden font-sans px-4">
      
      {/* FINAL PATLAMA EFEKTİ */}
      <AnimatePresence>
        {isExploding && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 50, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-white z-50 flex items-center justify-center"
          >
             <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-black text-[2px] font-serif font-bold"
             >
                HOŞ GELDİN
             </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Arka Plan */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

      {/* TAKIMYILDIZ PROGRESS BAR (Mobilde yukarı alındı) */}
      {!isExploding && (
        <div className="absolute top-8 md:top-12 flex items-center gap-2 md:gap-4 z-20">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`relative flex items-center justify-center w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-500 ${step >= s ? "bg-[#fbbf24] shadow-[0_0_10px_#fbbf24]" : "bg-gray-800"}`}>
                {step === s && <div className="absolute w-6 h-6 md:w-8 md:h-8 rounded-full border border-[#fbbf24]/30 animate-ping"></div>}
              </div>
              {s !== 3 && (
                <div className={`w-8 md:w-16 h-[1px] mx-1 md:mx-2 transition-all duration-700 ${step > s ? "bg-[#fbbf24]" : "bg-gray-800"}`}></div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ANA İÇERİK KARTLARI */}
      {!isExploding && (
      <div className="w-full max-w-2xl relative z-10 min-h-[60vh] flex items-center justify-center py-10">
        
        {/* ADIM 1: KİMLİK */}
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="text-center w-full"
          >
            {/* Mobilde font boyutu düşürüldü */}
            <h2 className="font-serif text-2xl md:text-4xl mb-8 md:mb-12 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 leading-tight">
              Sana nasıl hitap etmeliyiz,<br /> yolcu?
            </h2>
            
            {/* İsim Input */}
            <input 
              type="text" 
              placeholder="İsmin..."
              value={formData.full_name}
              onChange={(e) => updateForm("full_name", e.target.value)}
              className="w-full bg-transparent text-center text-3xl md:text-5xl font-serif text-[#fbbf24] placeholder-gray-800 border-none outline-none focus:placeholder-transparent transition-all mb-8 md:mb-12"
              autoFocus
            />

            {/* Yaş Seçimi */}
            <div className="mb-8 md:mb-12">
               <p className="text-gray-500 text-xs md:text-sm mb-4 uppercase tracking-widest">Dünyadaki Yılın (Yaş)</p>
               <input 
                 type="range" min="10" max="90" 
                 value={formData.age} 
                 onChange={(e) => updateForm("age", parseInt(e.target.value))}
                 className="w-full max-w-xs accent-[#fbbf24] h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
               />
               <div className="mt-4 text-3xl md:text-4xl font-bold text-white">{formData.age}</div>
            </div>

            <button 
              onClick={() => formData.full_name && setStep(2)}
              className="mx-auto w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/10 hover:bg-[#fbbf24] hover:text-black flex items-center justify-center transition-all group"
            >
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {/* ADIM 2: ÖZ (Cinsiyet & Medeni Hal) */}
        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
            className="text-center w-full"
          >
            <h2 className="font-serif text-2xl md:text-3xl mb-8 md:mb-10">Özünü Tanımla</h2>
            
            {/* Cinsiyet - Mobilde daha kompakt */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-10">
               {['Kadın', 'Erkek', 'Diğer'].map((g) => (
                 <button
                   key={g}
                   onClick={() => updateForm("gender", g)}
                   className={`p-3 md:p-6 rounded-2xl border transition-all duration-300 ${formData.gender === g ? "bg-[#8b5cf6]/20 border-[#8b5cf6] shadow-[0_0_20px_rgba(139,92,246,0.3)]" : "bg-white/5 border-white/10 hover:border-white/30"}`}
                 >
                    <User className={`w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 ${formData.gender === g ? "text-[#8b5cf6]" : "text-gray-400"}`} />
                    <span className="text-xs md:text-sm font-bold">{g}</span>
                 </button>
               ))}
            </div>

            {/* Medeni Hal */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8 md:mb-12">
               {['Bekar', 'İlişkisi Var', 'Evli'].map((s) => (
                 <button
                   key={s}
                   onClick={() => updateForm("marital_status", s)}
                   className={`h-20 md:h-24 rounded-xl border relative overflow-hidden transition-all ${formData.marital_status === s ? "border-[#fbbf24]" : "border-white/10 bg-black"}`}
                 >
                    {formData.marital_status === s && <div className="absolute inset-0 bg-[#fbbf24]/10"></div>}
                    <div className="relative z-10 flex flex-col items-center justify-center h-full px-1">
                       <Heart className={`w-4 h-4 md:w-5 md:h-5 mb-2 ${formData.marital_status === s ? "text-[#fbbf24] fill-[#fbbf24]" : "text-gray-600"}`} />
                       <span className="text-[10px] md:text-xs whitespace-nowrap">{s}</span>
                    </div>
                 </button>
               ))}
            </div>

            <button 
              onClick={() => formData.gender && formData.marital_status && setStep(3)}
              className="mx-auto w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/10 hover:bg-[#fbbf24] hover:text-black flex items-center justify-center transition-all"
            >
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </motion.div>
        )}

        {/* ADIM 3: NİYET (Terazi) - Mobilde alt alta sıralandı */}
        {step === 3 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center w-full"
          >
            <h2 className="font-serif text-2xl md:text-3xl mb-3 md:mb-4">Rehberlik Seçimi</h2>
            <p className="text-gray-400 text-sm md:text-base mb-8 md:mb-10">Rüyalarını hangi ışık altında inceleyelim?</p>

            {/* FLEX COL MOBILE, FLEX ROW DESKTOP */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-8 md:mb-12">
               {/* Sol: Manevi */}
               <button 
                 onClick={() => updateForm("interest_area", "Dini")}
                 className={`flex-1 p-6 md:p-8 rounded-2xl md:rounded-3xl border transition-all ${formData.interest_area === "Dini" ? "bg-emerald-900/30 border-emerald-500 scale-105 ring-2 ring-emerald-500/20" : "bg-white/5 border-white/10 opacity-60"}`}
               >
                  <Moon className="w-8 h-8 md:w-10 md:h-10 text-emerald-400 mx-auto mb-3 md:mb-4" />
                  <h3 className="font-bold text-emerald-400 text-lg">Maneviyat</h3>
                  <p className="text-xs text-gray-400 mt-2">Dini ve tasavvufi işaretler.</p>
               </button>

               {/* Orta: Denge (Mobilde ara buton, Desktopta kare buton) */}
               <button 
                  onClick={() => updateForm("interest_area", "Karma")}
                  className={`mx-auto w-full md:w-24 h-12 md:h-auto flex items-center justify-center rounded-xl md:rounded-2xl border transition-all ${formData.interest_area === "Karma" ? "bg-[#8b5cf6]/30 border-[#8b5cf6] scale-105 md:scale-110 shadow-[0_0_20px_#8b5cf6]" : "bg-white/5 border-white/10 opacity-60"}`}
               >
                  <div className="flex md:flex-col items-center gap-2 md:gap-0">
                     <Scale className="w-5 h-5 md:w-8 md:h-8 text-white" />
                     <span className="md:hidden text-sm font-bold text-white">Karma (Dengeli)</span>
                  </div>
               </button>

               {/* Sağ: Bilim */}
               <button 
                 onClick={() => updateForm("interest_area", "Psikolojik")}
                 className={`flex-1 p-6 md:p-8 rounded-2xl md:rounded-3xl border transition-all ${formData.interest_area === "Psikolojik" ? "bg-blue-900/30 border-blue-500 scale-105 ring-2 ring-blue-500/20" : "bg-white/5 border-white/10 opacity-60"}`}
               >
                  <Brain className="w-8 h-8 md:w-10 md:h-10 text-blue-400 mx-auto mb-3 md:mb-4" />
                  <h3 className="font-bold text-blue-400 text-lg">Psikoloji</h3>
                  <p className="text-xs text-gray-400 mt-2">Bilinçaltı ve bilimsel analiz.</p>
               </button>
            </div>

            <button 
              onClick={completeOnboarding}
              disabled={loading}
              className="w-full max-w-md mx-auto py-3 md:py-4 rounded-xl bg-[#fbbf24] text-black font-bold tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2 text-sm md:text-base shadow-lg shadow-[#fbbf24]/20"
            >
               {loading ? <Loader2 className="animate-spin" /> : "RİTÜELİ TAMAMLA"}
            </button>

          </motion.div>
        )}
      </div>
      )}
    </div>
  );
}