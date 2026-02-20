"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { ArrowRight, Mail, User, Eye, EyeOff, Loader2, ArrowLeft, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- FORM BİLEŞENİ ---
function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 w-full max-w-[360px] bg-[#131722] border border-white/5 rounded-3xl shadow-2xl p-8"
    >
      {/* Kart Başlığı */}
      <div className="text-center mb-6">
        <h1 className="font-serif text-2xl font-bold text-white mb-1 tracking-tight">
          {isLogin ? "Hoş Geldiniz" : "Üyelik Oluştur"}
        </h1>
        <p className="text-slate-400 text-[11px]">
          {isLogin ? "Yolculuğunuza devam edin." : "Sessizliği dinlemeye başlayın."}
        </p>
      </div>

      {/* Google Butonu - Kompakt */}
      <button 
        onClick={handleGoogleLogin}
        className="w-full bg-white text-[#0B0F19] hover:bg-slate-200 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all mb-5 text-sm shadow-md"
      >
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
        <span>Google ile Devam Et</span>
      </button>

      {/* Ayırıcı */}
      <div className="flex items-center gap-3 mb-5 opacity-20">
         <div className="h-[1px] flex-1 bg-white"></div>
         <span className="text-white text-[9px] uppercase tracking-widest">veya</span>
         <div className="h-[1px] flex-1 bg-white"></div>
      </div>

      {/* Form Alanı */}
      <form onSubmit={handleAuth} className="space-y-3">
        
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
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input 
                  name="fullName" 
                  type="text" 
                  placeholder="İsim Soyisim" 
                  required={!isLogin}
                  className="w-full bg-[#0B0F19] border border-white/5 focus:border-[#fbbf24]/50 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-600 text-sm focus:outline-none transition-all"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email */}
        <div className="relative group">
          <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input 
            name="email" 
            type="email" 
            placeholder="E-posta" 
            required
            className="w-full bg-[#0B0F19] border border-white/5 focus:border-[#fbbf24]/50 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-600 text-sm focus:outline-none transition-all"
          />
        </div>

        {/* Şifre */}
        <div className="relative group">
          <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input 
            name="password" 
            type={showPassword ? "text" : "password"} 
            placeholder="Şifre" 
            required
            minLength={6}
            className="w-full bg-[#0B0F19] border border-white/5 focus:border-[#fbbf24]/50 rounded-xl py-2.5 pl-10 pr-10 text-white placeholder-slate-600 text-sm focus:outline-none transition-all"
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Buton - Altın Rengi */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0B0F19] font-bold text-sm tracking-wide shadow-lg hover:shadow-[#fbbf24]/20 transition-all flex items-center justify-center gap-2 mt-2"
        >
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : (
            <>
              {isLogin ? "Giriş Yap" : "Hesap Oluştur"} 
              {!loading && <ArrowRight className="w-4 h-4" />}
            </>
          )}
        </button>
      </form>

      {/* Alt Link */}
      <div className="mt-6 text-center">
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="text-slate-500 text-xs hover:text-[#fbbf24] transition-colors"
        >
          {isLogin ? (
             <>Hesabın yok mu? <span className="text-slate-300 font-semibold ml-1">Kayıt Ol</span></>
          ) : (
             <>Zaten üye misin? <span className="text-slate-300 font-semibold ml-1">Giriş Yap</span></>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// Ana Sayfa Bileşeni
export default function AuthPage() {
  return (
    // ZEMİN: Ana sayfa ile aynı Mat Lacivert (#0B0F19) + Noise Dokusu
    <div className="min-h-[100dvh] bg-[#0B0F19] flex items-center justify-center relative overflow-hidden font-sans p-4 selection:bg-[#fbbf24]/30">
      
      {/* NOISE DOKUSU (Ana Sayfa ile aynı) */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      {/* GERİ GİT BUTONU */}
      <Link href="/" className="absolute top-6 left-6 z-50 flex items-center gap-2 text-slate-500 hover:text-[#fbbf24] transition-colors group px-3 py-1.5 rounded-lg hover:bg-white/5">
         <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
         <span className="text-xs font-bold uppercase tracking-wider">Ana Sayfa</span>
      </Link>

      {/* ARKAPLAN IŞIĞI (Ana Sayfa Hero'su gibi Amber) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#fbbf24]/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* FORM */}
      <Suspense fallback={<div className="w-10 h-10 rounded-full border-2 border-[#fbbf24] border-t-transparent animate-spin"></div>}>
         <AuthForm />
      </Suspense>

      {/* Footer */}
      <div className="absolute bottom-6 text-center text-[10px] text-slate-600 font-medium tracking-widest uppercase">
        © 2026 Rüya Yorumcum AI
      </div>
    </div>
  );
}