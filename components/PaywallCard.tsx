"use client";

import { useState, useTransition } from "react";
import { Lock, Loader2, CheckCircle } from "lucide-react";
import { spendAnalysisCredit } from "@/app/actions/credit-actions";
import CreditModal from "@/components/CreditModal";

interface PaywallCardProps {
  dreamId: string;
  islamiAnaliz: string;
  psikolojikAnaliz: string;
  semboller: string;
}

type ModalReason = "NO_AUTH" | "NO_CREDIT";

// ─── Tek Bölüm ────────────────────────────────────────────────────────────────

function Section({ label, text, unlocked }: { label: string; text: string; unlocked: boolean }) {
  return (
    <div className="py-6 border-b border-zinc-100 last:border-0">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </p>
      <div
        className={`text-sm leading-loose text-zinc-700 transition-all duration-700 ${
          unlocked ? "blur-none select-auto" : "blur-[5px] select-none pointer-events-none"
        }`}
      >
        {text.split("\n").map((line, i) => (
          <p key={i} className={line.trim() === "" ? "h-2" : "mb-1"}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────

export default function PaywallCard({ dreamId, islamiAnaliz, psikolojikAnaliz, semboller }: PaywallCardProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalReason, setModalReason] = useState<ModalReason>("NO_CREDIT");

  function handleUnlock() {
    if (isPending || unlocked) return;
    setErrorMsg(null);
    startTransition(async () => {
      const result = await spendAnalysisCredit(dreamId);
      if (result.success) { setUnlocked(true); return; }

      // NO_AUTH veya NO_CREDIT → modal aç
      if (result.code === "NO_AUTH" || result.code === "NO_CREDIT") {
        setModalReason(result.code);
        setModalOpen(true);
      } else {
        // SERVER_ERROR → inline hata (retry edilebilir)
        setErrorMsg(result.error);
      }
    });
  }

  return (
    <>
      <CreditModal open={modalOpen} onClose={() => setModalOpen(false)} reason={modalReason} />

      <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="px-6">
          <Section label="İslami Yorum" text={islamiAnaliz} unlocked={unlocked} />
          <Section label="Psikolojik Analiz" text={psikolojikAnaliz} unlocked={unlocked} />
          <Section label="Semboller" text={semboller} unlocked={unlocked} />
        </div>

        {/* ── Buzlu cam kilit örtüsü ── */}
        {!unlocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-[4px]">

            {errorMsg && (
              <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-xs text-red-500">
                {errorMsg}
              </p>
            )}

            <button
              onClick={handleUnlock}
              disabled={isPending}
              className="
                flex items-center gap-2.5
                rounded-xl bg-zinc-900 px-6 py-3
                text-sm font-semibold text-white
                transition-all
                hover:bg-zinc-800
                active:scale-[0.98]
                disabled:opacity-50
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2
              "
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <Lock className="h-4 w-4" strokeWidth={1.5} />
              )}
              <span>{isPending ? "Kontrol ediliyor..." : "Kilidi Aç"}</span>
              {!isPending && (
                <span className="rounded-md bg-white/15 px-2 py-0.5 text-xs font-medium">
                  1 Kredi
                </span>
              )}
            </button>

            <p className="text-xs text-zinc-400">
              İslami yorum · Psikolojik analiz · Semboller
            </p>
          </div>
        )}

        {/* Açık onay bandı */}
        {unlocked && (
          <div className="mx-6 mb-5 flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-2.5 animate-in fade-in duration-500">
            <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" strokeWidth={1.5} />
            <p className="text-xs font-medium text-emerald-700">Analiz kilidi açıldı · 1 kredi harcandı</p>
          </div>
        )}
      </div>
    </>
  );
}