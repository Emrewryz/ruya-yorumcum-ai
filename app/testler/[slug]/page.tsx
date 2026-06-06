"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";

// ─── Tipler ───────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: { slug: string } }) {
  return {
    alternates: {
      canonical: `https://www.ruyayorumcum.com.tr/testler/${params.slug}`,
    },
  };
}

interface TestOption {
  label:    string;
  value:    string;
  category: string; // ← score yerine category (arketip/mod sistemi)
}

interface TestQuestion {
  id:       number;
  question: string;
  options:  TestOption[];
}

interface TestResult {
  category:    string; // ← min/max yerine category eşleşmesi
  title:       string;
  description: string;
}

interface TestSeoContent {
  intro?:    string;
  sections?: { heading: string; body: string }[];
}

interface ViralTest {
  slug:        string;
  title:       string;
  description: string | null;
  content: {
    questions:   TestQuestion[];
    results:     TestResult[];
    seo_content?: TestSeoContent; // opsiyonel CMS alanı
  };
}

const LOADING_LINES = [
  "Yanıtların analiz ediliyor...",
  "Bilinçaltı profili oluşturuluyor...",
  "Örüntüler karşılaştırılıyor...",
  "Sonuç hazırlanıyor...",
  "Rapor tamamlandı.",
];

const STORAGE_KEY = (slug: string) => `viral_test_result_${slug}`;

// ─── Mod Hesaplama (Arketip Sistemi) ─────────────────────────────────────────
// En çok tekrar eden category → o category'nin result'u gösterilir

