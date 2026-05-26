import Link from "next/link";
import { XCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ödeme İptal Edildi — Rüya Yorumcum",
  robots: { index: false },
};

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 text-center">

      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm">
        <XCircle className="h-7 w-7 text-zinc-400" strokeWidth={1.5} />
      </div>

      <h1 className="mb-2 text-xl font-semibold text-zinc-900">
        Ödeme işlemi iptal edildi.
      </h1>

      <p className="mb-8 max-w-sm text-sm text-zinc-400">
        Hesabınızda herhangi bir değişiklik yapılmadı.
        Dilediğiniz zaman tekrar kredi satın alabilirsiniz.
      </p>

      <Link
        href="/"
        className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
      >
        Ana Sayfaya Dön
      </Link>

    </div>
  );
}