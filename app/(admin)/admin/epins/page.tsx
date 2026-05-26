"use client";

import { useState, useTransition, useEffect } from "react";
import { Plus, X, Loader2, CheckCircle, AlertCircle, Copy, Check, RefreshCw } from "lucide-react";
import { getEPins, generatePromoEPin } from "@/app/actions/admin-actions";

// ─── Tipler ───────────────────────────────────────────────────────────────────

interface EPin {
  id: string;
  order_id: string;
  amount: number;
  credit_amount: number;
  plan_type: string;
  status: string;
  created_at: string;
  user_id: string | null;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    unclaimed: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    claimed:   "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    pending:   "bg-zinc-700 text-zinc-400 border-zinc-700",
    completed: "bg-blue-400/10 text-blue-400 border-blue-400/20",
    failed:    "bg-red-400/10 text-red-400 border-red-400/20",
  };
  const labels: Record<string, string> = {
    unclaimed: "Kullanılmadı",
    claimed:   "Kullanıldı",
    pending:   "Bekliyor",
    completed: "Tamamlandı",
    failed:    "Başarısız",
  };

  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? styles.pending}`}>
      {labels[status] ?? status}
    </span>
  );
}

// ─── Kopyala Butonu ───────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={handleCopy} className="text-zinc-600 hover:text-zinc-300 transition-colors ml-1.5">
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

// ─── Promo Üret Modal ─────────────────────────────────────────────────────────

function GenerateModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (pin: { orderId: string; credits: number }) => void;
}) {
  const [credits, setCredits]   = useState(1);
  const [isPending, start]      = useTransition();
  const [result, setResult]     = useState<{ ok: boolean; msg: string; code?: string } | null>(null);

  function handleGenerate() {
    start(async () => {
      const res = await generatePromoEPin(credits);
      if (res.success) {
        setResult({ ok: true, msg: "E-Pin oluşturuldu!", code: res.orderId });
        onSuccess({ orderId: res.orderId, credits: res.credits });
      } else {
        setResult({ ok: false, msg: res.error });
      }
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-sm -translate-y-1/2 rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">

        <div className="mb-5 flex items-start justify-between">
          <h3 className="font-semibold text-white">Promosyon E-Pin Üret</h3>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-xs font-medium text-zinc-400">Kredi Miktarı</label>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 5, 10].map((n) => (
              <button
                key={n}
                onClick={() => setCredits(n)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  credits === n
                    ? "bg-amber-400 text-zinc-900"
                    : "border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                }`}
              >
                {n} Kredi
              </button>
            ))}
          </div>
          <input
            type="number"
            min={1}
            max={100}
            value={credits}
            onChange={(e) => setCredits(Math.max(1, parseInt(e.target.value) || 1))}
            className="mt-3 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:border-amber-400/50 focus:outline-none"
            placeholder="Özel miktar girin..."
          />
        </div>

        {result && (
          <div className={`mb-4 rounded-xl px-4 py-3 ${
            result.ok
              ? "border border-emerald-700 bg-emerald-900/30"
              : "border border-red-700 bg-red-900/30"
          }`}>
            <div className={`flex items-center gap-2 text-sm font-medium ${result.ok ? "text-emerald-400" : "text-red-400"}`}>
              {result.ok
                ? <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                : <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              }
              {result.msg}
            </div>
            {result.code && (
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-zinc-950 px-3 py-2 font-mono text-base font-bold tracking-widest text-amber-400">
                  {result.code}
                </code>
                <CopyButton text={result.code} />
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isPending || !!result?.ok}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-2.5 text-sm font-semibold text-zinc-900 transition-all hover:bg-amber-300 disabled:opacity-50"
        >
          {isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Üretiliyor...</>
          ) : (
            <><Plus className="h-4 w-4" strokeWidth={2} /> E-Pin Üret</>
          )}
        </button>
      </div>
    </>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────

export default function AdminEPinsPage() {
  const [epins, setEPins]         = useState<EPin[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [, start]                 = useTransition();

  const fetchEPins = () => {
    setLoading(true);
    start(async () => {
      try {
        const data = await getEPins();
        setEPins(data as EPin[]);
      } finally {
        setLoading(false);
      }
    });
  };

  useEffect(() => { fetchEPins(); }, []);

  const unclaimed = epins.filter((e) => e.status === "unclaimed").length;
  const claimed   = epins.filter((e) => e.status === "claimed").length;

  return (
    <div className="p-6 lg:p-8">

      {/* Başlık */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">E-Pin İstasyonu</h1>
          <div className="mt-1 flex items-center gap-4 text-xs text-zinc-500">
            <span><span className="font-semibold text-amber-400">{unclaimed}</span> kullanılmadı</span>
            <span><span className="font-semibold text-emerald-400">{claimed}</span> kullanıldı</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchEPins}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-amber-300 transition-colors"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Promosyon Kodu Üret
          </button>
        </div>
      </div>

      {/* Tablo */}
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Kod</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Kredi</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Tür</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Durum</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Tarih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-zinc-900/50">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-zinc-600" strokeWidth={1.5} />
                </td>
              </tr>
            ) : epins.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-zinc-600">
                  Henüz kayıt yok.
                </td>
              </tr>
            ) : (
              epins.map((epin) => (
                <tr key={epin.id} className="transition-colors hover:bg-zinc-800/40">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center">
                      <code className="font-mono text-sm font-semibold text-white">
                        {epin.order_id}
                      </code>
                      {epin.status === "unclaimed" && (
                        <CopyButton text={epin.order_id} />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-amber-400">{epin.credit_amount}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-zinc-500">
                      {epin.plan_type === "promo" ? "Promosyon" : "Shopier"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={epin.status} />
                  </td>
                  <td className="px-5 py-3.5 text-xs text-zinc-500">
                    {new Date(epin.created_at).toLocaleDateString("tr-TR", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <GenerateModal
          onClose={() => setShowModal(false)}
          onSuccess={() => setTimeout(fetchEPins, 500)}
        />
      )}
    </div>
  );
}