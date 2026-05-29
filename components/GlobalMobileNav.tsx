"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu, X, SquarePen, BookOpen, Library,
  BarChart2, Compass, ImageIcon, LogIn, LogOut, Loader2
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getChatList, type SidebarChat } from "@/app/actions/chat-actions";

// ─── Nav Linkleri ─────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "/blog",           icon: BookOpen,  label: "Blog"            },
  { href: "/ruya-tabirleri", icon: Library,   label: "Rüya Tabirleri"  },
  { href: "/oruntu-analizi", icon: BarChart2, label: "Haftalık Analiz" },
  { href: "/kesfet",         icon: Compass,   label: "Keşfet"          },
  { href: "/galerim",        icon: ImageIcon, label: "Rüya Galerim"    },
];

// ─── Avatar ───────────────────────────────────────────────────────────────────

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

// ─── Drawer ───────────────────────────────────────────────────────────────────

function MobileDrawer({
  open,
  onClose,
  user,
  credits,
}: {
  open: boolean;
  onClose: () => void;
  user: any;
  credits: number | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [chats, setChats] = useState<SidebarChat[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [, startTransition] = useTransition();

  // Drawer açılınca chat listesini çek
  useEffect(() => {
    if (!open) return;
    setLoadingChats(true);
    startTransition(async () => {
      const list = await getChatList();
      setChats(list);
      setLoadingChats(false);
    });
  }, [open]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onClose();
    router.push("/");
    router.refresh();
  };

  const handleSelectChat = (id: string) => {
    onClose();
    router.push(`/?chat=${id}`);
  };

  const handleNewChat = () => {
    onClose();
    router.push("/");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          md:hidden fixed inset-0 z-40 bg-black/40
          transition-opacity duration-300
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`
          md:hidden fixed left-0 top-0 bottom-0 z-50
          flex w-72 flex-col bg-white shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Başlık */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 shrink-0">
          <span className="text-sm font-semibold text-zinc-900">Rüya Yorumcum</span>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Yeni Analiz */}
        <div className="px-3 pt-3 pb-1 shrink-0">
          <button
            onClick={handleNewChat}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
          >
            <SquarePen className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            Yeni Analiz
          </button>
        </div>

        {/* Nav */}
        <div className="px-3 space-y-0.5 shrink-0">
          {NAV_LINKS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              {label}
            </Link>
          ))}
        </div>

        <div className="mx-3 my-2 border-t border-zinc-100 shrink-0" />

        {/* Geçmiş */}
        <div
          className="flex-1 overflow-y-auto px-3 pb-2 space-y-0.5"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {loadingChats ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-zinc-300" strokeWidth={1.5} />
            </div>
          ) : chats.length > 0 ? (
            <>
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                Geçmiş
              </p>
              {chats.map((chat) => {
                const title = chat.dream_title?.trim() || chat.dream_text?.slice(0, 40) || "Rüya";
                return (
                  <button
                    key={chat.id}
                    onClick={() => handleSelectChat(chat.id)}
                    className="w-full rounded-lg px-3 py-2 text-left hover:bg-zinc-100 transition-colors"
                  >
                    <p className="truncate text-xs leading-snug text-zinc-500">{title}</p>
                  </button>
                );
              })}
            </>
          ) : (
            <p className="px-3 py-4 text-xs text-zinc-400 text-center">
              Henüz analiz yok
            </p>
          )}
        </div>

        {/* Kullanıcı */}
        <div className="border-t border-zinc-100 px-3 py-3 shrink-0">
          {user ? (
            <div className="space-y-0.5">
              <Link
                href="/profile"
                onClick={onClose}
                className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-zinc-100 transition-colors"
              >
                <Avatar user={user} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-zinc-800">
                    {user.user_metadata?.full_name || user.email?.split("@")[0] || "Kullanıcı"}
                  </p>
                  {credits !== null && (
                    <p className="text-[11px] text-zinc-400">
                      <span className="font-semibold text-zinc-700">{credits}</span> kredi
                    </p>
                  )}
                </div>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-xs text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                Çıkış yap
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-lg px-2 py-2.5 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            >
              <LogIn className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              Giriş Yap
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────

export default function GlobalMobileNav() {
  const supabase = createClient();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles").select("credits").eq("id", user.id).single();
      if (profile) setCredits(profile.credits);

      // Realtime kredi güncellemesi
      const ch = supabase
        .channel(`globalnav-credits-${user.id}`)
        .on("postgres_changes", {
          event: "UPDATE", schema: "public",
          table: "profiles", filter: `id=eq.${user.id}`,
        }, (p) => setCredits((p.new as any).credits))
        .subscribe();

      cleanup = () => { supabase.removeChannel(ch); };
    };

    init();
    return () => { cleanup?.(); };
  }, []);

  return (
    <>
      {/* ── Header ── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between border-b border-zinc-100 bg-white/95 backdrop-blur-sm px-4"
        style={{
          height: "calc(3.5rem + env(safe-area-inset-top))",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        {/* Hamburger */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 transition-colors"
          aria-label="Menüyü aç"
        >
          <Menu className="h-5 w-5" strokeWidth={1.5} />
        </button>

        {/* Marka — tam orta */}
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
          <Link href="/auth" className="text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
            Giriş Yap
          </Link>
        )}
      </header>

      {/* ── Drawer ── */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        credits={credits}
      />
    </>
  );
}