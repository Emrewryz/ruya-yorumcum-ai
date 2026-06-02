"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";

// ─── Tipler ───────────────────────────────────────────────────────────────────

interface TestOption {
  label: string;
  value: string;
  score: number;
}

interface TestQuestion {
  id: number;
  question: string;
  options: TestOption[];
}

interface TestResult {
  min: number;
  max: number;
  title: string;
  description: string;
}

interface ViralTest {
  slug:        string;
  title:       string;
  description: string | null;
  content: {
    questions: TestQuestion[];
    results:   TestResult[];
  };
}

type Phase = "quiz" | "loading" | "result";

const LOADING_LINES = [
  "Yanıtların analiz ediliyor...",
  "Psikolojik profil oluşturuluyor...",
  "Örüntüler karşılaştırılıyor...",
  "Sonuç hesaplanıyor...",
  "Rapor hazırlanıyor...",
];

const STORAGE_KEY = (slug: string) => `viral_test_result_${slug}`;

// ─── Sayfa ────────────────────────────────────────────────────────────────────

export default function ViralTestPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router   = useRouter();

  // Veri yükleme
  const [test, setTest]         = useState<ViralTest | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError]     = useState<string | null>(null);

  // Quiz state
  const [phase, setPhase]           = useState<Phase>("quiz");
  const [current, setCurrent]       = useState(0);
  const [answers, setAnswers]       = useState<Record<number, number>>({});
  const [selected, setSelected]     = useState<string | null>(null);
  const [slideOut, setSlideOut]     = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [result, setResult]         = useState<TestResult | null>(null);

  // Loading
  const [loadingLine, setLoadingLine] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Auth
  const [authLoading, setAuthLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn]   = useState(false);

  // ── 1. Supabase'den test verisini çek ──
  useEffect(() => {
    const supabase = createClient();

    const load = async () => {
      // Kullanıcı durumunu kontrol et
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setIsLoggedIn(true);

      // Testi çek
      const { data, error } = await supabase
        .from("viral_tests")
        .select("slug, title, description, content")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error || !data) {
        setFetchError("Test bulunamadı.");
        setFetchLoading(false);
        return;
      }

      setTest(data as ViralTest);

      // ── 2. localStorage kontrolü — giriş yapmışsa ve sonuç varsa direkt git ──
      if (user) {
        const stored = localStorage.getItem(STORAGE_KEY(slug));
        if (stored) {
          try {
            const { score, resultIndex } = JSON.parse(stored);
            const savedResult = (data as ViralTest).content.results[resultIndex];
            if (savedResult) {
              setTotalScore(score);
              setResult(savedResult);
              setPhase("result");
              setFetchLoading(false);
              return;
            }
          } catch {}
        }
      }

      setFetchLoading(false);
    };

    load();
  }, [slug]);

  // ── 3. Loading animasyonu ──
  useEffect(() => {
    if (phase !== "loading") return;
    setLoadingLine(0);
    setLoadingProgress(0);

    let step = 0;
    const total = LOADING_LINES.length;

    const interval = setInterval(() => {
      step++;
      setLoadingProgress(Math.round((step / total) * 100));
      if (step < total) {
        setLoadingLine(step);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setPhase("result");
        }, 400);
      }
    }, 520);

    return () => clearInterval(interval);
  }, [phase]);

  // ── Şık seçimi ──
  function handleSelect(value: string, score: number) {
    if (selected || !test) return;
    setSelected(value);

    const newAnswers = { ...answers, [current]: score };
    setAnswers(newAnswers);

    setTimeout(() => {
      setSlideOut(true);
      setTimeout(() => {
        if (current < test.content.questions.length - 1) {
          setCurrent((c) => c + 1);
          setSelected(null);
          setSlideOut(false);
        } else {
          // Son soru — skoru hesapla
          const total = Object.values(newAnswers).reduce((s, v) => s + v, 0);
          setTotalScore(total);

          // Sonucu bul
          const found = test.content.results.find(
            (r) => total >= r.min && total <= r.max
          ) ?? test.content.results[test.content.results.length - 1];
          setResult(found);

          // LocalStorage'a kaydet
          const resultIndex = test.content.results.indexOf(found);
          localStorage.setItem(
            STORAGE_KEY(slug),
            JSON.stringify({ score: total, resultIndex })
          );

          setPhase("loading");
        }
      }, 280);
    }, 450);
  }

  // ── Google OAuth ──
  async function handleGoogle() {
    if (!test) return;
    setAuthLoading(true);
    const supabase = createClient();

    // Mevcut sayfaya geri dönsün — auth huni kırılmaz
    const next = encodeURIComponent(`/test/${slug}`);

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/testler/${slug}`,
      },
    });
  }

  // ─── Yükleme ekranı ────────────────────────────────────────────────────────
  if (fetchLoading) {
    return (
      <div className="min-h-[100dvh] bg-zinc-50 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-400" strokeWidth={1.5} />
      </div>
    );
  }

  if (fetchError || !test) {
    return (
      <div className="min-h-[100dvh] bg-zinc-50 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <AlertCircle className="h-8 w-8 text-zinc-300" strokeWidth={1} />
        <p className="text-sm text-zinc-500">{fetchError ?? "Test yüklenemedi."}</p>
        <button
          onClick={() => router.push("/")}
          className="mt-2 text-xs font-medium text-zinc-700 underline underline-offset-2"
        >
          Ana sayfaya dön
        </button>
      </div>
    );
  }

  const q        = test.content.questions[current];
  const progress = ((current + (selected ? 1 : 0)) / test.content.questions.length) * 100;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] bg-zinc-50 overflow-y-auto">
      <div className="mx-auto max-w-lg px-5 py-10 pb-20">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-2">
            Psikoloji Testi
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            {test.title}
          </h1>
          {test.description && (
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
              {test.description}
            </p>
          )}
        </div>

        {/* ══ QUIZ ══ */}
        {phase === "quiz" && (
          <>
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-xs font-semibold text-zinc-500">
                  Soru {current + 1} / {test.content.questions.length}
                </span>
                <span className="text-xs text-zinc-400">{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-zinc-900 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Soru */}
            <div
              style={{
                opacity:   slideOut ? 0 : 1,
                transform: slideOut ? "translateX(-24px)" : "translateX(0)",
                transition: "opacity 280ms ease, transform 280ms ease",
              }}
            >
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
                  Senaryo {current + 1}
                </p>
                <h2 className="text-lg font-semibold text-zinc-900 leading-snug">
                  {q.question}
                </h2>
              </div>

              <div className="space-y-2.5">
                {q.options.map((opt) => {
                  const isSelected = selected === opt.value;
                  const isDimmed   = !!selected && !isSelected;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(opt.value, opt.score)}
                      disabled={!!selected}
                      className={`
                        w-full text-left rounded-xl border px-4 py-3.5
                        text-sm transition-all duration-200
                        active:scale-[0.98] disabled:cursor-not-allowed
                        ${isSelected
                          ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                          : isDimmed
                          ? "border-zinc-100 bg-white text-zinc-300"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:text-zinc-900 shadow-sm"
                        }
                      `}
                    >
                      <span className={`
                        inline-flex items-center justify-center
                        w-5 h-5 rounded-full border text-[10px] font-bold mr-3 shrink-0 align-middle
                        ${isSelected
                          ? "border-white/30 bg-white/20 text-white"
                          : isDimmed
                          ? "border-zinc-200 text-zinc-300"
                          : "border-zinc-300 text-zinc-400"
                        }
                      `}>
                        {opt.value.toUpperCase()}
                      </span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ══ LOADING ══ */}
        {phase === "loading" && (
          <div className="flex flex-col items-center justify-center py-16 gap-8">
            {/* Progress bar */}
            <div className="w-full max-w-xs">
              <div className="h-1 w-full rounded-full bg-zinc-200 overflow-hidden mb-5">
                <div
                  className="h-full rounded-full bg-zinc-900 transition-all duration-500 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p
                key={loadingLine}
                className="text-center text-sm font-medium text-zinc-600"
                style={{ animation: "fadeUp 0.35s ease-out" }}
              >
                {LOADING_LINES[loadingLine]}
              </p>
            </div>

            {/* Adım göstergesi */}
            <div className="flex items-center gap-2">
              {LOADING_LINES.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-400 ${
                    i <= loadingLine
                      ? "h-1.5 w-6 bg-zinc-900"
                      : "h-1.5 w-1.5 bg-zinc-300"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* ══ RESULT ══ */}
        {phase === "result" && result && (
          <div className="relative">

            {/* Sonuç kartı — giriş yapmışsa blursuz, yapmamışsa blurlu */}
            <div className={`transition-all duration-500 ${!isLoggedIn ? "blur-[7px] select-none pointer-events-none" : ""}`}>
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm mb-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2">
                  Sonucun
                </p>
                <h2 className="text-2xl font-bold text-zinc-900 mb-4">
                  {result.title}
                </h2>
                <p className="text-sm leading-loose text-zinc-600">
                  {result.description}
                </p>
              </div>

              {/* Metrik kartlar */}
              <div className="grid grid-cols-3 gap-2.5 mb-6">
                {[
                  { label: "Kontrol Eğilimi", value: `${Math.min(99, totalScore * 8 + 40)}%` },
                  { label: "Kaçış Örüntüsü",  value: `${Math.min(99, totalScore * 6 + 30)}%` },
                  { label: "Bilinç Derinliği", value: `${Math.max(20, 90 - totalScore * 5)}%` },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl border border-zinc-100 bg-white p-3 text-center shadow-sm">
                    <p className="text-xl font-black text-zinc-900">{m.value}</p>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-tight">{m.label}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-center">
                <p className="text-sm font-semibold text-zinc-900 mb-1">
                  Rüyalarını yapay zeka ile analiz et
                </p>
                <p className="text-xs text-zinc-500 mb-4">
                  İlk analiz ücretsiz, kayıt gerekmez.
                </p>
                <a
                  href="/"
                  target="_top"
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
                >
                  Rüyamı Analiz Et
                </a>
              </div>
            </div>

            {/* ── Auth Duvarı — sadece giriş yapmamışsa ── */}
            {!isLoggedIn && (
              <div className="absolute inset-0 flex items-start justify-center pt-4 z-10">
                <div className="w-full rounded-2xl border border-zinc-200 bg-white/95 backdrop-blur-sm p-6 shadow-xl">

                  <div className="mb-5 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 mb-4">
                      <svg className="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 mb-1">
                      Sonucun hazır
                    </h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">
                      Gerçeklerle yüzleşmek ve ilk rüyanı ücretsiz analiz ettirmek için giriş yap.
                    </p>
                  </div>

                  {/* Google butonu */}
                  <button
                    onClick={handleGoogle}
                    disabled={authLoading}
                    className="
                      w-full flex items-center justify-center gap-3
                      rounded-xl border border-zinc-200 bg-white
                      px-4 py-3 text-sm font-semibold text-zinc-800
                      shadow-sm transition-all active:scale-[0.98]
                      hover:border-zinc-300 hover:bg-zinc-50
                      disabled:opacity-60 mb-2.5
                    "
                  >
                    {authLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-zinc-500" strokeWidth={1.5} />
                    ) : (
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    )}
                    Google ile Devam Et
                  </button>

                  <a
                    href={`/auth?mode=signup&next=/testler/${slug}`}
                    target="_top"
                    className="
                      block w-full text-center rounded-xl border border-zinc-200
                      px-4 py-2.5 text-sm font-medium text-zinc-500
                      hover:border-zinc-300 hover:text-zinc-700
                      transition-colors active:scale-[0.98]
                    "
                  >
                    E-posta ile kayıt ol
                  </a>

                  <p className="mt-4 text-center text-[11px] text-zinc-400">
                    Ücretsiz hesap · Reklam yok · Veriler korunur
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}