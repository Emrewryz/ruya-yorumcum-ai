"use client";

import { useEffect, useCallback, useState, useTransition } from "react";
import { X, Zap, Compass, FlaskConical, ShieldCheck, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { claimOrder } from "@/app/actions/payment-actions";

// ─── Paket Tanımları ──────────────────────────────────────────────────────────

const PACKAGES = [
  {
    key: "tekli",
    icon: Zap,
    name: "Tekli Rapor",
    credits: 10,
    price: 39,
    pricePerCredit: "39 TL / analiz",
    description: "Tek seferlik analiz.",
    highlight: false,
    badge: null,
    href: "https://www.shopier.com/ruyayorumcumai/43928759", // Shopier ürün linkinizi buraya koyun
  },
  {
    key: "kasif",
    icon: Compass,
    name: "Kâşif Paketi",
    credits: 30,
    price: 89,
    pricePerCredit: "~29.6 TL / analiz",
    description: "Tekrarlayan rüyalar için.",
    highlight: true,
    badge: "En Popüler",
    href: "https://www.shopier.com/ruyayorumcumai/43369308", // Shopier ürün linkinizi buraya koyun
  },
  {
    key: "laboratuvar",
    icon: FlaskConical,
    name: "Laboratuvar",
    credits: 100,
    price: 249,
    pricePerCredit: "~16.9 TL / analiz",
    description: "Düzenli araştırma için.",
    highlight: false,
    badge: "En Avantajlı",
    href: "#", // Shopier ürün linkinizi buraya koyun
  },
] as const;

// ─── Tipler ───────────────────────────────────────────────────────────────────

interface CreditModalProps {
  open: boolean;
  onClose: () => void;
  reason?: "NO_AUTH" | "NO_CREDIT";
}

// ─── Sipariş Doğrulama Bölümü ─────────────────────────────────────────────────

function ClaimSection({ onSuccess }: { onSuccess: (credits: number) => void }) {
  const [orderId, setOrderId]     = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult]       = useState<{ ok: boolean; msg: string } | null>(null);

  function handleClaim() {
    if (!orderId.trim() || isPending) return;
    setResult(null);

    startTransition(async () => {
      const res = await claimOrder(orderId);
      if (res.success) {
        setResult({ ok: true, msg: res.message });
        setOrderId("");
        onSuccess(res.credits);
      } else {
        setResult({ ok: false, msg: res.error });
      }
    });
  }

  return (
    <div className="border-t border-zinc-100 px-6 py-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
        Ödemenizi Doğrulayın
      </p>
      <p className="mb-3 text-xs text-zinc-500 leading-relaxed">
        Shopier'den ödeme yaptıktan sonra aldığınız sipariş numarasını girin.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleClaim(); }}
          placeholder="Shopier Sipariş No"
          disabled={isPending}
          className="
            flex-1 rounded-xl border border-zinc-200 bg-zinc-50
            px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400
            focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400
            disabled:opacity-50 transition-all
          "
        />
        <button
          onClick={handleClaim}
          disabled={!orderId.trim() || isPending}
          className="
            flex shrink-0 items-center gap-1.5
            rounded-xl bg-zinc-900 px-4 py-2.5
            text-sm font-semibold text-white
            transition-all hover:bg-zinc-700
            disabled:opacity-40 disabled:cursor-not-allowed
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2
          "
        >
          {isPending
            ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
            : "Yükle"
          }
        </button>
      </div>

      {/* Sonuç mesajı */}
      {result && (
        <div className={`
          mt-3 flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-xs
          animate-in fade-in slide-in-from-bottom-1 duration-200
          ${result.ok
            ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
            : "border border-red-100 bg-red-50 text-red-600"
          }
        `}>
          {result.ok
            ? <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
            : <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          }
          <span>{result.msg}</span>
        </div>
      )}
    </div>
  );
}

// ─── Ana Modal ────────────────────────────────────────────────────────────────

export default function CreditModal({ open, onClose, reason }: CreditModalProps) {
  const [credited, setCredited] = useState(false);

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

  // Başarılı yükleme sonrası otomatik kapat
  function handleClaimSuccess(credits: number) {
    setCredited(true);
    setTimeout(() => {
      setCredited(false);
      onClose();
    }, 2000);
  }

  if (!open) return null;

  const headline = reason === "NO_AUTH" ? "Devam etmek için giriş yapın" : "Krediniz tükendi";
  const sub      = reason === "NO_AUTH"
    ? "Hesap oluşturun, ardından bir paket satın alın."
    : "Aşağıdaki paketlerden birini seçerek analize devam edin.";

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="
          fixed inset-x-4 bottom-0 z-50 mx-auto max-w-lg
          md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2
          md:-translate-x-1/2 md:-translate-y-1/2
          animate-in slide-in-from-bottom-4 md:zoom-in-95 duration-200
        "
        role="dialog"
        aria-modal="true"
      >
        {/* Kredi yüklendi ekranı */}
        {credited ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-t-2xl md:rounded-2xl border border-emerald-100 bg-white px-8 py-12 shadow-xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50">
              <CheckCircle className="h-7 w-7 text-emerald-500" strokeWidth={1.5} />
            </div>
            <p className="text-base font-semibold text-zinc-900">Krediniz yüklendi!</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-t-2xl md:rounded-2xl border border-zinc-200 bg-white shadow-xl">

            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-zinc-100">
              <div>
                <h2 className="text-sm font-bold text-zinc-900">{headline}</h2>
                <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>
              </div>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-600 transition-colors"
                aria-label="Kapat"
              >
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
                    href={pkg.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      group relative flex items-center gap-4 rounded-xl border p-4
                      transition-all duration-150
                      ${pkg.highlight
                        ? "border-zinc-900 bg-zinc-900 hover:bg-zinc-800"
                        : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                      }
                    `}
                  >
                    {pkg.badge && (
                      <div className={`
                        absolute -top-2 right-3 rounded-full px-2.5 py-0.5
                        text-[10px] font-bold uppercase tracking-wide
                        ${pkg.highlight
                          ? "bg-white text-zinc-900"
                          : "bg-zinc-100 text-zinc-600"
                        }
                      `}>
                        {pkg.badge}
                      </div>
                    )}

                    <div className={`
                      flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border
                      ${pkg.highlight ? "border-white/20 bg-white/10" : "border-zinc-200 bg-zinc-50"}
                    `}>
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

            {/* Sipariş Doğrulama */}
            <ClaimSection onSuccess={handleClaimSuccess} />

            {/* Alt güven çubuğu */}
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
        )}
      </div>
    </>
  );
}