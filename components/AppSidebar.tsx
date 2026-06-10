"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  PanelLeftClose, PanelLeftOpen, SquarePen,
  BookOpen, Library, LogIn, LogOut, Loader2,
  BarChart2, Compass, Brain
} from "lucide-react";
import { getChatList, type SidebarChat } from "@/app/actions/chat-actions";

// ─── Nav Linkleri ─────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "/blog",           icon: BookOpen,  label: "Blog"            },
  { href: "/ruya-tabirleri", icon: Library,   label: "Rüya Tabirleri"  },
  { href: "/testler",        icon: Brain,     label: "Testler"         },

];

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ user }: { user: any }) {
  const letter =
    user?.user_metadata?.full_name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "M";
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-bold text-white select-none">
      {letter}
    </div>
  );
}

// ─── Chat Listesi Öğesi ───────────────────────────────────────────────────────

function ChatItem({
  chat,
  isActive,
  onClick,
}: {
  chat: SidebarChat;
  isActive: boolean;
  onClick: () => void;
}) {
  const title =
    chat.dream_title?.trim() ||
    chat.dream_text?.slice(0, 40) ||
    "Rüya";

  return (
    <button
      onClick={onClick}
      className={`
        w-full rounded-lg px-3 py-1.5 text-left transition-colors
        ${isActive
          ? "bg-zinc-200/70 text-zinc-900 font-medium"
          : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
        }
      `}
    >
      <p className="truncate text-[11px] leading-snug">
        {title}
      </p>
    </button>
  );
}

// ─── Ana Sidebar ──────────────────────────────────────────────────────────────

export default function AppSidebar({
  activeChatId,
  onSelectChat,
  onNewChat,
  refreshTrigger,
}: {
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  refreshTrigger: number;
}) {
  const supabase = createClient();
  const router   = useRouter();

  const [isCollapsed, setIsCollapsed]   = useState(false);
  const [user, setUser]                 = useState<any>(null);
  const [credits, setCredits]           = useState<number | null>(null);
  const [chats, setChats]               = useState<SidebarChat[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [, startTransition]             = useTransition();

  // ── Auth + kredi ──
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles").select("credits").eq("id", user.id).single();
      if (profile) setCredits(profile.credits);

      const ch = supabase
        .channel("sidebar-credits")
        .on("postgres_changes", {
          event: "UPDATE", schema: "public",
          table: "profiles", filter: `id=eq.${user.id}`,
        }, (p) => setCredits((p.new as any).credits))
        .subscribe();

      return () => { supabase.removeChannel(ch); };
    };
    init();
  }, [supabase]);

  // ── Chat listesi ──
  useEffect(() => {
    setLoadingChats(true);
    startTransition(async () => {
      const list = await getChatList();
      setChats(list);
      setLoadingChats(false);
    });
  }, [refreshTrigger]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <aside
      className={`
        hidden md:flex flex-col
        border-r border-zinc-200 bg-zinc-50
        h-screen sticky top-0 overflow-hidden shrink-0
        transition-[width] duration-200 ease-in-out
        ${isCollapsed ? "w-14" : "w-56"}
      `}
    >

      {/* ── 1. Üst: Toggle + Logo ── */}
      <div className={`
        flex items-center border-b border-zinc-200 shrink-0
        ${isCollapsed ? "flex-col gap-1 px-0 py-3" : "flex-row gap-1 px-3 py-3"}
      `}>
        <button
          onClick={() => setIsCollapsed((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-900 transition-colors shrink-0"
          aria-label={isCollapsed ? "Paneli genişlet" : "Paneli daralt"}
        >
          {isCollapsed
            ? <PanelLeftOpen  className="h-4 w-4" strokeWidth={1.5} />
            : <PanelLeftClose className="h-4 w-4" strokeWidth={1.5} />
          }
        </button>
        {!isCollapsed && (
          <span className="ml-1 text-sm font-semibold text-zinc-900 truncate flex-1">
            Rüya Yorumcum
          </span>
        )}
      </div>

      {/* ── 2. Yeni Analiz ── */}
      {!isCollapsed ? (
        <div className="px-3 pt-2.5 pb-1 shrink-0">
          <button
            onClick={onNewChat}
            className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600 shadow-sm hover:border-zinc-300 hover:text-zinc-900 transition-colors"
          >
            <SquarePen className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
            Yeni Analiz
          </button>
        </div>
      ) : (
        <div className="flex justify-center pt-1.5 pb-0.5 shrink-0">
          <button
            onClick={onNewChat}
            title="Yeni Analiz"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-900 transition-colors"
          >
            <SquarePen className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* ── 3. Orta Alan (scroll) ── */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >

        {/* Orta Alan 1: Nav Linkleri */}
        {!isCollapsed ? (
          <div className="px-3 pt-2 pb-1 space-y-0.5">
            {NAV_LINKS.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                {label}
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-0.5 px-1 pt-2 pb-1">
            {NAV_LINKS.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                title={label}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-900 transition-colors"
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            ))}
          </div>
        )}

        {/* Ayırıcı */}
        {!isCollapsed && <div className="mx-3 my-1 border-t border-zinc-100" />}
        {isCollapsed  && <div className="mx-auto my-1 w-6 border-t border-zinc-100" />}

        {/* Orta Alan 2: Geçmiş Sohbetler */}
        {!isCollapsed && (
          <div className="px-3 pb-3 space-y-0.5">
            {loadingChats ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-300" strokeWidth={1.5} />
              </div>
            ) : chats.length === 0 ? (
              <p className="px-3 py-3 text-[11px] text-zinc-400 text-center">
                Henüz analiz yok
              </p>
            ) : (
              <>
                <p className="px-3 pb-1 pt-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Geçmiş
                </p>
                {chats.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeChatId}
                    onClick={() => onSelectChat(chat.id)}
                  />
                ))}
              </>
            )}
          </div>
        )}

      </div>

      {/* ── 4. Alt: Kullanıcı / Auth ── */}
      <div className={`
        border-t border-zinc-200 shrink-0
        ${isCollapsed ? "flex flex-col items-center py-3 gap-2" : "px-3 py-3"}
      `}>
        {isCollapsed ? (
          user ? (
            <Link href="/profile" title="Profil">
              <div className="transition-opacity hover:opacity-70">
                <Avatar user={user} />
              </div>
            </Link>
          ) : (
            <Link href="/auth" title="Giriş Yap">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300 text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 transition-colors">
                <LogIn className="h-3.5 w-3.5" strokeWidth={1.5} />
              </div>
            </Link>
          )
        ) : (
          user ? (
            <div className="space-y-0.5">
              <Link
                href="/profile"
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
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
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                Çıkış yap
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            >
              <LogIn className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              Giriş Yap
            </Link>
          )
        )}
      </div>

    </aside>
  );
}