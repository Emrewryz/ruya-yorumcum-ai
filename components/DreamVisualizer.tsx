"use client";

import { useState } from "react";
import Image from "next/image";
import { Wand2, Download, AlertCircle, Loader2, RefreshCw, Gift } from "lucide-react";

interface DreamVisualizerProps {
  dreamId:           string;
  dreamText:         string;
  existingImageUrl?: string | null;
}

type Phase = "idle" | "generating" | "error";

const LOADING_STEPS = [
  "Rüyanız analiz ediliyor...",
  "Sanatsal kompozisyon oluşturuluyor...",
  "Renkler ve atmosfer ayarlanıyor...",
  "Son detaylar işleniyor...",
];

// ─── Görsel Kartı ─────────────────────────────────────────────────────────────

function ImageCard({
  url,
  label,
  showShareHint = false,
}: {
  url:             string;
  label?:          string;
  showShareHint?:  boolean;
}) {
  function handleDownload() {
    const a    = document.createElement("a");
    a.href     = url;
    a.target   = "_blank";
    a.download = `ruya-${Date.now()}.webp`;
    a.click();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white animate-in fade-in zoom-in-95 duration-500">
      {label && (
        <div className="border-b border-zinc-100 bg-zinc-50/60 px-5 py-2">
          <p className="text-xs font-medium text-zinc-400">{label}</p>
        </div>
      )}

      <div className="relative aspect-square w-full max-w-sm mx-auto min-h-[280px] bg-zinc-100 overflow-hidden">
        <Image
          src={url}
          alt="Yapay zeka rüya görseli"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 384px"
          unoptimized
        />
      </div>

      {showShareHint && (
        <div className="border-t border-zinc-100 bg-amber-50/50 px-5 py-3 flex items-center gap-2">
          <Gift className="h-3.5 w-3.5 text-amber-500 shrink-0" strokeWidth={1.5} />
          <p className="text-xs text-amber-700">
            Bu görseli Galerinden herkese açık yaparsan{" "}
            <span className="font-semibold">+1 kredi</span> hediye!
          </p>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/50 px-5 py-3">
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
  const [phase,           setPhase]           = useState<Phase>("idle");
  const [newImageUrl,     setNewImageUrl]      = useState<string | null>(null);
  const [errorMsg,        setErrorMsg]         = useState<string | null>(null);
  const [stepIndex,       setStepIndex]        = useState(0);

  async function handleGenerate() {
    if (phase === "generating") return;
    setPhase("generating");
    setErrorMsg(null);
    setStepIndex(0);

    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, LOADING_STEPS.length - 1));
    }, 4000);

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

  // Gösterilecek görseller
  const hasExisting = !!existingImageUrl;
  const hasNew      = !!newImageUrl;
  const showBoth    = hasExisting && hasNew;

  return (
    <div className="mt-5 space-y-4">

      {/* ── Mevcut görsel (DB'den) ── */}
      {hasExisting && (
        <ImageCard
          url={existingImageUrl!}
          label={showBoth ? "Önceki Görsel" : undefined}
        />
      )}

      {/* ── Yeni oluşturulan görsel ── */}
      {hasNew && (
        <ImageCard
          url={newImageUrl!}
          label={showBoth ? "Yeni Görsel" : undefined}
          showShareHint={true}
        />
      )}

      {/* ── Üret / Yeniden Üret butonu ── */}
      {phase === "idle" && (
        <button
          onClick={handleGenerate}
          className="
            group flex items-center gap-2 rounded-xl border border-zinc-200
            bg-white px-4 py-2.5 text-sm font-medium text-zinc-600
            shadow-sm transition-all duration-200
            hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900
            active:scale-[0.98]
          "
        >
          <Wand2
            className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-zinc-600"
            strokeWidth={1.5}
          />
          {hasExisting || hasNew ? "Yeni Görsel Oluştur" : "Rüyayı Görselleştir"}
          <span className="rounded-md border border-zinc-100 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-400">
            4 Kredi
          </span>
        </button>
      )}

      {/* ── Generating ── */}
      {phase === "generating" && (
        <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white">
          <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden bg-zinc-50">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-100" />
            <div className="absolute inset-0 opacity-20">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute h-px bg-gradient-to-r from-transparent via-zinc-400 to-transparent animate-pulse"
                  style={{ top: `${20 + i * 15}%`, left: 0, right: 0, animationDelay: `${i * 0.4}s` }}
                />
              ))}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="h-11 w-11 rounded-2xl border border-zinc-200 bg-white flex items-center justify-center shadow-sm">
                  <Wand2 className="h-5 w-5 text-zinc-500" strokeWidth={1.5} />
                </div>
                <div className="absolute -inset-1 rounded-2xl border border-zinc-300 animate-ping opacity-20" />
              </div>
              <div className="text-center px-6">
                <p className="text-sm font-medium text-zinc-600">{LOADING_STEPS[stepIndex]}</p>
                <p className="mt-1 text-xs text-zinc-400">~20-30 saniye</p>
              </div>
            </div>
          </div>
          <div className="border-t border-zinc-100 px-5 py-3.5">
            <div className="flex gap-3">
              <div className="h-3 w-24 animate-pulse rounded bg-zinc-100" />
              <div className="h-3 w-32 animate-pulse rounded bg-zinc-100" />
            </div>
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