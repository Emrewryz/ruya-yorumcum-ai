"use client";

import { useEffect, useCallback, useState, useTransition } from "react";
import { X, ShieldCheck, Loader2, CheckCircle, AlertCircle, Moon, Sparkles, Zap, Star, Crown } from "lucide-react";
import { claimOrder } from "@/app/actions/payment-actions";
import { createClient } from "@/utils/supabase/client";

// ─── Paket Tanımları ──────────────────────────────────────────────────────────

const PACKAGES = [
  {
    key:       "baslangic",
    icon:      Zap,
    name:      "Başlangıç",
    credits:   10,
    price:     39,
    badge:     null,
    highlight: false,
    href:      "https://www.shopier.com/ruyayorumcumai/43928759",
  },
  {
    key:       "populer",
    icon:      Star,
    name:      "Popüler",
    credits:   30,
    price:     89,
    badge:     "En Popüler",
    highlight: true,
    href:      "https://www.shopier.com/ruyayorumcumai/43369308",
  },
  {
    key:       "bilge",
    icon:      Crown,
    name:      "Bilge",
    credits:   100,
    price:     249,
    badge:     "En Avantajlı",
    highlight: false,
    href:      "https://www.shopier.com/ruyayorumcumai/43369409",
  },
] as const;

interface CreditModalProps {
  open:    boolean;
  onClose: () => void;
  reason?: "NO_AUTH" | "NO_CREDIT";
}

// ─── Giriş Yap Ekranı ────────────────────────────────────────────────────────

