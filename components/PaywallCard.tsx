"use client";

import { useState, useTransition } from "react";
import { Lock, Loader2, CheckCircle } from "lucide-react";
import { spendAnalysisCredit } from "@/app/actions/credit-actions";
import CreditModal from "@/components/CreditModal";

// ─── Tipler ───────────────────────────────────────────────────────────────────

interface PaywallCardProps {
  dreamId:          string;
  islamiAnaliz:     string;
  psikolojikAnaliz: string;
  semboller:        string;
  onUnlocked?:      () => void;
}

type ModalReason = "NO_AUTH" | "NO_CREDIT";

// ─── Analiz Bölümü ────────────────────────────────────────────────────────────

function AnalysisSection({
  label, text, unlocked,
}: {
  label: string; text: string; unlocked: boolean;
}) {
  if (!unlocked) return null; // Açılmamışsa hiç render etme

  return (
    <div className="py-5 border-b border-zinc-100 last:border-0 animate-in fade-in duration-500">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </p>
      <div className="text-sm leading-loose text-zinc-700">
        {text.split("\n").map((line, i) => (
          <p key={i} className={line.trim() === "" ? "h-2" : "mb-1"}>{line}</p>
        ))}
      </div>
    </div>
  );
}

// ─── Blur Önizleme Bölümü (kilitli halde) ────────────────────────────────────

function LockedPreview({
  label, text,
}: {
  label: string; text: string;
}) {
  return (
    <div className="py-5 border-b border-zinc-100 last:border-0">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </p>
      <div className="blur-[5px] select-none pointer-events-none text-sm leading-loose text-zinc-700">
        {text.split("\n").slice(0, 4).map((line, i) => (
          <p key={i} className={line.trim() === "" ? "h-2" : "mb-1"}>{line}</p>
        ))}
      </div>
    </div>
  );
}

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────

