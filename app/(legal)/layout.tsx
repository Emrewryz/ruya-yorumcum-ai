import type { ReactNode } from "react";
import Link from "next/link";
import { Moon } from "lucide-react";
import Footer from "@/components/Footer";

// (legal) route group layout'u
// Sidebar YOK — sade, okuma odaklı tasarım
// Footer burada — workspace düzenini bozmaz

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

      <Footer />
    </div>
  );
}