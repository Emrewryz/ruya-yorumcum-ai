"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Menu, X, Moon, Coins } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single();

      if (profile) setCredits(profile.credits);

      const channel = supabase
        .channel("navbar-credits")
        .on("postgres_changes", {
          event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}`
        }, (payload) => setCredits((payload.new as any).credits))
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };
    init();
  }, [supabase]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navLinks = [
    { href: "/blog", label: "Blog" },
    { href: "/sozluk", label: "Sözlük" },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      isScrolled || mobileOpen
        ? "bg-white/95 backdrop-blur-sm border-b border-zinc-200 shadow-sm"
        : "bg-transparent border-b border-transparent"
    }`}>
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5 md:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group z-50" onClick={() => setMobileOpen(false)}>
          <Moon className="h-4 w-4 text-zinc-900" strokeWidth={1.5} />
          <span className="text-sm font-bold tracking-tight text-zinc-900">
            Rüya Yorumcum
          </span>
        </Link>

        {/* Masaüstü Nav */}
        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={`text-sm transition-colors ${
              pathname?.startsWith(link.href) ? "text-zinc-900 font-medium" : "text-zinc-500 hover:text-zinc-800"
            }`}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Masaüstü Sağ */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <div className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600">
                <Coins className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.5} />
                {credits ?? "—"} kredi
              </div>
              <Link href="/auth" className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-900 text-xs font-bold text-white">
                {user.user_metadata?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth?mode=login" className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors">
                Giriş
              </Link>
              <Link href="/auth?mode=signup" className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors">
                Kayıt Ol
              </Link>
            </>
          )}
        </div>

        {/* Mobil Hamburger */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 md:hidden z-50"
          aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </nav>

      {/* Mobil Menü */}
      <div className={`md:hidden transition-all duration-200 overflow-hidden ${mobileOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="border-t border-zinc-200 bg-white px-5 py-5 space-y-4">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-zinc-700 hover:text-zinc-900">
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-zinc-100 grid grid-cols-2 gap-2">
            {user ? (
              <Link href="/auth" onClick={() => setMobileOpen(false)}
                className="col-span-2 rounded-lg bg-zinc-900 py-2.5 text-center text-sm font-semibold text-white">
                Profilim
              </Link>
            ) : (
              <>
                <Link href="/auth?mode=login" onClick={() => setMobileOpen(false)}
                  className="rounded-lg border border-zinc-200 py-2.5 text-center text-sm font-semibold text-zinc-700">
                  Giriş
                </Link>
                <Link href="/auth?mode=signup" onClick={() => setMobileOpen(false)}
                  className="rounded-lg bg-zinc-900 py-2.5 text-center text-sm font-semibold text-white">
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}