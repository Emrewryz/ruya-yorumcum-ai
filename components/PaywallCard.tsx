"use client";

import { useState, useTransition } from "react";
import { Lock, Loader2, CheckCircle } from "lucide-react";
import { spendAnalysisCredit } from "@/app/actions/credit-actions";
import CreditModal from "@/components/CreditModal";

interface PaywallCardProps {
  dreamId:          string;
  detayliTahlil:    string;
  semboller:        string;
  initialUnlocked?: boolean;
  onUnlocked?:      () => void;
}

type ModalReason = "NO_AUTH" | "NO_CREDIT";

function TextBlock({ text, label }: { text: string; label: string }) {
  const safeText = typeof text === "string" ? text : "";
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </p>
      <div className="text-[15px] leading-loose text-zinc-700 space-y-3">
        {safeText.split("\n\n").filter(Boolean).map((para, i) => (
          <p key={i}>{para.trim()}</p>
        ))}
      </div>
    </div>
  );
}

function SembollerBlock({ text }: { text: string }) {
  const safeText = typeof text === "string" ? text : "";
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
        Öne Çıkan Semboller
      </p>
      <div className="space-y-2">
        {safeText.split("\n").filter((l) => l.trim()).map((line, i) => (
          <p key={i} className="text-[15px] leading-relaxed text-zinc-700">{line.trim()}</p>
        ))}
      </div>
    </div>
  );
}

export default function PaywallCard({
  dreamId,
  detayliTahlil,
  semboller,
  initialUnlocked = false,
  onUnlocked,
}: PaywallCardProps) {
  const [isUnlocked, setIsUnlocked]   = useState(initialUnlocked);
  const [loading, setLoading]         = useState(false);
  const [errorMsg, setErrorMsg]       = useState<string | null>(null);
  const [modalOpen, setModalOpen]     = useState(false);
  const [modalReason, setModalReason] = useState<ModalReason>("NO_CREDIT");
  const [, startTransition]           = useTransition();

  const safeDetay = typeof detayliTahlil === "string" ? detayliTahlil : "";

  function handleUnlock() {
    if (loading) return;
    setErrorMsg(null);
    setLoading(true);

    startTransition(async () => {
      const result = await spendAnalysisCredit(dreamId);
      if (!result.success) {
        if (result.code === "NO_AUTH" || result.code === "NO_CREDIT") {
          setModalReason(result.code as ModalReason);
          setModalOpen(true);
        } else {
          setErrorMsg(result.error ?? "Bir hata oluştu.");
        }
      } else {
        setIsUnlocked(true);
        onUnlocked?.();
      }
      setLoading(false);
    });
  }

  // ── Kilitli Görünüm ──
  if (!isUnlocked) {
    return (
      <>
        <CreditModal open={modalOpen} onClose={() => setModalOpen(false)} reason={modalReason} />

        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
          <div className="px-6 pt-6 pb-0">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Detaylı Rüya Tahlili
            </p>

            {/* ── Önizleme: CSS mask ile zarifçe silikleşen blur ── */}
            <div className="relative -mx-6 px-6 text-[15px] leading-loose text-zinc-700 blur-[4px] opacity-40 select-none pointer-events-none line-clamp-[10] [mask-image:linear-gradient(to_bottom,black_10%,transparent_100%)]">
  {safeDetay}
</div>

            {/* Gradient kapak */}
            <div className="h-8 bg-gradient-to-b from-white/0 to-white" />
          </div>

          {/* Kilit butonu */}
          <div className="px-6 pb-6 pt-1">
            {errorMsg && (
              <p className="mb-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-500">
                {errorMsg}
              </p>
            )}

            <button
              onClick={handleUnlock}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-zinc-900 px-5 py-3.5 text-sm font-medium text-white transition-all hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-60"
            >
              {loading
                ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                : <Lock    className="h-4 w-4"              strokeWidth={1.5} />
              }
              <span>Detaylı Tahlili Gör</span>
              <span className="ml-auto rounded-md border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-normal">
                2 Kredi
              </span>
            </button>

            <p className="mt-2.5 text-center text-[11px] text-zinc-400">
              İslami tabir · Günlük dil analizi · Semboller dahil
            </p>
          </div>
        </div>
      </>
    );
  }

  // ── Açık Görünüm ──
  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden divide-y divide-zinc-100">
      <div className="px-6 py-5">
        <TextBlock text={detayliTahlil} label="Detaylı Rüya Tahlili" />
      </div>
      {semboller && (
        <div className="px-6 py-5">
          <SembollerBlock text={semboller} />
        </div>
      )}
      <div className="px-6 py-3 bg-emerald-50/50">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" strokeWidth={1.5} />
          <p className="text-xs font-medium text-emerald-700">Tüm analizler açıldı</p>
        </div>
      </div>
    </div>
  );
}