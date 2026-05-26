"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { analyzeDream } from "@/app/actions/analyze-dream";

const MIN_CHARS = 20;
const MAX_CHARS = 1200;

const LOADING_MESSAGES = [
  "Rüyanızın derinliklerine iniliyoruz...",
  "Semboller çözümleniyor...",
  "İbn-i Sirin'in hikmeti aktarılıyor...",
  "Jung'un arşivleri taranıyor...",
  "Analiz tamamlanıyor...",
];

export default function DreamForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dreamText, setDreamText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const loadingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const charCount = dreamText.length;
  const isValid = charCount >= MIN_CHARS;

  function startLoadingMessages() {
    let i = 0;
    loadingInterval.current = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[i]);
    }, 2200);
  }

  function stopLoadingMessages() {
    if (loadingInterval.current) {
      clearInterval(loadingInterval.current);
      loadingInterval.current = null;
    }
  }

  async function handleSubmit() {
    if (!isValid || isPending) return;
    setError(null);
    startLoadingMessages();

    startTransition(async () => {
      const result = await analyzeDream(dreamText);
      stopLoadingMessages();

      if (result.success) {
        router.push(`/ruya-tabiri/${result.dreamId}`);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Textarea */}
      <div className="relative group">
        <textarea
          value={dreamText}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) {
              setDreamText(e.target.value);
            }
          }}
          disabled={isPending}
          placeholder="Bu gece gördüğünüz rüyayı buraya yazın... Ne kadar detay verirseniz, yorum o kadar derin olur."
          rows={6}
          className="
            w-full resize-none rounded-2xl border border-white/10
            bg-white/5 backdrop-blur-sm
            px-5 py-4 text-base leading-relaxed
            text-white placeholder:text-white/30
            focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-300
            group-hover:border-white/20
          "
          style={{ fontFamily: "'Crimson Pro', Georgia, serif" }}
        />

        {/* Karakter sayacı */}
        <div
          className={`
            absolute bottom-3 right-4 text-xs font-mono tabular-nums
            transition-colors duration-200
            ${charCount > MAX_CHARS * 0.9 ? "text-amber-400" : "text-white/25"}
          `}
        >
          {charCount}/{MAX_CHARS}
        </div>
      </div>

      {/* Hata mesajı */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <span className="mt-0.5 shrink-0 text-base">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Submit Butonu */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || isPending}
        className="
          relative w-full overflow-hidden rounded-2xl
          bg-gradient-to-r from-violet-600 to-indigo-600
          px-8 py-4 text-base font-semibold text-white
          shadow-lg shadow-violet-900/40
          transition-all duration-300
          hover:from-violet-500 hover:to-indigo-500
          hover:shadow-xl hover:shadow-violet-800/50
          hover:-translate-y-0.5
          active:translate-y-0 active:shadow-md
          disabled:opacity-40 disabled:cursor-not-allowed
          disabled:hover:translate-y-0 disabled:hover:shadow-lg
          focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-transparent
        "
      >
        {/* Shimmer efekti */}
        {!isPending && isValid && (
          <span className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        )}

        {isPending ? (
          <span className="flex items-center justify-center gap-3">
            <svg
              className="h-5 w-5 animate-spin text-white/70"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="min-w-0 truncate">{loadingMsg}</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span>🔮</span>
            <span>Rüyamı Yorumla</span>
          </span>
        )}
      </button>

      {/* Alt bilgi */}
      {!isPending && (
        <p className="text-center text-xs text-white/25">
          İlk analiziniz ücretsiz · Kayıt gerektirmez · Tüm veriler şifreli saklanır
        </p>
      )}

      {/* Shimmer keyframe — tailwind config'e eklenmemişse burada inline */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}