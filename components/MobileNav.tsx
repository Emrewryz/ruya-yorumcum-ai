"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PenLine, Clock, BarChart2, BookOpen, User } from "lucide-react";

interface MobileNavProps {
  onNewChat: () => void;
  activeChatId: string | null;
}

export default function MobileNav({ onNewChat, activeChatId }: MobileNavProps) {
  const pathname   = usePathname();
  const router     = useRouter();

  const isHome     = pathname === "/" && !activeChatId;
  const isHistory  = pathname === "/" && !!activeChatId;
  const isAnaliz   = pathname === "/oruntu-analizi";
  const isBlog     = pathname.startsWith("/blog") || pathname.startsWith("/ruya-tabirleri");
  const isProfile  = pathname === "/profile";

  const btnBase = "flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors";
  const active  = "text-zinc-900";
  const passive = "text-zinc-400";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-zinc-200 bg-white/95 backdrop-blur-sm md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Yeni Analiz */}
      <button
        onClick={onNewChat}
        className={`${btnBase} flex-1 ${isHome ? active : passive}`}
      >
        <PenLine className="h-5 w-5" strokeWidth={1.5} />
        <span>Analiz</span>
      </button>

      {/* Geçmiş — aktif sohbet varsa highlight */}
      <button
        onClick={() => {/* sidebar'daki geçmiş — history sayfası sonra */}}
        className={`${btnBase} flex-1 ${isHistory ? active : passive}`}
      >
        <Clock className="h-5 w-5" strokeWidth={1.5} />
        <span>Geçmiş</span>
      </button>

      {/* Haftalık Analiz */}
      <Link href="/oruntu-analizi" className={`${btnBase} flex-1 ${isAnaliz ? active : passive}`}>
        <BarChart2 className="h-5 w-5" strokeWidth={1.5} />
        <span>Haftalık</span>
      </Link>

      {/* Blog / Sözlük */}
      <Link href="/ruya-tabirleri" className={`${btnBase} flex-1 ${isBlog ? active : passive}`}>
        <BookOpen className="h-5 w-5" strokeWidth={1.5} />
        <span>Tabirler</span>
      </Link>

      {/* Profil */}
      <Link href="/profile" className={`${btnBase} flex-1 ${isProfile ? active : passive}`}>
        <User className="h-5 w-5" strokeWidth={1.5} />
        <span>Profil</span>
      </Link>
    </nav>
  );
}