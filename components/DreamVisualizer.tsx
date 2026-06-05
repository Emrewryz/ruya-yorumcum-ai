"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, Download, AlertCircle, Gift } from "lucide-react";

interface DreamVisualizerProps {
  dreamId:           string;
  dreamText:         string;
  existingImageUrl?: string | null;
}

type Phase = "idle" | "generating" | "error";

const LOADING_STEPS = [
  "Bilinçaltı tuvale aktarılıyor...",
  "Sanatsal kompozisyon oluşturuluyor...",
  "Renk paletleri seçiliyor...",
  "Son detaylar işleniyor...",
];

// ─── Üretilmiş Görsel Kartı ───────────────────────────────────────────────────

function ImageCard({ url, showShareHint = false }: { url: string; showShareHint?: boolean }) {
  function handleDownload() {
    const a    = document.createElement("a");
    a.href     = url;
    a.target   = "_blank";
    a.download = `ruya-${Date.now()}.webp`;
    a.click();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-md animate-in fade-in zoom-in-95 duration-500">

      {/* Görsel */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
        <Image
          src={url}
          alt="Yapay zeka rüya görseli"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 512px"
          unoptimized
        />
      </div>

      {/* Kredi ipucu */}
      {showShareHint && (
        <div className="border-t border-zinc-100 bg-amber-50/60 px-5 py-3 flex items-center gap-2">
          <Gift className="h-3.5 w-3.5 text-amber-500 shrink-0" strokeWidth={1.5} />
          <p className="text-xs text-amber-700">
            Bu görseli Galerinden herkese açık yaparsan{" "}
            <span className="font-semibold">+1 kredi</span> hediye!
          </p>
        </div>
      )}

      {/* Alt bar */}
      <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/60 px-5 py-3">
        <p className="text-xs text-zinc-400">Yapay zeka ile oluşturuldu</p>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 transition-colors"
        >
          <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
          İndir
        </button>
      </div>
    </div>
  );
}

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────

export default function DreamVisualizer({
  dreamId,
  dreamText,
  existingImageUrl,
}: DreamVisualizerProps) {
  const [phase,       setPhase]       = useState<Phase>("idle");
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const [errorMsg,    setErrorMsg]    = useState<string | null>(null);
  const [stepIndex,   setStepIndex]   = useState(0);

  async function handleGenerate() {
    if (phase === "generating") return;
    setPhase("generating");
    setErrorMsg(null);
    setStepIndex(0);

    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, LOADING_STEPS.length - 1));
    }, 4500);

    try {
      const res  = await fetch("/api/generate-image", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ dreamText, dreamId }),
      });
      const data = await res.json();
      clearInterval(interval);

      if (!res.ok || !data.success) {
        setErrorMsg(data.error ?? "Beklenmeyen bir hata oluştu.");
        setPhase("error");
        return;
      }
      setNewImageUrl(data.imageUrl);
      setPhase("idle");
    } catch {
      clearInterval(interval);
      setErrorMsg("Sunucuya bağlanılamadı. Lütfen tekrar deneyin.");
      setPhase("error");
    }
  }

  const hasExisting = !!existingImageUrl;
  const hasNew      = !!newImageUrl;

  return (
    <div className="space-y-4">

      {/* ── Mevcut görsel ── */}
      {hasExisting && (
        <ImageCard url={existingImageUrl!} />
      )}

      {/* ── Yeni üretilen görsel ── */}
      {hasNew && (
        <ImageCard url={newImageUrl!} showShareHint />
      )}

      {/* ── Boş Durum: Premium Banner ── */}
      {phase === "idle" && !hasExisting && !hasNew && (
        <div className="rounded-2xl bg-zinc-900 p-10 shadow-lg">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Sparkles className="h-6 w-6 text-zinc-300" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-snug">
                Rüyanızın fotoğrafını çekseydik nasıl görünürdü?
              </h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
                Bilinçaltınızdaki sembolleri yapay zeka ile sinematik bir sanat eserine dönüştürün.
              </p>
            </div>
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 transition-colors active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.5} />
              Görsele Dönüştür
              <span className="ml-1 rounded-lg bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
                4 Kredi
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ── Yeniden Üret Butonu (görsel varsa) ── */}
      {phase === "idle" && (hasExisting || hasNew) && (
        <button
          onClick={handleGenerate}
          className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 shadow-sm hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 transition-colors active:scale-[0.98]"
        >
          <Sparkles className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
          Yeni Görsel Oluştur
          <span className="rounded-md border border-zinc-100 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-400">
            4 Kredi
          </span>
        </button>
      )}

      {/* ── Generating ── */}
      {phase === "generating" && (
        <div className="rounded-2xl bg-zinc-900 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Sparkles className="h-5 w-5 text-zinc-300 animate-pulse" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {LOADING_STEPS[stepIndex]}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">~20-30 saniye</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-zinc-400 transition-all duration-[4500ms] ease-linear"
              style={{ width: `${((stepIndex + 1) / LOADING_STEPS.length) * 100}%` }}
            />
          </div>

          {/* Shimmer placeholder */}
          <div className="mt-4 aspect-square w-full max-w-xs mx-auto rounded-xl bg-zinc-800 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-700/30 to-transparent animate-[shimmer_2s_infinite]" />
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {phase === "error" && (
        <div className="space-y-2">
          <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setPhase("idle")}
            className="text-xs font-medium text-zinc-400 underline underline-offset-2 hover:text-zinc-700 transition-colors"
          >
            Tekrar dene
          </button>
        </div>
      )}

    </div>
  );
}