function calcMode(answers: Record<number, string>): string {
  const counts: Record<string, number> = {};
  Object.values(answers).forEach((cat) => {
    counts[cat] = (counts[cat] ?? 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────

export default function ViralTestPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router   = useRouter();

  const [test, setTest]               = useState<ViralTest | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError]   = useState<string | null>(null);

  const [phase, setPhase]             = useState<"quiz" | "loading" | "result">("quiz");
  const [current, setCurrent]         = useState(0);
  const [answers, setAnswers]         = useState<Record<number, string>>({});
  const [selected, setSelected]       = useState<string | null>(null);
  const [slideOut, setSlideOut]       = useState(false);
  const [result, setResult]           = useState<TestResult | null>(null);

  const [loadingLine, setLoadingLine] = useState(0);
  const [loadingPct, setLoadingPct]   = useState(0);

  // ── Veri çek + localStorage kontrolü ──
  useEffect(() => {
    const supabase = createClient();

    const load = async () => {
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

      const testData = data as ViralTest;
      setTest(testData);

      // localStorage'da tamamlanmış sonuç var mı? (giriş şartı yok artık)
      const stored = localStorage.getItem(STORAGE_KEY(slug));
      if (stored) {
        try {
          const { category } = JSON.parse(stored);
          const saved = testData.content.results.find((r) => r.category === category);
          if (saved) {
            setResult(saved);
            setPhase("result");
            setFetchLoading(false);
            return;
          }
        } catch {}
      }

      setFetchLoading(false);
    };

    load();
  }, [slug]);

  // ── Loading animasyonu ──
  useEffect(() => {
    if (phase !== "loading") return;
    setLoadingLine(0); setLoadingPct(0);

    let step = 0;
    const total = LOADING_LINES.length;
    const interval = setInterval(() => {
      step++;
      setLoadingPct(Math.round((step / total) * 100));
      if (step < total) {
        setLoadingLine(step);
      } else {
        clearInterval(interval);
        setTimeout(() => setPhase("result"), 400);
      }
    }, 520);

    return () => clearInterval(interval);
  }, [phase]);

  // ── Şık seçimi ──
  function handleSelect(value: string, category: string) {
    if (selected || !test) return;
    setSelected(value);

    const newAnswers = { ...answers, [current]: category };
    setAnswers(newAnswers);

    setTimeout(() => {
      setSlideOut(true);
      setTimeout(() => {
        if (current < test.content.questions.length - 1) {
          setCurrent((c) => c + 1);
          setSelected(null);
          setSlideOut(false);
        } else {
          // Son soru — mod hesapla
          const dominantCategory = calcMode(newAnswers);
          const found =
            test.content.results.find((r) => r.category === dominantCategory) ??
            test.content.results[0];

          setResult(found);

          // localStorage'a kaydet — herkes için (misafir dahil)
          localStorage.setItem(
            STORAGE_KEY(slug),
            JSON.stringify({ category: found.category })
          );

          setPhase("loading");
        }
      }, 280);
    }, 450);
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
        <button onClick={() => router.push("/")} className="mt-2 text-xs font-medium text-zinc-700 underline underline-offset-2">
          Ana sayfaya dön
        </button>
      </div>
    );
  }

  const q        = test.content.questions[current];
  const progress = ((current + (selected ? 1 : 0)) / test.content.questions.length) * 100;
  const seo      = test.content.seo_content;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] bg-zinc-50 overflow-y-auto">
      <div className="mx-auto max-w-lg px-5 py-10 pb-16">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-2">
            Psikoloji Testi
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{test.title}</h1>
          {test.description && (
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">{test.description}</p>
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
            <div style={{
              opacity:    slideOut ? 0 : 1,
              transform:  slideOut ? "translateX(-24px)" : "translateX(0)",
              transition: "opacity 280ms ease, transform 280ms ease",
            }}>
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
                      onClick={() => handleSelect(opt.value, opt.category)}
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
                        ${isSelected ? "border-white/30 bg-white/20 text-white"
                          : isDimmed ? "border-zinc-200 text-zinc-300"
                          : "border-zinc-300 text-zinc-400"}
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
            <div className="w-full max-w-xs">
              <div className="h-1 w-full rounded-full bg-zinc-200 overflow-hidden mb-5">
                <div
                  className="h-full rounded-full bg-zinc-900 transition-all duration-500 ease-out"
                  style={{ width: `${loadingPct}%` }}
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
            <div className="flex items-center gap-2">
              {LOADING_LINES.map((_, i) => (
                <div key={i} className={`rounded-full transition-all duration-400 ${
                  i <= loadingLine ? "h-1.5 w-6 bg-zinc-900" : "h-1.5 w-1.5 bg-zinc-300"
                }`} />
              ))}
            </div>
          </div>
        )}

        {/* ══ RESULT — Auth duvarı YOK, herkes görür ══ */}
        {phase === "result" && result && (
          <div className="space-y-4">

            {/* Sonuç kartı */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2">
                Sonucun
              </p>
              <h2 className="text-2xl font-bold text-zinc-900 mb-4">{result.title}</h2>
              <p className="text-sm leading-loose text-zinc-600">{result.description}</p>
            </div>

            {/* CTA — ana sayfaya yönlendir */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-900 p-6 text-center">
              <p className="text-sm font-semibold text-white mb-1">
                Bilinçaltı örüntünü keşfettin.
              </p>
              <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
                Peki dün gece gördüğün rüya ne anlama geliyor?
              </p>
              <a
                href="/"
                target="_top"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-zinc-900 hover:bg-zinc-100 transition-colors active:scale-[0.98]"
              >
                Ücretsiz Rüya Analizi
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </a>
              <p className="mt-3 text-[11px] text-zinc-600">Kayıt gerekmez · İlk analiz ücretsiz</p>
            </div>

            {/* Tekrar oyna */}
            <button
              onClick={() => {
                localStorage.removeItem(STORAGE_KEY(slug));
                setCurrent(0); setAnswers({}); setSelected(null);
                setResult(null); setSlideOut(false);
                setPhase("quiz");
              }}
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 text-xs font-medium text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 transition-colors"
            >
              Testi Tekrar Çöz
            </button>
          </div>
        )}

        {/* ══ SEO Statik İçerik ══
            CMS'den veya test.content.seo_content'ten beslenir.
            Eğer veri yoksa placeholder gösterilir (sadece geliştirme için).     */}
        {(phase === "result" || phase === "quiz") && (
          <article className="mt-12 prose-sm max-w-none">
            <div className="border-t border-zinc-100 pt-10 space-y-8">

              {seo?.intro && (
                <p className="text-sm leading-loose text-zinc-500">{seo.intro}</p>
              )}

              {seo?.sections?.map((section, i) => (
                <section key={i}>
                  <h2 className="text-base font-semibold text-zinc-800 mb-2">{section.heading}</h2>
                  <p className="text-sm leading-loose text-zinc-500">{section.body}</p>
                </section>
              ))}

              {/* Placeholder — seo_content yokken SEO botlarına bir şey sun */}
              {!seo && (
                <>
                  <section>
                    <h2 className="text-base font-semibold text-zinc-800 mb-2">
                      Bu Test Nasıl Hazırlandı?
                    </h2>
                    <p className="text-sm leading-loose text-zinc-500">
                      {test.title}, modern psikoloji araştırmaları ve bilinçaltı sembolleri referans alınarak
                      Rüya Yorumcum uzman kadrosu tarafından hazırlandı. Her soru, farklı bir psikolojik örüntüyü
                      ölçmek için tasarlanmıştır.
                    </p>
                  </section>
                  <section>
                    <h2 className="text-base font-semibold text-zinc-800 mb-2">
                      Bilinçaltı ve Rüyalar
                    </h2>
                    <p className="text-sm leading-loose text-zinc-500">
                      Carl Jung'a göre rüyalar, bilinçaltının dilidir. Rüyalarında tekrar eden semboller ve
                      durumlar, uyanık hayatındaki örüntülerin yansımalarıdır. Bu test, o örüntüleri yüzeye
                      çıkarmak için bir başlangıç noktası sunar.
                    </p>
                  </section>
                </>
              )}

              {/* Her sayfada ortak CTA */}
              <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-center not-prose">
                <p className="text-sm font-semibold text-zinc-900 mb-1">
                  Rüyalarındaki gizli mesajları merak ediyor musun?
                </p>
                <p className="text-xs text-zinc-500 mb-4">
                  Yapay zeka ile İslami ve psikolojik rüya analizi. İlk analiz ücretsiz.
                </p>
                <a
                  href="/"
                  target="_top"
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
                >
                  Rüyamı Analiz Et
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </a>
              </section>

            </div>
          </article>
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