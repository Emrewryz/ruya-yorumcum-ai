"use client";

import {
  useState, useTransition, useRef, useEffect, Suspense
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowUp, Loader2, AlertCircle, Share2, Check,
  Menu, X, SquarePen, BookOpen, Library,
  BarChart2, Compass, ImageIcon, LogIn, LogOut
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { analyzeDream, type DreamAnalysis } from "@/app/actions/analyze-dream";
import {
  getDreamSession, getChatList,
  type DreamSession, type ChatMessage, type SidebarChat
} from "@/app/actions/chat-actions";
import { sendFollowUp } from "@/app/actions/follow-up-actions";
import { generateShareToken } from "@/app/actions/share-actions";
import { refreshDailyCredits } from "@/app/actions/refresh-credits";
import PaywallCard from "@/components/PaywallCard";
import OruntuKarti from "@/components/OruntuKarti";
import DreamVisualizer from "@/components/DreamVisualizer";
import AppSidebar from "@/components/AppSidebar";
import CreditModal from "@/components/CreditModal";

// ─── Tipler ───────────────────────────────────────────────────────────────────

type Phase = "idle" | "loading" | "session";
type ModalReason = "NO_AUTH" | "NO_CREDIT";

const LOADING_STEPS = [
  "Metin analiz ediliyor...",
  "Semboller çözümleniyor...",
  "İslami kaynaklar taranıyor...",
  "Psikolojik örüntüler inceleniyor...",
  "Rapor derleniyor...",
];

// Drawer + AppSidebar arasında paylaşılan nav
const NAV_LINKS = [
  { href: "/blog",           icon: BookOpen,  label: "Blog"            },
  { href: "/ruya-tabirleri", icon: Library,   label: "Rüya Tabirleri"  },
  { href: "/oruntu-analizi", icon: BarChart2, label: "Haftalık Analiz" },
  { href: "/kesfet",         icon: Compass,   label: "Keşfet"          },
  { href: "/galerim",        icon: ImageIcon, label: "Rüya Galerim"    },
];

// ─── Yardımcılar ──────────────────────────────────────────────────────────────

function safeLines(text: string | null | undefined): string[] {
  if (!text) return [""];
  return text.split("\n");
}

function safeDate(d: string | null | undefined): string {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("tr-TR", {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch { return ""; }
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ user, size = "sm" }: { user: any; size?: "sm" | "md" }) {
  const letter =
    user?.user_metadata?.full_name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "M";
  return (
    <div className={`
      flex shrink-0 items-center justify-center rounded-full
      bg-zinc-900 font-bold text-white select-none
      ${size === "md" ? "h-8 w-8 text-xs" : "h-7 w-7 text-[11px]"}
    `}>
      {letter}
    </div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-sm border border-zinc-200 bg-zinc-50 px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="h-1.5 w-1.5 rounded-full bg-zinc-300 animate-bounce"
              style={{ animationDelay: `${delay}ms`, animationDuration: "900ms" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Mesaj Balonu ─────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  const lines = safeLines(msg.content);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`
        max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${isUser
          ? "bg-zinc-900 text-white rounded-br-sm"
          : "bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-bl-sm"
        }
      `}>
        {lines.map((line, i) => (
          <p key={i} className={line.trim() === "" ? "h-2" : "mb-1 last:mb-0"}>
            {line || "\u00A0"}
          </p>
        ))}
      </div>
    </div>
  );
}

// ─── Sticky Input ─────────────────────────────────────────────────────────────

function StickyInput({
  value, onChange, onSubmit, disabled, placeholder, minLength = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  placeholder?: string;
  minLength?: number;
}) {
  const isValid = (value?.trim()?.length ?? 0) >= minLength;
  const MAX = 1200;

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (isValid && !disabled) onSubmit();
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
    if ((el.value?.length ?? 0) <= MAX) onChange(el.value);
  }

  return (
    <div className="relative w-full rounded-2xl border border-zinc-200 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)] transition-shadow focus-within:shadow-[0_2px_24px_rgba(0,0,0,0.11)] focus-within:border-zinc-300">
      <textarea
        value={value ?? ""}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder ?? "Yazın..."}
        rows={3}
        style={{ resize: "none", minHeight: "80px" }}
        className="w-full bg-transparent px-4 pt-4 pb-10 text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:outline-none disabled:opacity-50"
      />
      <div className="absolute bottom-3 left-4 right-3 flex items-center justify-between">
        <span className={`text-xs tabular-nums ${(value?.length ?? 0) > MAX * 0.9 ? "text-amber-500" : "text-zinc-300"}`}>
          {(value?.length ?? 0) > 0 ? `${value.length}/${MAX}` : ""}
        </span>
        <div className="flex items-center gap-2">
          {!isValid && (value?.length ?? 0) > 0 && (
            <span className="text-xs text-zinc-300">
              {minLength - (value?.trim()?.length ?? 0)} karakter daha
            </span>
          )}
          <button
            onClick={onSubmit}
            disabled={!isValid || disabled}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-white transition-all hover:bg-zinc-700 disabled:bg-zinc-100 disabled:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
            aria-label="Gönder"
          >
            {disabled
              ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              : <ArrowUp className="h-4 w-4" strokeWidth={2} />
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Header ────────────────────────────────────────────────────────────

function MobileHeader({
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
      <span className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-zinc-900 pointer-events-none"
        style={{ bottom: "0.875rem" }}>
        Rüya Yorumcum
      </span>

      {/* Sağ: Avatar veya Giriş Yap */}
      {user ? (
        <Link href="/profile" aria-label="Profil">
          <Avatar user={user} size="md" />
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

// ─── Mobile Drawer ────────────────────────────────────────────────────────────

function MobileDrawer({
  open,
  onClose,
  user,
  credits,
  activeChatId,
  onSelectChat,
  onNewChat,
  refreshTrigger,
}: {
  open: boolean;
  onClose: () => void;
  user: any;
  credits: number | null;
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  refreshTrigger: number;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [chats, setChats] = useState<SidebarChat[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [, startTransition] = useTransition();

  // Drawer açıldığında veya refresh geldiğinde chat listesini yükle
  useEffect(() => {
    if (!open) return;
    setLoadingChats(true);
    startTransition(async () => {
      const list = await getChatList();
      setChats(list);
      setLoadingChats(false);
    });
  }, [open, refreshTrigger]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onClose();
    router.push("/");
    router.refresh();
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

      {/* Drawer paneli */}
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
        {/* Drawer başlık */}
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
            onClick={() => { onNewChat(); onClose(); }}
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
                const isActive = chat.id === activeChatId;
                return (
                  <button
                    key={chat.id}
                    onClick={() => { onSelectChat(chat.id); onClose(); }}
                    className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                      isActive ? "bg-zinc-200/70" : "hover:bg-zinc-100"
                    }`}
                  >
                    <p className={`truncate text-xs leading-snug ${
                      isActive ? "font-medium text-zinc-900" : "text-zinc-500"
                    }`}>
                      {title}
                    </p>
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

        {/* Alt: Kullanıcı */}
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

// ─── İç Bileşen ───────────────────────────────────────────────────────────────

function HomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Faz & içerik
  const [phase, setPhase] = useState<Phase>("idle");
  const [dreamText, setDreamText] = useState("");
  const [inputText, setInputText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [sidebarRefresh, setSidebarRefresh] = useState(0);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [session, setSession] = useState<DreamSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  // Follow-up
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [followUpLoading, setFollowUpLoading] = useState(false);

  // Örüntü kartı
  const [showOruntuKarti, setShowOruntuKarti] = useState(false);
  const [dreamCount, setDreamCount] = useState(1);

  // Share
  const [shareLoading, setShareLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  // Credit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalReason, setModalReason] = useState<ModalReason>("NO_CREDIT");

  // Mobile
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileUser, setMobileUser] = useState<any>(null);
  const [mobileCredits, setMobileCredits] = useState<number | null>(null);

  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Mobil kullanıcı + kredi ──
  useEffect(() => {
    const supabase = createClient();
    let cleanup: (() => void) | undefined;

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setMobileUser(user);
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles").select("credits").eq("id", user.id).single();
      if (profile) setMobileCredits(profile.credits);

      const ch = supabase
        .channel("homeclient-credits")
        .on("postgres_changes", {
          event: "UPDATE", schema: "public",
          table: "profiles", filter: `id=eq.${user.id}`,
        }, (p) => setMobileCredits((p.new as any).credits))
        .subscribe();

      cleanup = () => { supabase.removeChannel(ch); };
    };

    init();
    return () => { cleanup?.(); };
  }, []);

  // ── URL'den chat ID ──
  useEffect(() => {
    const chatId = searchParams?.get("chat");
    if (chatId && chatId !== activeChatId) {
      loadSession(chatId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ── Günlük kredi yenileme ──
  useEffect(() => {
    refreshDailyCredits().then((result) => {
      if (result.refreshed) {
        console.log(`[DailyRefresh] Kredi yenilendi → ${result.newCredits}`);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Loading adımları ──
  useEffect(() => {
    if (phase === "loading") {
      setLoadingStep(0);
      loadingRef.current = setInterval(() => {
        setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
      }, 2200);
    } else {
      if (loadingRef.current) clearInterval(loadingRef.current);
    }
    return () => { if (loadingRef.current) clearInterval(loadingRef.current); };
  }, [phase]);

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  };

  useEffect(() => {
    if (phase === "session" && localMessages.length > 0) scrollToBottom();
  }, [localMessages.length, followUpLoading]);

  // ── Sohbet yükle ──
  async function loadSession(chatId: string, retryCount = 0) {
    setSessionLoading(true);
    setActiveChatId(chatId);
    setPhase("session");
    setLocalMessages([]);
    try {
      const data = await getDreamSession(chatId);
      if (!data) {
        if (retryCount === 0) {
          setTimeout(() => loadSession(chatId, 1), 800);
          return;
        }
        setErrorMsg("Sohbet bulunamadı.");
        setPhase("idle");
        setActiveChatId(null);
        router.replace("/", { scroll: false });
      } else {
        setSession(data);
        setLocalMessages(data.messages ?? []);
        setErrorMsg(null);
      }
    } catch {
      if (retryCount === 0) {
        setTimeout(() => loadSession(chatId, 1), 800);
        return;
      }
      setPhase("idle");
    } finally {
      setSessionLoading(false);
    }
  }

  function handleSelectChat(id: string) {
    router.push(`/?chat=${id}`, { scroll: false });
    loadSession(id);
  }

  function handleNewChat() {
    setPhase("idle");
    setSession(null);
    setActiveChatId(null);
    setDreamText("");
    setInputText("");
    setErrorMsg(null);
    setLocalMessages([]);
    router.push("/", { scroll: false });
  }

  // ── İlk analiz ──
  function handleSubmitDream() {
    if ((dreamText?.trim()?.length ?? 0) < 10 || isPending) return;
    setErrorMsg(null);
    setPhase("loading");

    startTransition(async () => {
      try {
        const res = await analyzeDream(dreamText);

        if (!res.success) {
          setPhase("idle");
          if (res.code === "NO_CREDIT" || res.code === "GUEST_LIMIT") {
            setModalReason("NO_CREDIT");
            setModalOpen(true);
          } else {
            setErrorMsg(res.error ?? "Analiz başarısız.");
          }
          return;
        }

        const data = await getDreamSession(res.dreamId);
        if (data) {
          setSession(data);
          setActiveChatId(res.dreamId);
          setLocalMessages(data.messages ?? []);
          setPhase("session");
          setSidebarRefresh((n) => {
            setDreamCount(n + 1);
            return n + 1;
          });
          router.push(`/?chat=${res.dreamId}`, { scroll: false });
        }
      } catch {
        setErrorMsg("Beklenmeyen bir hata oluştu.");
        setPhase("idle");
      }
    });
  }

  // ── Follow-up ──
  async function handleFollowUp() {
    const msg = inputText?.trim();
    if (!msg || msg.length < 3 || followUpLoading || !activeChatId) return;

    const optimisticUser: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      role: "user",
      content: msg,
      created_at: new Date().toISOString(),
      credits_spent: 0,
    };
    setLocalMessages((prev) => [...prev, optimisticUser]);
    setInputText("");
    setFollowUpLoading(true);
    scrollToBottom();

    const result = await sendFollowUp(activeChatId, msg);

    if (!result.success) {
      setLocalMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
      setInputText(msg);
      if (result.code === "NO_CREDIT" || result.code === "NO_AUTH") {
        setModalReason(result.code);
        setModalOpen(true);
      } else {
        setErrorMsg(result.error ?? "Bir hata oluştu.");
      }
    } else {
      setLocalMessages((prev) => [
        ...prev.filter((m) => m.id !== optimisticUser.id),
        result.userMessage,
        result.assistantMessage,
      ]);
      setSidebarRefresh((n) => n + 1);
    }
    setFollowUpLoading(false);
  }

  // ── Paylaş ──
  async function handleShare() {
    if (!activeChatId || shareLoading) return;
    setShareLoading(true);
    setShareError(null);

    const result = await generateShareToken(activeChatId);
    if (!result.success) {
      setShareError(result.error);
      setShareLoading(false);
      return;
    }

    try {
      await navigator.clipboard.writeText(result.url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    } catch {
      setShareError(`Link: ${result.url}`);
    }
    setShareLoading(false);
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <CreditModal open={modalOpen} onClose={() => setModalOpen(false)} reason={modalReason} />

      {/* ── Mobil Header (fixed top) ── */}
      <MobileHeader user={mobileUser} onMenuOpen={() => setDrawerOpen(true)} />

      {/* ── Mobil Drawer ── */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={mobileUser}
        credits={mobileCredits}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        refreshTrigger={sidebarRefresh}
      />

      {/* Ana wrapper */}
      <div className="flex bg-white" style={{ height: "100dvh", overflow: "hidden" }}>

        {/* Desktop Sidebar */}
        <AppSidebar
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          refreshTrigger={sidebarRefresh}
        />

        <main className="flex flex-1 flex-col overflow-hidden">

          {/* Mobil header boşluğu */}
          <div
            className="md:hidden shrink-0"
            style={{ height: "calc(3.5rem + env(safe-area-inset-top))" }}
          />

          {/* ══ IDLE ══ */}
          {phase === "idle" && (
            <div className="relative flex flex-1 flex-col items-center justify-center px-6 overflow-hidden pb-36 md:pb-16 pt-4 md:pt-0">

              {/* Yapay Zeka Aurası */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div
                  className="absolute -top-10 -left-10 h-56 w-56 md:h-96 md:w-96 rounded-full bg-indigo-200/70 blur-[80px] md:blur-[120px] animate-pulse [animation-duration:5s]"
                  style={{ willChange: "opacity" }}
                />
                <div
                  className="absolute top-1/4 -right-10 h-52 w-52 md:h-[420px] md:w-[420px] rounded-full bg-violet-200/70 blur-[80px] md:blur-[120px] animate-pulse [animation-duration:7s] [animation-delay:1.5s]"
                  style={{ willChange: "opacity" }}
                />
                <div
                  className="absolute -bottom-10 left-1/4 h-48 w-48 md:h-80 md:w-80 rounded-full bg-sky-200/60 blur-[60px] md:blur-[100px] animate-pulse [animation-duration:6s] [animation-delay:3s]"
                  style={{ willChange: "opacity" }}
                />
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 md:h-52 md:w-52 rounded-full bg-rose-100/50 blur-[60px] md:blur-[90px] animate-pulse [animation-duration:8s] [animation-delay:2s]"
                  style={{ willChange: "opacity" }}
                />
              </div>

              {/* İçerik */}
              <div className="relative z-10 w-full flex flex-col items-center">
                <div className="mb-10 text-center">
                  {/* Mobil: Gemini tarzı kısa başlık */}
                  <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                    <span className="md:hidden">Zihninizin sırlarını çözün.</span>
                    <span className="hidden md:inline">Bilinçaltınıza hoş geldiniz.</span>
                  </h1>
                  <p className="mt-2 text-sm text-zinc-400">
                    Rüyanızı yazın — İslami gelenek ve Jung psikolojisi ile analiz edelim.
                  </p>
                </div>

                {errorMsg && (
                  <div className="mb-4 flex w-full max-w-xl items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Desktop input — mobilde fixed bottom'dan gösterilir */}
                <div className="hidden md:block w-full max-w-xl">
                  <StickyInput
                    value={dreamText}
                    onChange={setDreamText}
                    onSubmit={handleSubmitDream}
                    disabled={isPending}
                    placeholder="Bu gece ne gördünüz? Rüyanızı anlatın..."
                    minLength={10}
                  />
                  <p className="mt-2.5 text-center text-xs text-zinc-300">
                    İlk analiz ücretsiz · Kayıt gerekmez ·{" "}
                    <kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[10px] text-zinc-400">⌘ Enter</kbd>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ══ LOADING ══ */}
          {phase === "loading" && (
            <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6">
              <div className="w-full max-w-sm">
                <div className="h-px w-full overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-zinc-900 transition-all duration-[2200ms] ease-linear"
                    style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                <span>{LOADING_STEPS[loadingStep]}</span>
              </div>
            </div>
          )}

          {/* ══ SESSION ══ */}
          {phase === "session" && (
            <div className="flex flex-1 flex-col overflow-hidden">

              {/* Sohbet akışı — mobilde fixed input için pb-36 */}
              <div
                className="flex-1 overflow-y-auto pb-36 md:pb-0"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {sessionLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-zinc-300" strokeWidth={1.5} />
                  </div>
                ) : session ? (
                  <div className="mx-auto w-full max-w-2xl space-y-6 px-6 py-8">

                    {/* Rüya metni */}
                    <div>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Rüya</p>
                        <button
                          onClick={handleShare}
                          disabled={shareLoading}
                          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs text-zinc-400 transition-all hover:border-zinc-300 hover:text-zinc-600 disabled:opacity-50"
                        >
                          {shareLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} />
                          ) : shareCopied ? (
                            <Check className="h-3 w-3 text-emerald-500" strokeWidth={2} />
                          ) : (
                            <Share2 className="h-3 w-3" strokeWidth={1.5} />
                          )}
                          <span className={shareCopied ? "text-emerald-500 font-medium" : ""}>
                            {shareLoading ? "..." : shareCopied ? "Kopyalandı!" : "Paylaş"}
                          </span>
                        </button>
                      </div>

                      {shareError && (
                        <div className="mb-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 break-all">
                          {shareError}
                        </div>
                      )}

                      <p className="border-l-2 border-zinc-200 pl-4 text-sm leading-relaxed text-zinc-500">
                        {session.dream_text ?? "—"}
                      </p>
                      {session.created_at && (
                        <p className="mt-1.5 text-xs text-zinc-300">{safeDate(session.created_at)}</p>
                      )}
                    </div>

                    <div className="border-t border-zinc-100" />

                    {session.ai_response?.kisa_ozet && (
                      <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                          Genel Değerlendirme
                        </p>
                        <p className="text-base leading-relaxed text-zinc-800">
                          {session.ai_response.kisa_ozet}
                        </p>
                      </div>
                    )}

                    {session.ai_response && (
                      <PaywallCard
                        dreamId={session.id}
                        islamiAnaliz={session.ai_response.islami_analiz ?? ""}
                        psikolojikAnaliz={session.ai_response.psikolojik_analiz ?? ""}
                        semboller={session.ai_response.semboller ?? ""}
                        initialIslamiUnlocked={session.islami_unlocked ?? false}
                        initialPsikolojikUnlocked={session.psikolojik_unlocked ?? false}
                        onUnlocked={() => setShowOruntuKarti(true)}
                      />
                    )}

                    {showOruntuKarti && <OruntuKarti dreamCount={dreamCount} />}

                    <DreamVisualizer
                      dreamId={session.id}
                      dreamText={session.dream_text}
                      existingImageUrl={session.image_url ?? null}
                    />

                    {localMessages.length > 0 && (
                      <div className="space-y-4 pt-2">
                        <div className="border-t border-zinc-100" />
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                          Devam Soruları
                        </p>
                        {localMessages.map((msg) => (
                          <MessageBubble key={msg.id} msg={msg} />
                        ))}
                      </div>
                    )}

                    {followUpLoading && (
                      <div className="space-y-4">
                        {localMessages.length === 0 && <div className="border-t border-zinc-100" />}
                        <TypingIndicator />
                      </div>
                    )}

                    {errorMsg && (
                      <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <div ref={bottomRef} className="h-2" />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                    Sohbet yüklenemedi.
                  </div>
                )}
              </div>

              {/* Desktop sticky input */}
              <div
                className="hidden md:block shrink-0 border-t border-zinc-100 bg-white px-4 py-3"
                style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
              >
                <div className="mx-auto w-full max-w-2xl">
                  <StickyInput
                    value={inputText}
                    onChange={setInputText}
                    onSubmit={handleFollowUp}
                    disabled={followUpLoading || isPending}
                    placeholder="Rüyanız hakkında bir soru sorun..."
                    minLength={3}
                  />
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ══ Mobil Fixed Bottom Input ══
          Loading dışında her fazda görünür.
          Idle → rüya analiz inputu
          Session → follow-up inputu                         */}
      {phase !== "loading" && (
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-t border-zinc-100 px-4 pt-3"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          {/* Mistik Aura — focus'ta belirginleşir */}
          <div className="relative group/aura">
            <div
              className="pointer-events-none absolute -inset-[2px] rounded-[18px] bg-gradient-to-r from-amber-200/60 via-violet-200/60 to-sky-200/60 blur-sm opacity-50 animate-pulse [animation-duration:4s] group-focus-within/aura:opacity-100 transition-opacity duration-500"
              style={{ willChange: "opacity" }}
              aria-hidden="true"
            />
            <div className="relative">
              <StickyInput
                value={phase === "idle" ? dreamText : inputText}
                onChange={phase === "idle" ? setDreamText : setInputText}
                onSubmit={phase === "idle" ? handleSubmitDream : handleFollowUp}
                disabled={isPending || followUpLoading}
                placeholder={
                  phase === "idle"
                    ? "Rüyanızı anlatın..."
                    : "Soru sorun..."
                }
                minLength={phase === "idle" ? 10 : 3}
              />
            </div>
          </div>

          {phase === "idle" && (
            <p className="mt-1.5 text-center text-[11px] text-zinc-300">
              İlk analiz ücretsiz · Kayıt gerekmez
            </p>
          )}
        </div>
      )}
    </>
  );
}

// ─── Wrapper ──────────────────────────────────────────────────────────────────

export default function HomeClient() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-300" strokeWidth={1.5} />
      </div>
    }>
      <HomeInner />
    </Suspense>
  );
}