export default function PaywallCard({
  dreamId, islamiAnaliz, psikolojikAnaliz, semboller, onUnlocked,
}: PaywallCardProps) {
  const [islamiUnlocked,     setIslamiUnlocked]     = useState(false);
  const [psikolojikUnlocked, setPsikolojikUnlocked] = useState(false);
  const [loadingTarget,      setLoadingTarget]      = useState<"islami" | "psikolojik" | "ikisi" | null>(null);
  const [errorMsg,           setErrorMsg]           = useState<string | null>(null);
  const [modalOpen,          setModalOpen]          = useState(false);
  const [modalReason,        setModalReason]        = useState<ModalReason>("NO_CREDIT");
  const [, startTransition]  = useTransition();

  const bothUnlocked = islamiUnlocked && psikolojikUnlocked;

  // Her unlock sonrası her ikisi de açıldıysa callback tetikle
  function checkBothAndNotify(newIslami: boolean, newPsikolojik: boolean) {
    if (newIslami && newPsikolojik) {
      onUnlocked?.();
    }
  }

  async function doUnlock(target: "islami" | "psikolojik"): Promise<boolean> {
    const result = await spendAnalysisCredit(dreamId);
    if (result.success) return true;
    if (result.code === "NO_AUTH" || result.code === "NO_CREDIT") {
      setModalReason(result.code);
      setModalOpen(true);
    } else {
      setErrorMsg(result.error);
    }
    return false;
  }

  function handleUnlock(target: "islami" | "psikolojik" | "ikisi") {
    if (loadingTarget) return;
    setErrorMsg(null);
    setLoadingTarget(target);

    startTransition(async () => {
      if (target === "islami") {
        const ok = await doUnlock("islami");
        if (ok) {
          setIslamiUnlocked(true);
          checkBothAndNotify(true, psikolojikUnlocked);
        }

      } else if (target === "psikolojik") {
        const ok = await doUnlock("psikolojik");
        if (ok) {
          setPsikolojikUnlocked(true);
          checkBothAndNotify(islamiUnlocked, true);
        }

      } else if (target === "ikisi") {
        // Sırayla iki kredi harca
        const ok1 = await doUnlock("islami");
        if (!ok1) { setLoadingTarget(null); return; }
        setIslamiUnlocked(true);

        const ok2 = await doUnlock("psikolojik");
        if (ok2) {
          setPsikolojikUnlocked(true);
          onUnlocked?.();
        }
      }
      setLoadingTarget(null);
    });
  }

  return (
    <>
      <CreditModal open={modalOpen} onClose={() => setModalOpen(false)} reason={modalReason} />

      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <div className="px-6">

          {/* İslami Analiz */}
          {islamiUnlocked
            ? <AnalysisSection label="İslami Yorum" text={islamiAnaliz} unlocked={true} />
            : <LockedPreview label="İslami Yorum" text={islamiAnaliz} />
          }

          {/* Psikolojik Analiz */}
          {psikolojikUnlocked
            ? <AnalysisSection label="Psikolojik Analiz" text={psikolojikAnaliz} unlocked={true} />
            : <LockedPreview label="Psikolojik Analiz" text={psikolojikAnaliz} />
          }

          {/* Semboller — her ikisi açılınca görünür */}
          {bothUnlocked && (
            <AnalysisSection label="Semboller" text={semboller} unlocked={true} />
          )}
        </div>

        {/* ── Kilit butonları ── */}
        {!bothUnlocked && (
          <div className="border-t border-zinc-100 bg-zinc-50/60 px-6 py-5">

            {errorMsg && (
              <p className="mb-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-500">
                {errorMsg}
              </p>
            )}

            <p className="mb-3 text-xs text-zinc-400 text-center">
              {!islamiUnlocked && !psikolojikUnlocked
                ? "Hangi analizi görmek istersiniz?"
                : islamiUnlocked
                ? "Psikolojik analiz kilitli"
                : "İslami yorum kilitli"
              }
            </p>

            <div className="flex flex-col gap-2">

              {/* İkisi birden */}
              {!islamiUnlocked && !psikolojikUnlocked && (
                <button
                  onClick={() => handleUnlock("ikisi")}
                  disabled={!!loadingTarget}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50"
                >
                  {loadingTarget === "ikisi"
                    ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                    : <Lock className="h-4 w-4" strokeWidth={1.5} />
                  }
                  Her İkisini Gör
                  <span className="rounded-md bg-white/15 px-2 py-0.5 text-xs">2 Kredi</span>
                </button>
              )}

              {/* Ayrı butonlar — mobilde alt alta */}
              <div className="flex flex-col sm:flex-row gap-2">
                {!islamiUnlocked && (
                  <button
                    onClick={() => handleUnlock("islami")}
                    disabled={!!loadingTarget}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs font-semibold text-zinc-700 transition-all hover:border-zinc-400 hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loadingTarget === "islami"
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                      : <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                    }
                    İslami Yorum
                    <span className="text-zinc-400">· 1 Kredi</span>
                  </button>
                )}
                {!psikolojikUnlocked && (
                  <button
                    onClick={() => handleUnlock("psikolojik")}
                    disabled={!!loadingTarget}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs font-semibold text-zinc-700 transition-all hover:border-zinc-400 hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loadingTarget === "psikolojik"
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                      : <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                    }
                    Psikolojik
                    <span className="text-zinc-400">· 1 Kredi</span>
                  </button>
                )}
              </div>

              <p className="text-center text-xs text-zinc-400">
                Krediniz yoksa ödeme seçenekleri gösterilir
              </p>
            </div>
          </div>
        )}

        {/* ── Tümü açıldı ── */}
        {bothUnlocked && (
          <div className="mx-6 mb-5 flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-2.5 animate-in fade-in duration-500">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" strokeWidth={1.5} />
            <p className="text-xs font-medium text-emerald-700">Tüm analizler açıldı</p>
          </div>
        )}
      </div>
    </>
  );
}