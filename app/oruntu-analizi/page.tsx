"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, BarChart2, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { generateOruntuAnalizi } from "@/app/actions/oruntu-actions";
import AppSidebar from "@/components/AppSidebar";
import GlobalMobileNav from "@/components/GlobalMobileNav";

interface DreamSummary {
  id:          string;
  dream_text:  string;
  dream_title: string | null;
  created_at:  string;
}

function AnalysisResult({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-3">
      {text.split("\n").filter(Boolean).map((line, i) => (
        <p key={i} className="text-sm leading-loose text-zinc-700">{line}</p>
      ))}
    </div>
  );
}

export default function OruntuAnaliziPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [dreams,   setDreams]   = useState<DreamSummary[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [result,   setResult]   = useState<string | null>(null);
  const [error,    setError]    = useState<string | null>(null);
  const [isPending, start]      = useTransition();

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }

      const { data } = await supabase
        .from("dreams")
        .select("id, dream_text, dream_title, created_at")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(7);

      setDreams((data ?? []) as DreamSummary[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const canAnalyze = dreams.length >= 2;

  function handleAnalyze() {
    setError(null);
    setResult(null);
    start(async () => {
      const res = await generateOruntuAnalizi();
      if (res.success) {
        setResult(res.analysis);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="flex overflow-hidden bg-white" style={{ height: "100dvh" }}>

      {/* Desktop Sidebar */}
      <AppSidebar
        activeChatId={null}
        onSelectChat={(id) => router.push(`/?chat=${id}`)}
        onNewChat={() => router.push("/")}
        refreshTrigger={0}
      />

      {/* Mobil Header + Drawer */}
      <GlobalMobileNav />

      <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>

        {/* Mobil header boşluğu */}
        <div
          className="md:hidden shrink-0"
          style={{ height: "calc(3.5rem + env(safe-area-inset-top))" }}
        />

        <div className="mx-auto max-w-2xl px-6 py-8 pb-10">

          {/* Geri */}
          <button
            onClick={() => router.back()}
            className="group mb-7 flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.5} />
            Geri
          </button>

          {/* Başlık */}
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50">
                <BarChart2 className="h-5 w-5 text-zinc-700" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-zinc-900">Haftalık Analiz</h1>
                <p className="text-xs text-zinc-400">Bilinçaltı örüntü raporu</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-zinc-500">
              Rüyalarınız birbiriyle konuşur. Kaydettiğiniz rüyalardaki tekrar eden temaları,
              sembolleri ve duygusal örüntüleri analiz ederek size özel bir rapor sunuyoruz.
            </p>
          </div>

          {/* Yükleniyor */}
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" strokeWidth={1.5} />
            </div>
          )}

          {!loading && (
            <>
              {/* Rüya Listesi */}
              <div className="mb-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Analiz Edilecek Rüyalar ({Math.min(dreams.length, 7)})
                </p>

                {dreams.length === 0 ? (
                  <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-5 py-8 text-center">
                    <p className="text-sm text-zinc-500">Henüz analiz edilmiş rüyanız yok.</p>
                    <button
                      onClick={() => router.push("/")}
                      className="mt-3 text-xs font-medium text-zinc-700 underline underline-offset-2"
                    >
                      İlk rüyamı analiz et
                    </button>
                  </div>
                ) : dreams.length < 2 ? (
                  <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-5 py-6 text-center">
                    <p className="text-sm text-zinc-600">
                      Haftalık analiz için en az 2 rüya gerekiyor.
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">Şu an {dreams.length} rüyanız var.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dreams.slice(0, 7).map((dream, i) => (
                      <div key={dream.id} className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                        <span className="mt-0.5 text-xs font-bold tabular-nums text-zinc-300">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-zinc-700">
                            {dream.dream_title || dream.dream_text.slice(0, 60)}
                          </p>
                          <p className="mt-0.5 text-xs text-zinc-400">
                            {new Date(dream.created_at).toLocaleDateString("tr-TR", {
                              day: "numeric", month: "long",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hata */}
              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
                  {error}
                </div>
              )}

              {/* Analiz Butonu */}
              {canAnalyze && !result && (
                <button
                  onClick={handleAnalyze}
                  disabled={isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                      Analiz hazırlanıyor...
                    </>
                  ) : (
                    <>
                      <BarChart2 className="h-4 w-4" strokeWidth={1.5} />
                      Haftalık Analizi Başlat
                      <span className="rounded-md bg-white/15 px-2 py-0.5 text-xs">5 Kredi</span>
                    </>
                  )}
                </button>
              )}

              {/* Sonuç */}
              {result && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-zinc-100" />
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                      Bilinçaltı Örüntü Raporu
                    </p>
                    <div className="h-px flex-1 bg-zinc-100" />
                  </div>

                  <AnalysisResult text={result} />

                  <button
                    onClick={handleAnalyze}
                    disabled={isPending}
                    className="w-full rounded-xl border border-zinc-200 py-2.5 text-xs font-medium text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 transition-colors disabled:opacity-50"
                  >
                    Yeniden Analiz Et
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </main>
    </div>
  );
}