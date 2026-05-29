"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenLine, Clock, BarChart2, Compass, User } from "lucide-react";

interface MobileNavProps {
  onNewChat:    () => void;
  activeChatId: string | null;
  onOpenHistory?: () => void; // <-- Kenar çubuğunu (geçmişi) açmak için eklendi
}

export default function MobileNav({ onNewChat, activeChatId, onOpenHistory }: MobileNavProps) {
  const pathname = usePathname();

  const isHome    = pathname === "/" && !activeChatId;
  const isHistory = pathname === "/" && !!activeChatId;
  const isAnaliz  = pathname === "/oruntu-analizi";
  const isKesfet  = pathname.startsWith("/kesfet") || pathname.startsWith("/galerim");
  const isProfile = pathname === "/profile";

  const base    = "flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors flex-1";
  const active  = "text-zinc-900";
  const passive = "text-zinc-400";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-zinc-200 bg-white/95 backdrop-blur-sm md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Yeni Analiz */}
      <button onClick={onNewChat} className={`${base} ${isHome ? active : passive}`}>
        <PenLine className="h-5 w-5" strokeWidth={1.5} />
        <span>Analiz</span>
      </button>

      {/* Geçmiş */}
      <button
        onClick={onOpenHistory} // <-- BOŞ FONKSİYON YERİNE YENİ PROP EKLENDİ
        className={`${base} ${isHistory ? active : passive}`}
      >
        <Clock className="h-5 w-5" strokeWidth={1.5} />
        <span>Geçmiş</span>
      </button>

      {/* Haftalık */}
      <Link href="/oruntu-analizi" className={`${base} ${isAnaliz ? active : passive}`}>
        <BarChart2 className="h-5 w-5" strokeWidth={1.5} />
        <span>Haftalık</span>
      </Link>

      {/* Keşfet — Galerimi de kapsar */}
      <Link href="/kesfet" className={`${base} ${isKesfet ? active : passive}`}>
        <Compass className="h-5 w-5" strokeWidth={1.5} />
        <span>Keşfet</span>
      </Link>

      {/* Profil */}
      <Link href="/profile" className={`${base} ${isProfile ? active : passive}`}>
        <User className="h-5 w-5" strokeWidth={1.5} />
        <span>Profil</span>
      </Link>
    </nav>
  );
}