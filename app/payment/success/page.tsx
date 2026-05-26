// ─────────────────────────────────────────────────────────────────────────────
// app/payment/success/page.tsx
// Shopier ödeme sonrası return_url
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50">
        <CheckCircle className="h-7 w-7 text-emerald-500" strokeWidth={1.5} />
      </div>
      <h1 className="mb-2 text-xl font-semibold text-zinc-900">
        Ödeme alındı, krediler yükleniyor.
      </h1>
      <p className="mb-8 max-w-sm text-sm text-zinc-400">
        Shopier ödemenizi doğruladıktan sonra krediniz otomatik olarak
        hesabınıza eklenecek. Bu birkaç saniye sürebilir.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// app/payment/cancel/page.tsx
// Kullanıcı ödemeyi iptal ederse
// ─────────────────────────────────────────────────────────────────────────────

// import Link from "next/link";
// import { XCircle } from "lucide-react";
//
// export default function PaymentCancelPage() {
//   return (
//     <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 text-center">
//       <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-red-100 bg-red-50">
//         <XCircle className="h-7 w-7 text-red-400" strokeWidth={1.5} />
//       </div>
//       <h1 className="mb-2 text-xl font-semibold text-zinc-900">Ödeme iptal edildi.</h1>
//       <p className="mb-8 text-sm text-zinc-400">Hesabınızda herhangi bir değişiklik yapılmadı.</p>
//       <Link href="/" className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white">
//         Geri Dön
//       </Link>
//     </div>
//   );
// }