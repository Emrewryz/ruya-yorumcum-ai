import type { ReactNode } from "react";
import Link from "next/link";
import { Moon } from "lucide-react";

const LEGAL_LINKS = [
  { href: "/gizlilik",       label: "Gizlilik Politikası" },
  { href: "/mesafeli-satis", label: "Mesafeli Satış Sözleşmesi" },
  { href: "/iptal-iade",     label: "İptal & İade Koşulları" },
];

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">

      {/* Minimal header */}
      <header className="border-b border-zinc-100">
        <div className="mx-auto flex max-w-3xl items-center px-6 py-4">
          <Link href="/" className="flex items-center gap-2 group">
            <Moon className="h-4 w-4 text-zinc-900" strokeWidth={1.5} />
            <span className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-600 transition-colors">
              Rüya Yorumcum
            </span>
          </Link>
        </div>
      </header>

      {/* Sayfa içeriği */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer — inline, dış bağımlılık yok */}
      <footer className="border-t border-zinc-100 bg-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row">
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} Rüya Yorumcum. Tüm hakları saklıdır.
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            {LEGAL_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-xs text-zinc-400 transition-colors hover:text-zinc-700"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>

    </div>
  );
}