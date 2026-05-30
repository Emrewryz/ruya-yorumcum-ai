"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

function Avatar({ user }: { user: any }) {
  const letter =
    user?.user_metadata?.full_name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "M";
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white select-none">
      {letter}
    </div>
  );
}

export default function MobileHeader({
  user,
  onMenuOpen,
}: {
  user: any;
  onMenuOpen: () => void;
}) {
  return (
    <header
      className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between border-b border-zinc-100 bg-white/95 backdrop-blur-sm px-4"
      style={{
        height: "calc(3.5rem + env(safe-area-inset-top))",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      {/* Hamburger */}
      <button
        onClick={onMenuOpen}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 transition-colors"
        aria-label="Menüyü aç"
      >
        <Menu className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {/* Marka adı — tam orta */}
      <span
        className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-zinc-900 pointer-events-none"
        style={{ bottom: "0.875rem" }}
      >
        Rüya Yorumcum
      </span>

      {/* Sağ: Avatar veya Giriş Yap */}
      {user ? (
        <Link href="/profile" aria-label="Profil">
          <Avatar user={user} />
        </Link>
      ) : (
        <Link
          href="/auth"
          className="text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          Giriş Yap
        </Link>
      )}
    </header>
  );
}