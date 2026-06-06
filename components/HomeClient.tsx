"use client";

import { useState, useTransition, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2, AlertCircle, Share2, Check } from "lucide-react";

// ─── Statik import — ilk render'da gerekli ───────────────────────────────────
import AppSidebar        from "@/components/AppSidebar";
import GlobalMobileNav   from "@/components/GlobalMobileNav";
import { createClient }  from "@/utils/supabase/client";

// ─── Alt bileşenler — components/home/ altına taşındı ────────────────────────
import StickyInput, { clearDraft } from "@/components/home/StickyInput";
import MessageBubble                from "@/components/home/MessageBubble";
import TypingIndicator              from "@/components/home/TypingIndicator";
import MobileHeader                 from "@/components/home/MobileHeader";
import MobileDrawer                 from "@/components/home/MobileDrawer";

// ─── Server Actions ───────────────────────────────────────────────────────────
import { analyzeDream }        from "@/app/actions/analyze-dream";
import {
  getDreamSession,
  type DreamSession,
  type ChatMessage,
} from "@/app/actions/chat-actions";
import { sendFollowUp }        from "@/app/actions/follow-up-actions";
import { generateShareToken }  from "@/app/actions/share-actions";

// ─── Ağır bileşenler — lazy load (idle'da kullanılmaz) ───────────────────────
const PaywallCard     = dynamic(() => import("@/components/PaywallCard"),     { ssr: false });
const OruntuKarti     = dynamic(() => import("@/components/OruntuKarti"),     { ssr: false });
const DreamVisualizer = dynamic(() => import("@/components/DreamVisualizer"), { ssr: false });
const CreditModal     = dynamic(() => import("@/components/CreditModal"),     { ssr: false });

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

// ─── Yardımcılar ──────────────────────────────────────────────────────────────

