import Link from "next/link";

const LEGAL_LINKS = [
  { href: "/gizlilik",        label: "Gizlilik Politikası" },
  { href: "/mesafeli-satis",  label: "Mesafeli Satış Sözleşmesi" },
  { href: "/iptal-iade",      label: "İptal & İade Koşulları" },
];

export default function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row">
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
  );
}