"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Loader2, CheckCircle, ShieldCheck } from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import GlobalMobileNav from "@/components/GlobalMobileNav";

// ─── Hesap Silme İçeriği ──────────────────────────────────────────────────────

function DeleteAccountContent() {
  const router    = useRouter();
  const [email, setEmail]       = useState("");
  const [reason, setReason]     = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!email.trim()) return;
    startTransition(async () => {
      // Burada Supabase'e veya e-posta servisine talep gönderilebilir.
      // Şimdilik sadece başarı ekranı gösteriyoruz.
      await new Promise((r) => setTimeout(r, 800));
      setSubmitted(true);
    });
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 mb-5">
          <CheckCircle className="h-7 w-7 text-emerald-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-semibold text-zinc-900 mb-2">
          Talebiniz Alındı
        </h2>
        <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
          Hesap silme talebiniz alındı. En geç <strong>30 gün</strong> içinde
          hesabınız ve ilişkili tüm verileriniz kalıcı olarak silinecektir.
          İşlem tamamlandığında e-posta ile bilgilendirileceksiniz.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-8 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-8 pb-16">

      {/* Geri */}
      <button
        onClick={() => router.back()}
        className="group mb-8 flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.5} />
        Geri
      </button>

      {/* Başlık */}
      <div className="mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 mb-5">
          <Trash2 className="h-6 w-6 text-red-500" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">Hesabı Sil</h1>
        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
          Hesabınızı ve tüm verilerinizi kalıcı olarak silmek istiyorsanız
          aşağıdaki formu doldurun.
        </p>
      </div>

      {/* Uyarı */}
      <div className="rounded-xl border border-red-100 bg-red-50 p-4 mb-8">
        <p className="text-sm font-semibold text-red-700 mb-1">
          Bu işlem geri alınamaz
        </p>
        <ul className="text-sm text-red-600 space-y-1 list-disc list-inside">
          <li>Tüm rüya analizleriniz silinir</li>
          <li>Kalan kredileriniz iade edilmez</li>
          <li>Hesap bilgileriniz kalıcı olarak kaldırılır</li>
        </ul>
      </div>

      {/* Form */}
      <div className="space-y-5">

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">
            E-posta Adresiniz
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hesabinizin@email.com"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">
            Silme Sebebi <span className="text-zinc-300 normal-case tracking-normal font-normal">(isteğe bağlı)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Hesabınızı neden silmek istediğinizi paylaşabilirsiniz..."
            rows={3}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!email.trim() || isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40 transition-colors"
        >
          {isPending
            ? <><Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> Gönderiliyor...</>
            : <><Trash2 className="h-4 w-4" strokeWidth={1.5} /> Hesap Silme Talebini Gönder</>
          }
        </button>

      </div>

      {/* Güven notu */}
      <div className="mt-8 flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
        <ShieldCheck className="h-5 w-5 shrink-0 text-zinc-400 mt-0.5" strokeWidth={1.5} />
        <p className="text-xs text-zinc-400 leading-relaxed">
          Talebiniz alındıktan sonra kimlik doğrulaması için kayıtlı
          e-posta adresinize bildirim gönderilir. Hesabınız en geç 30 gün
          içinde silinir.
        </p>
      </div>

    </div>
  );
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────

export default function HesapSilPage() {
  const router = useRouter();

  return (
    <div className="flex overflow-hidden bg-white" style={{ height: "100dvh" }}>

      {/* Desktop Sidebar */}
      <AppSidebar
        activeChatId={null}
        onSelectChat={(id) => router.push(`/?chat=${id}`)}
        onNewChat={() => router.push("/")}
        refreshTrigger={0}
      />

      {/* Mobil Header */}
      <GlobalMobileNav />

      <main className="flex flex-1 flex-col overflow-hidden bg-white">
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Mobil header boşluğu */}
          <div
            className="md:hidden shrink-0"
            style={{ height: "calc(3.5rem + env(safe-area-inset-top))" }}
          />
          <DeleteAccountContent />
        </div>
      </main>

    </div>
  );
}