function safeDate(d: string | null | undefined): string {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("tr-TR", {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch { return ""; }
}

// ─── İç Bileşen ───────────────────────────────────────────────────────────────

function HomeInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  // Faz & içerik
  const [phase, setPhase]                   = useState<Phase>("idle");
  const [dreamText, setDreamText]           = useState("");
  const [inputText, setInputText]           = useState("");
  const [errorMsg, setErrorMsg]             = useState<string | null>(null);
  const [loadingStep, setLoadingStep]       = useState(0);
  const [sidebarRefresh, setSidebarRefresh] = useState(0);
  const [activeChatId, setActiveChatId]     = useState<string | null>(null);
  const [session, setSession]               = useState<DreamSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  // Follow-up
  const [localMessages, setLocalMessages]     = useState<ChatMessage[]>([]);
  const [followUpLoading, setFollowUpLoading] = useState(false);

  // Örüntü kartı
  const [showOruntuKarti, setShowOruntuKarti] = useState(false);
  const [dreamCount, setDreamCount]           = useState(1);

  // Share
  const [shareLoading, setShareLoading] = useState(false);
  const [shareCopied, setShareCopied]   = useState(false);
  const [shareError, setShareError]     = useState<string | null>(null);

  // Credit Modal
  const [modalOpen, setModalOpen]     = useState(false);
  const [modalReason, setModalReason] = useState<ModalReason>("NO_CREDIT");

  // Mobil
  const [drawerOpen, setDrawerOpen]       = useState(false);
  const [mobileUser, setMobileUser]       = useState<any>(null);
  const [mobileCredits, setMobileCredits] = useState<number | null>(null);

  const [isPending, startTransition] = useTransition();
  const bottomRef  = useRef<HTMLDivElement>(null);
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
    if (chatId && chatId !== activeChatId) loadSession(chatId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ── Günlük kredi yenileme kaldırıldı ──
  // Kullanıcılar artık günlük ücretsiz kredi almıyor.
  // Yeni kayıt bonusu: 3 kredi (tek seferlik)

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
        if (retryCount === 0) { setTimeout(() => loadSession(chatId, 1), 800); return; }
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
      if (retryCount === 0) { setTimeout(() => loadSession(chatId, 1), 800); return; }
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

    // Kredi kontrolü — kayıtlı kullanıcıysa önce kredisini kontrol et
    if (mobileUser && (mobileCredits ?? 0) < 1) {
      setModalReason("NO_CREDIT");
      setModalOpen(true);
      return;
    }

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
          clearDraft(); // ── Başarılı analiz → taslağı temizle
          setSession(data);
          setActiveChatId(res.dreamId);
          setLocalMessages(data.messages ?? []);
          setPhase("session");
          setSidebarRefresh((n) => { setDreamCount(n + 1); return n + 1; });
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
    if (!result.success) { setShareError(result.error); setShareLoading(false); return; }
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

      <MobileHeader user={mobileUser} onMenuOpen={() => setDrawerOpen(true)} />

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

      <div className="flex bg-white" style={{ height: "100dvh", overflow: "hidden" }}>
        <AppSidebar
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          refreshTrigger={sidebarRefresh}
        />

        <main className="flex flex-1 flex-col overflow-hidden">

          <div className="md:hidden shrink-0" style={{ height: "calc(3.5rem + env(safe-area-inset-top))" }} />

          {/* ══ IDLE ══ */}
          {phase === "idle" && (
            <div className="relative flex flex-1 flex-col items-center justify-center px-6 overflow-hidden pb-36 md:pb-20 pt-4 md:pt-0">

              {/* Yapay Zeka Aurası */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
                style={{ contain: "paint layout" }}
              >
                <div className="absolute -top-10 -left-10 h-56 w-56 md:h-96 md:w-96 rounded-full bg-indigo-200/70 blur-3xl md:blur-[120px] animate-pulse transform-gpu [animation-duration:5s] [backface-visibility:hidden]" style={{ willChange: "opacity" }} />
                <div className="absolute top-1/4 -right-10 h-52 w-52 md:h-[420px] md:w-[420px] rounded-full bg-violet-200/70 blur-3xl md:blur-[120px] animate-pulse transform-gpu [animation-duration:7s] [animation-delay:1.5s] [backface-visibility:hidden]" style={{ willChange: "opacity" }} />
                <div className="hidden md:block absolute -bottom-10 left-1/4 h-80 w-80 rounded-full bg-sky-200/60 blur-[100px] animate-pulse transform-gpu [animation-duration:6s] [animation-delay:3s] [backface-visibility:hidden]" style={{ willChange: "opacity" }} />
                <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-52 w-52 rounded-full bg-rose-100/50 blur-[90px] animate-pulse transform-gpu [animation-duration:8s] [animation-delay:2s] [backface-visibility:hidden]" style={{ willChange: "opacity" }} />
              </div>

              <div className="relative z-10 w-full flex flex-col items-center">
                <div className="mb-10 text-center">
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

                {/* Desktop input */}
                <div className="hidden md:block w-full max-w-xl">
                  <StickyInput
                    value={dreamText}
                    onChange={setDreamText}
                    onSubmit={handleSubmitDream}
                    disabled={isPending}
                    placeholder="Bu gece ne gördünüz? Rüyanızı anlatın..."
                    minLength={10}
                    enableDraft
                  />
                  <p className="mt-2.5 text-center text-xs text-zinc-300">
                    İlk analiz ücretsiz · Kayıt gerekmez ·{" "}
                    <kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[10px] text-zinc-400">⌘ Enter</kbd>
                  </p>
                </div>
              </div>

              {/* Footer linkleri — sadece desktop, idle fazında */}
              <div className="hidden md:flex absolute bottom-0 left-0 right-0 items-center justify-center gap-5 border-t border-zinc-100 bg-white/90 backdrop-blur-sm py-3 z-10">
                <span className="text-[11px] text-zinc-300">© {new Date().getFullYear()} Rüya Yorumcum</span>
                {[
                  { href: "/gizlilik",       label: "Gizlilik" },
                  { href: "/mesafeli-satis", label: "Mesafeli Satış" },
                  { href: "/iptal-iade",     label: "İptal & İade" },
                  { href: "mailto:destek@ruyayorumcum.com.tr", label: "İletişim" },
                ].map(({ href, label }) => (
                  <a key={href} href={href} className="text-[11px] text-zinc-400 hover:text-zinc-700 transition-colors">
                    {label}
                  </a>
                ))}
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
              <div className="flex-1 overflow-y-auto pb-36 md:pb-0" style={{ scrollbarWidth: "none" }}>
                {sessionLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-zinc-300" strokeWidth={1.5} />
                  </div>
                ) : session ? (
                  <div className="mx-auto w-full max-w-2xl space-y-6 px-6 py-8">

                    <div>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Rüya</p>
                        <button
                          onClick={handleShare}
                          disabled={shareLoading}
                          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs text-zinc-400 transition-all hover:border-zinc-300 hover:text-zinc-600 disabled:opacity-50"
                        >
                          {shareLoading ? <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} />
                            : shareCopied  ? <Check className="h-3 w-3 text-emerald-500" strokeWidth={2} />
                            : <Share2 className="h-3 w-3" strokeWidth={1.5} />}
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
  detayliTahlil={
    session.ai_response.detayli_tahlil ??
    [session.ai_response.islami_analiz, session.ai_response.psikolojik_analiz]
      .filter(Boolean).join("\n\n") ??
    ""
  }
  semboller={session.ai_response.semboller ?? ""}
  initialUnlocked={
    session.detay_unlocked ||
    session.islami_unlocked ||
    session.psikolojik_unlocked
  }
  onUnlocked={() => setShowOruntuKarti(true)}
/>
                    )}

                    {showOruntuKarti && <OruntuKarti dreamCount={dreamCount} />}

                    <DreamVisualizer
                      dreamId={session.id}
                      dreamText={session.dream_text}
                      existingImageUrl={session.image_url ?? null}
                    />

                    {/* ── Hazır Sorular — henüz mesaj yokken göster ── */}
                    {localMessages.length === 0 && !followUpLoading && (
                      <div className="pt-2">
                        <div className="border-t border-zinc-100 mb-4" />
                        <p className="mb-3 text-xs text-zinc-400">
                          Rüyanız hakkında merak ettiğiniz bir şey var mı?
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Bu rüyanın hayatımdaki anlamı nedir?",
                            "Bu rüyayı tekrar görürsem ne yapmalıyım?",
                            "Rüyadaki semboller bana ne söylüyor?",
                          ].map((q) => (
                            <button
                              key={q}
                              onClick={() => {
                                setInputText(q);
                                setTimeout(() => {
                                  const msg = q.trim();
                                  if (!msg || followUpLoading || !activeChatId) return;
                                  const optimistic: ChatMessage = {
                                    id: `optimistic-${Date.now()}`,
                                    role: "user",
                                    content: msg,
                                    created_at: new Date().toISOString(),
                                    credits_spent: 0,
                                  };
                                  setLocalMessages((prev) => [...prev, optimistic]);
                                  setInputText("");
                                  setFollowUpLoading(true);
                                  scrollToBottom();
                                  sendFollowUp(activeChatId, msg).then((result) => {
                                    if (!result.success) {
                                      setLocalMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
                                      setInputText(msg);
                                      if (result.code === "NO_CREDIT" || result.code === "NO_AUTH") {
                                        setModalReason(result.code);
                                        setModalOpen(true);
                                      } else {
                                        setErrorMsg(result.error ?? "Bir hata oluştu.");
                                      }
                                    } else {
                                      setLocalMessages((prev) => [
                                        ...prev.filter((m) => m.id !== optimistic.id),
                                        result.userMessage,
                                        result.assistantMessage,
                                      ]);
                                      setSidebarRefresh((n) => n + 1);
                                    }
                                    setFollowUpLoading(false);
                                  });
                                }, 0);
                              }}
                              disabled={followUpLoading || isPending}
                              className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs text-zinc-600 transition-all hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 active:scale-[0.98] disabled:opacity-40"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Mesaj geçmişi ── */}
                    {localMessages.length > 0 && (
                      <div className="space-y-4 pt-2">
                        <div className="border-t border-zinc-100" />
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

      {/* ══ Mobil Fixed Bottom Input ══ */}
      {phase !== "loading" && (
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-t border-zinc-100 px-4 pt-3"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
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
                placeholder={phase === "idle" ? "Rüyanızı anlatın..." : "Soru sorun..."}
                minLength={phase === "idle" ? 10 : 3}
                enableDraft={phase === "idle"}
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