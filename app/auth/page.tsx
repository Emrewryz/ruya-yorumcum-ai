"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { ArrowRight, Mail, User, Eye, EyeOff, Loader2, ArrowLeft, Lock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Yönlendirme rotasını al (Örn: /dashboard/tarot)
  const redirectTo = searchParams.get('redirect') || '/dashboard';

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
        router.push(redirectTo); // Kaldığı yere gönder
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
          // Google'dan dönünce de kaldığı yere gitmesi için next parametresini ekliyoruz
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
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
      className="relative z-10 w-full max-w-[380px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl p-8 md:p-10"
    >
      {/* Kart Başlığı */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
           <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-500" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-50 mb-2 tracking-tight">
          {isLogin ? "Hoş Geldiniz" : "Kayıt Olun"}
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-xs font-serif italic">
          {isLogin ? "Kozmik yolculuğunuza devam edin." : "Sessizliği dinlemeye başlayın."}
        </p>
      </div>

      {/* Google Butonu */}
      <button 
        onClick={handleGoogleLogin}
        className="w-full bg-[#faf9f6] dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold py-3 rounded-xl flex items-center justify-center gap-3 transition-all mb-6 text-sm shadow-sm"
      >
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
        <span>Google ile Devam Et</span>
      </button>

      {/* Ayırıcı */}
      <div className="flex items-center gap-3 mb-6 opacity-40">
         <div className="h-px flex-1 bg-stone-400 dark:bg-stone-600"></div>
         <span className="text-stone-500 dark:text-stone-400 text-[10px] uppercase tracking-widest font-bold">veya</span>
         <div className="h-px flex-1 bg-stone-400 dark:bg-stone-600"></div>
      </div>

      {/* Form Alanı */}
      <form onSubmit={handleAuth} className="space-y-4">
        
        {/* İsim Alanı (Sadece Kayıt) */}
        <AnimatePresence>
          {!isLogin && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="relative group pt-1">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500 group-focus-within:text-amber-600 transition-colors" />
                <input 
                  name="fullName" 
                  type="text" 
                  placeholder="İsim Soyisim" 
                  required={!isLogin}
                  className="w-full bg-[#faf9f6] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 focus:border-amber-500/50 rounded-xl py-3 pl-11 pr-4 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-sm focus:outline-none transition-all shadow-inner"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email */}
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500 group-focus-within:text-amber-600 transition-colors" />
          <input 
            name="email" 
            type="email" 
            placeholder="E-posta" 
            required
            className="w-full bg-[#faf9f6] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 focus:border-amber-500/50 rounded-xl py-3 pl-11 pr-4 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-sm focus:outline-none transition-all shadow-inner"
          />
        </div>

        {/* Şifre */}
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500 group-focus-within:text-amber-600 transition-colors" />
          <input 
            name="password" 
            type={showPassword ? "text" : "password"} 
            placeholder="Şifre" 
            required
            minLength={6}
            className="w-full bg-[#faf9f6] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 focus:border-amber-500/50 rounded-xl py-3 pl-11 pr-11 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-sm focus:outline-none transition-all shadow-inner"
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Buton - Editoryal Siyah/Beyaz */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 mt-4"
        >
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : (
            <>
              {isLogin ? "Giriş Yap" : "Hesap Oluştur"} 
              {!loading && <ArrowRight className="w-4 h-4" />}
            </>
          )}
        </button>
      </form>

      {/* Alt Linkler */}
      <div className="mt-8 flex flex-col gap-4 text-center">
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="text-stone-500 text-xs hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
        >
          {isLogin ? (
             <>Hesabın yok mu? <span className="font-bold underline underline-offset-2 ml-1">Kayıt Ol</span></>
          ) : (
             <>Zaten üye misin? <span className="font-bold underline underline-offset-2 ml-1">Giriş Yap</span></>
          )}
        </button>
        
        {/* MİSAFİR GİRİŞ BUTONU */}
        <Link 
           href="/dashboard" 
           className="text-stone-400 dark:text-stone-500 text-[10px] uppercase tracking-widest font-bold hover:text-amber-600 dark:hover:text-amber-500 transition-colors flex items-center justify-center gap-1"
        >
           <User className="w-3 h-3" /> Misafir Olarak Keşfet
        </Link>
      </div>
    </motion.div>
  );
}

// Ana Sayfa Bileşeni
export default function AuthPage() {
  return (
    <div className="min-h-[100dvh] bg-[#faf9f6] dark:bg-stone-950 flex items-center justify-center relative overflow-hidden font-sans p-4 selection:bg-amber-500/20 transition-colors duration-300">
      
      {/* GERİ GİT BUTONU */}
      <Link href="/" className="absolute top-6 left-6 z-50 flex items-center gap-2 text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors group px-3 py-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800">
         <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
         <span className="text-xs font-bold uppercase tracking-wider">Ana Sayfa</span>
      </Link>

      {/* ARKAPLAN IŞIĞI */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* FORM */}
      <Suspense fallback={<Loader2 className="w-8 h-8 text-amber-600 animate-spin" />}>
         <AuthForm />
      </Suspense>

      {/* Footer */}
      <div className="absolute bottom-6 text-center text-[10px] text-stone-400 dark:text-stone-600 font-medium tracking-widest uppercase">
        © 2026 Rüya Yorumcum AI
      </div>
    </div>
  );
}