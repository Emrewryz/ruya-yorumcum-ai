import type { ReactNode } from "react";
import Link from "next/link";
import { Moon } from "lucide-react";

const LEGAL_LINKS = [
  { href: "/gizlilik",       label: "Gizlilik Politikası" },
  { href: "/mesafeli-satis", label: "Mesafeli Satış Sözleşmesi" },
  { href: "/iptal-iade",     label: "İptal & İade Koşulları" },
];

const NAV_LINKS = [
  { href: "/",               label: "Ana Sayfa" },
  { href: "/blog",           label: "Blog" },
  { href: "/ruya-tabirleri", label: "Rüya Tabirleri" },
];

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">

      {/* Header */}
      <header className="border-b border-zinc-100">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Moon className="h-4 w-4 text-zinc-900" strokeWidth={1.5} />
            <span className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-600 transition-colors">
              Rüya Yorumcum
            </span>
          </Link>

          {/* Masaüstü Nav */}
          <nav className="hidden sm:flex items-center gap-5">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-xs font-medium text-zinc-400 hover:text-zinc-800 transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Mobil — Ana Sayfa linki */}
          <Link
            href="/"
            className="sm:hidden text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            ← Ana Sayfa
          </Link>
        </div>
      </header>

      {/* İçerik */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 bg-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row">
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} Rüya Yorumcum. Tüm hakları saklıdır.
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
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