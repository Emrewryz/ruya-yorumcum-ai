"use client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Moon, Loader2, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

// ─── Form içeriği (useSearchParams kullandığı için Suspense içinde) ───────────

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Mode değişince hata temizle
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [mode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh();

      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setSuccess("Hesabınız oluşturuldu. E-posta adresinizi onaylayın.");
      }
    } catch (err: any) {
      const msg = err?.message ?? "Bir hata oluştu.";
      if (msg.includes("Invalid login credentials")) {
        setError("E-posta veya şifre hatalı.");
      } else if (msg.includes("User already registered")) {
        setError("Bu e-posta zaten kayıtlı. Giriş yapmayı deneyin.");
      } else if (msg.includes("Password should be at least")) {
        setError("Şifre en az 6 karakter olmalıdır.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-10 group">
        <Moon className="h-4 w-4 text-zinc-900" strokeWidth={1.5} />
        <span className="text-sm font-bold text-zinc-900">Rüya Yorumcum</span>
      </Link>

      {/* Kart */}
      <div className="w-full max-w-sm">

        {/* Başlık */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            {mode === "login" ? "Giriş yapın" : "Hesap oluşturun"}
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            {mode === "login"
              ? "Analizlerinize devam etmek için giriş yapın."
              : "Ücretsiz hesap açın, ilk analiz hediyemiz."}
          </p>
        </div>

        {/* Google butonu */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="
            mb-5 flex w-full items-center justify-center gap-3
            rounded-xl border border-zinc-200 bg-white px-4 py-2.5
            text-sm font-medium text-zinc-700
            shadow-sm transition-all hover:bg-zinc-50 hover:border-zinc-300
            disabled:opacity-50
          "
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google ile devam et
        </button>

        {/* Ayırıcı */}
        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-zinc-50 px-3 text-xs text-zinc-400">veya e-posta ile</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Ad Soyad — sadece signup'ta */}
          {mode === "signup" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600">
                Ad Soyad
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Adınız"
                required
                className="
                  w-full rounded-xl border border-zinc-200 bg-white
                  px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400
                  focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400
                  transition-all
                "
              />
            </div>
          )}

          {/* E-posta */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600">
              E-posta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              required
              className="
                w-full rounded-xl border border-zinc-200 bg-white
                px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400
                focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400
                transition-all
              "
            />
          </div>

          {/* Şifre */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600">
              Şifre
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "En az 6 karakter" : "Şifreniz"}
                required
                minLength={6}
                className="
                  w-full rounded-xl border border-zinc-200 bg-white
                  px-3.5 py-2.5 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400
                  focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400
                  transition-all
                "
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                tabIndex={-1}
              >
                {showPassword
                  ? <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                  : <Eye className="h-4 w-4" strokeWidth={1.5} />
                }
              </button>
            </div>
          </div>

          {/* Hata / Başarı mesajı */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" strokeWidth={1.5} />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-700">
              <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" strokeWidth={1.5} />
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="
              mt-1 flex w-full items-center justify-center gap-2
              rounded-xl bg-zinc-900 px-4 py-2.5
              text-sm font-semibold text-white
              transition-all hover:bg-zinc-800
              disabled:opacity-50 disabled:cursor-not-allowed
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2
            "
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "Giriş Yap" : "Hesap Oluştur"}
          </button>
        </form>

        {/* Mod değiştir */}
        <p className="mt-6 text-center text-xs text-zinc-500">
          {mode === "login" ? (
            <>
              Hesabınız yok mu?{" "}
              <button
                onClick={() => setMode("signup")}
                className="font-semibold text-zinc-900 hover:underline underline-offset-2"
              >
                Kayıt olun
              </button>
            </>
          ) : (
            <>
              Zaten hesabınız var mı?{" "}
              <button
                onClick={() => setMode("login")}
                className="font-semibold text-zinc-900 hover:underline underline-offset-2"
              >
                Giriş yapın
              </button>
            </>
          )}
        </p>

      </div>
    </div>
  );
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}