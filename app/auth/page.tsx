"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { ArrowRight, Mail, User, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Suspense Boundary İçin Form Bileşeni
function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams(); // URL parametresini oku
  const supabase = createClient();

  // URL'de ?mode=signup varsa Kayıt formunu aç
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsLogin(false);
    }
  }, [searchParams]);

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

  const handleGoogleLogin = async () => {
    if (typeof window === 'undefined') return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      alert("Hata: " + error.message);
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="relative z-10 w-full max-w-[400px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl p-8 mx-4 overflow-hidden"
    >
      {/* Kart İçi Işık Efekti */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#fbbf24] to-transparent opacity-50"></div>

      {/* Başlık */}
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2 tracking-wide drop-shadow-md">
          {isLogin ? "GİRİŞ YAP" : "KAYIT OL"}
        </h1>
        <p className="text-[#fbbf24] text-xs tracking-[0.3em] uppercase font-bold">Bilinçaltı Kapısı</p>
      </div>

      {/* Google Butonu */}
      <button 
        onClick={handleGoogleLogin}
        className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 group mb-8 active:scale-95"
      >
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" alt="Google" />
        <span className="text-sm font-bold tracking-wide">Google ile Devam Et</span>
      </button>

      {/* Ayırıcı */}
      <div className="flex items-center gap-4 mb-8 opacity-30">
         <div className="h-[1px] flex-1 bg-white"></div>
         <span className="text-white text-xs font-serif italic">veya</span>
         <div className="h-[1px] flex-1 bg-white"></div>
      </div>

      {/* Form */}
      <form onSubmit={handleAuth} className="space-y-6">
        
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
                  placeholder="Adın Soyadın" 
                  required={!isLogin}
                  className="w-full bg-transparent border-b border-white/20 py-3 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-[#fbbf24] transition-all"
                />
                <User className="absolute right-0 bottom-3 w-5 h-5 text-gray-500 group-focus-within:text-[#fbbf24] transition-colors" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email */}
        <div className="relative group">
          <input 
            name="email" 
            type="email" 
            placeholder="E-Posta Adresin" 
            required
            className="w-full bg-transparent border-b border-white/20 py-3 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-[#fbbf24] transition-all"
          />
          <Mail className="absolute right-0 bottom-3 w-5 h-5 text-gray-500 group-focus-within:text-[#fbbf24] transition-colors" />
        </div>

        {/* Şifre */}
        <div className="relative group">
          <input 
            name="password" 
            type={showPassword ? "text" : "password"} 
            placeholder="Şifren" 
            required
            minLength={6}
            className="w-full bg-transparent border-b border-white/20 py-3 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-[#fbbf24] transition-all"
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 bottom-3 text-gray-500 hover:text-white transition-colors z-10"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Buton */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black font-bold tracking-[0.2em] uppercase shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:shadow-[0_0_50px_rgba(251,191,36,0.5)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
        >
          {loading ? <Loader2 className="animate-spin" /> : (
            <>
              {isLogin ? "GİRİŞ YAP" : "KAYIT OL"} 
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Alt Link */}
      <div className="mt-8 text-center">
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="text-gray-400 text-xs hover:text-[#fbbf24] transition-colors"
        >
          {isLogin ? "Hesabın yok mu? Hemen Kayıt Ol." : "Zaten hesabın var mı? Giriş Yap."}
        </button>
      </div>
    </motion.div>
  );
}

// Ana Sayfa Bileşeni
export default function AuthPage() {
  return (
    <div className="min-h-[100dvh] bg-[#020617] flex items-center justify-center relative overflow-hidden font-sans p-4">
      
      {/* --- GERİ GİT BUTONU --- */}
      <Link href="/" className="absolute top-6 left-6 z-50 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10">
         <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
         <span className="text-xs font-bold uppercase tracking-wider">Ana Sayfa</span>
      </Link>

      {/* --- GELİŞMİŞ GÜNEŞ TUTULMASI EFEKTİ --- */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none">
         {/* Kara Delik (Merkez) */}
         <div className="absolute inset-0 bg-black rounded-full z-10 shadow-[0_0_50px_rgba(0,0,0,1)]"></div>
         
         {/* Altın Taç (Corona) - Animasyonlu */}
         <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#fbbf24] via-[#f59e0b] to-transparent blur-md animate-pulse-slow opacity-80"></div>
         
         {/* Dış Işınlar */}
         <div className="absolute -inset-10 rounded-full bg-[#fbbf24] blur-[100px] opacity-20"></div>
         
         {/* Mor Kozmik Arka Işık */}
         <div className="absolute -inset-40 rounded-full bg-[#4c1d95] blur-[150px] opacity-20 -z-10"></div>
      </div>

      {/* --- FORM (Suspense ile Sarılı) --- */}
      <Suspense fallback={<Loader2 className="text-[#fbbf24] w-10 h-10 animate-spin" />}>
         <AuthForm />
      </Suspense>

      {/* Footer */}
      <div className="absolute bottom-6 text-center text-[10px] text-gray-600 font-serif tracking-widest uppercase">
        © 2026 Rüya Yorumcum AI
      </div>
    </div>
  );
}