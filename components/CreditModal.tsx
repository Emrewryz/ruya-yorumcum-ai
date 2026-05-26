"use client";

import { useEffect, useCallback } from "react";
import { X, Zap, Compass, FlaskConical, Lock, ShieldCheck } from "lucide-react";

const PACKAGES = [
  {
    key: "tekli",
    icon: Zap,
    name: "Tekli Rapor",
    credits: 1,
    price: 39,
    pricePerCredit: "39 TL / analiz",
    description: "Tek seferlik analiz.",
    highlight: false,
    badge: null,
  },
  {
    key: "kasif",
    icon: Compass,
    name: "Kâşif Paketi",
    credits: 3,
    price: 89,
    pricePerCredit: "~29.6 TL / analiz",
    description: "Tekrarlayan rüyalar için.",
    highlight: true,
    badge: "En Popüler",
  },
  {
    key: "laboratuvar",
    icon: FlaskConical,
    name: "Laboratuvar",
    credits: 10,
    price: 169,
    pricePerCredit: "~16.9 TL / analiz",
    description: "Düzenli araştırma için.",
    highlight: false,
    badge: "En Avantajlı",
  },
] as const;

interface CreditModalProps {
  open: boolean;
  onClose: () => void;
  reason?: "NO_AUTH" | "NO_CREDIT";
}

export default function CreditModal({ open, onClose, reason }: CreditModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const headline = reason === "NO_AUTH" ? "Devam etmek için giriş yapın" : "Krediniz tükendi";
  const sub = reason === "NO_AUTH"
    ? "Hesap oluşturun, ardından bir paket seçin."
    : "Aşağıdaki paketlerden birini seçerek analize devam edin.";

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />

      <div
        className="fixed inset-x-4 bottom-0 z-50 mx-auto max-w-lg md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 animate-in slide-in-from-bottom-4 md:zoom-in-95 duration-200"
        role="dialog" aria-modal="true"
      >
        <div className="rounded-t-2xl md:rounded-2xl border border-zinc-200 bg-white shadow-xl overflow-hidden">

          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-zinc-100">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50">
                <Lock className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-900">{headline}</h2>
                <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>
              </div>
            </div>
            <button onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-600 transition-colors"
              aria-label="Kapat">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Paketler */}
          <div className="p-4 space-y-2">
            {PACKAGES.map((pkg) => {
              const Icon = pkg.icon;
              return (
                <a
                  key={pkg.key}
                  href={`/api/shopier/checkout?package=${pkg.key}`}
                  className={`
                    group relative flex items-center gap-4 rounded-xl border p-4 transition-all duration-150
                    ${pkg.highlight
                      ? "border-zinc-900 bg-zinc-900 hover:bg-zinc-800"
                      : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                    }
                  `}
                >
                  {pkg.badge && (
                    <div className={`absolute -top-2 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      pkg.highlight ? "bg-white text-zinc-900" : "bg-zinc-100 text-zinc-600"
                    }`}>
                      {pkg.badge}
                    </div>
                  )}

                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                    pkg.highlight ? "border-white/20 bg-white/10" : "border-zinc-200 bg-zinc-50"
                  }`}>
                    <Icon className={`h-4 w-4 ${pkg.highlight ? "text-white" : "text-zinc-500"}`} strokeWidth={1.5} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-sm font-semibold ${pkg.highlight ? "text-white" : "text-zinc-900"}`}>
                        {pkg.name}
                      </span>
                      <span className={`text-xs ${pkg.highlight ? "text-white/60" : "text-zinc-400"}`}>
                        {pkg.credits} analiz
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${pkg.highlight ? "text-white/50" : "text-zinc-400"}`}>
                      {pkg.pricePerCredit}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className={`text-base font-bold ${pkg.highlight ? "text-white" : "text-zinc-900"}`}>
                      {pkg.price} ₺
                    </div>
                    <div className={`mt-1 text-xs font-medium ${pkg.highlight ? "text-white/60" : "text-zinc-500"}`}>
                      Satın Al →
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Alt bilgi */}
          <div className="px-6 py-3 border-t border-zinc-100">
            <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-500" strokeWidth={1.5} />
                Güvenli ödeme
              </span>
              <span className="h-3 w-px bg-zinc-200" />
              <span>Shopier altyapısı</span>
              <span className="h-3 w-px bg-zinc-200" />
              <span>Anında tanımlama</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}