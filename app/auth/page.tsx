"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowRight, Lock, Mail, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard"); 
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        alert("Kayıt başarılı! Lütfen e-postanı onayla.");
        setIsLogin(true);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // AuthPage.tsx içindeki fonksiyonu güncelle:

const handleGoogleLogin = async () => {
    // Tarayıcıda olduğumuzdan emin olalım
    if (typeof window === 'undefined') return;
    
    // O anki adres neyse (localhost veya vercel) onu al
    const origin = window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { 
        // URL sonuna 'next' parametresi ekleyerek dashboard'a gitmesini garantiliyoruz
        redirectTo: `${origin}/auth/callback?next=/dashboard`,
      },
    });
    
    if (error) alert(error.message);
};

  return (
    // APP FIX: min-h-screen yerine min-h-[100dvh] (Mobil tarayıcı çubuğu sorunu için)
    <div className="min-h-[100dvh] bg-[#020617] flex items-center justify-center relative overflow-hidden font-sans p-4 select-none">
      
      {/* 1. ATMOSFER: GÜNEŞ TUTULMASI (THE ECLIPSE) */}
      {/* APP FIX: Mobilde boyutları responsive yaptık (w-[80vw]) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[600px] md:h-[600px] bg-black rounded-full shadow-[0_0_80px_20px_rgba(251,191,36,0.15)] z-0">
        {/* Dönen ince altın halka */}
        <div className="absolute inset-[-2px] rounded-full bg-gradient-to-tr from-transparent via-[#fbbf24] to-transparent opacity-40 blur-md animate-spin-slow"></div>
      </div>
      
      {/* 2. CAM KART (CONTAINER) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-[400px] bg-white/5 backdrop-blur-md border border-[#fbbf24]/30 rounded-3xl shadow-2xl p-6 md:p-8 mx-2"
      >
        
        {/* Başlık */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2 tracking-widest">
            {isLogin ? "YOLCULUĞA BAŞLA" : "ARAMIZA KATIL"}
          </h1>
          <p className="text-[#fbbf24]/80 text-[10px] md:text-xs tracking-[0.3em] uppercase">Bilinçaltı Kapısı</p>
        </div>

        {/* Google Butonu (Siyah Cam & Neon Beyaz) */}
        {/* APP FIX: active:scale-95 eklendi (Dokunma hissi) */}
        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-black/50 hover:bg-black/70 border border-white/10 hover:border-white text-white py-3 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_0_0_transparent] hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] group mb-8 active:scale-95"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" alt="Google" />
          <span className="text-sm font-bold tracking-wide">Google ile Bağlan</span>
        </button>

        {/* Ayırıcı */}
        <div className="flex items-center gap-4 mb-8 opacity-40">
           <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white"></div>
           <span className="text-white text-xs font-serif italic">veya</span>
           <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-6 md:space-y-8">
          
          {/* İsim Alanı (Sadece Kayıt) */}
          <AnimatePresence>
            {!isLogin && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="relative group">
                  <input 
                    name="fullName" 
                    type="text" 
                    placeholder="Yolcu Adı" 
                    required={!isLogin}
                    autoComplete="name"
                    // APP FIX: text-base mobilde zoom'u engeller
                    className="w-full bg-transparent border-b border-white/20 py-3 pr-10 text-base md:text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
                  />
                  {/* İkon Sağda */}
                  <User className="absolute right-0 bottom-3 w-5 h-5 text-gray-500 group-focus-within:text-[#8b5cf6] transition-colors" />
                  {/* Alt Neon Çizgi */}
                  <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#8b5cf6] shadow-[0_0_10px_#8b5cf6] group-focus-within:w-full transition-all duration-500"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div className="relative group">
            <input 
              name="email" 
              type="email" 
              placeholder="E-Posta" 
              required
              autoComplete="email"
              inputMode="email" // Telefondaki @ klavyesini açar
              className="w-full bg-transparent border-b border-white/20 py-3 pr-10 text-base md:text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
            />
            <Mail className="absolute right-0 bottom-3 w-5 h-5 text-gray-500 group-focus-within:text-[#8b5cf6] transition-colors" />
            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#8b5cf6] shadow-[0_0_10px_#8b5cf6] group-focus-within:w-full transition-all duration-500"></div>
          </div>

          {/* Şifre */}
          <div className="relative group">
            <input 
              name="password" 
              type={showPassword ? "text" : "password"} 
              placeholder="Şifre" 
              required
              minLength={6}
              autoComplete={isLogin ? "current-password" : "new-password"}
              className="w-full bg-transparent border-b border-white/20 py-3 pr-10 text-base md:text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
            />
            {/* Göz İkonu */}
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 bottom-3 text-gray-500 hover:text-white transition-colors z-10 p-1"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#8b5cf6] shadow-[0_0_10px_#8b5cf6] group-focus-within:w-full transition-all duration-500"></div>
          </div>

          {/* Kozmik Mor Buton */}
          {/* APP FIX: active:scale-95 (Basma hissi) */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#4c1d95] via-[#6d28d9] to-[#4c1d95] bg-[length:200%_auto] animate-gradient text-white font-bold tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(109,40,217,0.4)] hover:shadow-[0_0_40px_rgba(109,40,217,0.6)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                {isLogin ? "KAPIYI AÇ" : "HEMEN BAŞLA"} 
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Alt Geçiş Linki */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-gray-500 text-xs hover:text-[#fbbf24] transition-colors tracking-wider p-2 active:opacity-70"
          >
            {isLogin ? "Henüz bir anahtarın yok mu? Kaydol." : "Anahtarın var mı? Giriş Yap."}
          </button>
        </div>

      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center text-[10px] text-gray-700 font-serif tracking-widest uppercase">
        © 2026 Rüya Yorumcum AI
      </div>

    </div>
  );
}