function AuthScreen({ onClose }: { onClose: () => void }) {
  // Mevcut sayfayı al — login sonrası geri dönmek için
  const currentPath =
    typeof window !== "undefined"
      ? window.location.pathname + window.location.search
      : "/";

  return (
    <div className="overflow-hidden rounded-t-2xl md:rounded-2xl border border-zinc-200 bg-white shadow-xl">

      <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-zinc-100">
        <div>
          <h2 className="text-sm font-bold text-zinc-900">Devam etmek için giriş yap</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Ücretsiz hesap aç, 2 kredi ile başla.</p>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="px-6 py-6">
        <div className="mb-5 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50">
            <Moon className="h-6 w-6 text-zinc-700" strokeWidth={1.5} />
          </div>
        </div>

        <div className="mb-6 space-y-2.5">
          {[
            "Her gün 2 ücretsiz analiz kredisi",
            "İslami ve psikolojik yorumlar",
            "Sohbet geçmişin kaydedilir",
            "Rüyalarını görselleştirebilirsin",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
                <CheckCircle className="h-3 w-3 text-emerald-500" strokeWidth={2} />
              </div>
              <p className="text-sm text-zinc-600">{item}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <a
            href={`/auth?mode=register&next=${encodeURIComponent(currentPath)}`}
            target="_top"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors"
          >
            <Sparkles className="h-4 w-4" strokeWidth={1.5} />
            Ücretsiz Hesap Oluştur
          </a>
          <a
            href={`/auth?mode=login&next=${encodeURIComponent(currentPath)}`}
            target="_top"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
          >
            Zaten hesabım var, giriş yap
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Sipariş Doğrulama ────────────────────────────────────────────────────────

function ClaimSection({ onSuccess }: { onSuccess: (credits: number) => void }) {
  const [orderId, setOrderId]        = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult]          = useState<{ ok: boolean; msg: string } | null>(null);

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
    <div className="border-t border-zinc-100 px-5 py-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
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
          className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 disabled:opacity-50 transition-all"
        />
        <button
          onClick={handleClaim}
          disabled={!orderId.trim() || isPending}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : "Yükle"}
        </button>
      </div>
      {result && (
        <div className={`mt-3 flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-xs animate-in fade-in duration-200 ${
          result.ok
            ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
            : "border border-red-100 bg-red-50 text-red-600"
        }`}>
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

// ─── Satın Alma Ekranı ────────────────────────────────────────────────────────

function PurchaseScreen({
  onClose,
  onSuccess,
}: {
  onClose:   () => void;
  onSuccess: (c: number) => void;
}) {
  const [agreed, setAgreed] = useState(false);
  return (
    <div className="overflow-hidden rounded-t-2xl md:rounded-2xl border border-zinc-200 bg-white shadow-xl">

      <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-zinc-100">
        <div>
          <h2 className="text-sm font-bold text-zinc-900">Krediniz tükendi</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Bir paket seçerek analizlerinize devam edin.</p>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Sözleşme onayı */}
      <div className="border-t border-zinc-100 px-5 py-3">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-zinc-900 cursor-pointer"
          />
          <span className="text-[11px] leading-relaxed text-zinc-500">
            <a href="/mesafeli-satis" target="_top" className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900">
              Mesafeli Satış Sözleşmesi
            </a>
            'ni ve{" "}
            <a href="/iptal-iade" target="_top" className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900">
              İptal & İade Koşulları
            </a>
            'nı okudum, onaylıyorum.
          </span>
        </label>
      </div>

      {/* Paketler */}
      <div className={`p-4 space-y-2.5 transition-opacity ${!agreed ? "opacity-40 pointer-events-none" : ""}`}>
        {PACKAGES.map((pkg) => {
          const Icon = pkg.icon;
          return (
            <a
              key={pkg.key}
              href={pkg.href}
              target="_top"
              rel="noopener"
              className={`
                relative flex items-center gap-4 rounded-xl border p-4
                transition-all duration-150 active:scale-[0.99]
                ${pkg.highlight
                  ? "border-zinc-900 bg-zinc-900 hover:bg-zinc-800"
                  : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                }
              `}
            >
              {pkg.badge && (
                <div className={`absolute -top-2.5 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  pkg.highlight ? "bg-white text-zinc-900" : "bg-zinc-900 text-white"
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
                <p className={`text-sm font-semibold ${pkg.highlight ? "text-white" : "text-zinc-900"}`}>
                  {pkg.name}
                </p>
                <p className={`text-xs mt-0.5 ${pkg.highlight ? "text-white/60" : "text-zinc-400"}`}>
                  {pkg.credits} analiz kredisi
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className={`text-lg font-bold ${pkg.highlight ? "text-white" : "text-zinc-900"}`}>
                  {pkg.price}₺
                </p>
                <p className={`text-xs ${pkg.highlight ? "text-white/50" : "text-zinc-400"}`}>
                  {(pkg.price / pkg.credits).toFixed(1)}₺/analiz
                </p>
              </div>
            </a>
          );
        })}
      </div>

      <ClaimSection onSuccess={onSuccess} />

      <div className="px-5 py-3 border-t border-zinc-100">
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
  );
}

// ─── Ana Modal ────────────────────────────────────────────────────────────────

export default function CreditModal({ open, onClose, reason }: CreditModalProps) {
  const [credited, setCredited] = useState(false);
  const [isGuest, setIsGuest]   = useState<boolean | null>(null);

  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsGuest(!user);
    });
  }, [open]);

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

  function handleClaimSuccess(credits: number) {
    setCredited(true);
    setTimeout(() => { setCredited(false); onClose(); }, 2000);
  }

  if (!open) return null;

  if (credited) {
    return (
      <>
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
        <div className="fixed inset-x-4 bottom-0 z-50 mx-auto max-w-lg md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
          <div className="flex flex-col items-center justify-center gap-4 rounded-t-2xl md:rounded-2xl border border-emerald-100 bg-white px-8 py-12 shadow-xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50">
              <CheckCircle className="h-7 w-7 text-emerald-500" strokeWidth={1.5} />
            </div>
            <p className="text-base font-semibold text-zinc-900">Krediniz yüklendi!</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed inset-x-4 bottom-0 z-50 mx-auto max-w-lg md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 animate-in slide-in-from-bottom-4 md:zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {isGuest === null && (
          <div className="flex items-center justify-center rounded-t-2xl md:rounded-2xl border border-zinc-200 bg-white py-10 shadow-xl">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" strokeWidth={1.5} />
          </div>
        )}

        {isGuest === true  && <AuthScreen onClose={onClose} />}

        {isGuest === false && (
          <PurchaseScreen onClose={onClose} onSuccess={handleClaimSuccess} />
        )}
      </div>
    </>
  );
}