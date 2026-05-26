"use client";

import {
  useState, useTransition, useRef,
  useEffect, Suspense
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUp, Loader2, AlertCircle, Share2, Check } from "lucide-react";
import { analyzeDream, type DreamAnalysis } from "@/app/actions/analyze-dream";
import { getDreamSession, type DreamSession, type ChatMessage } from "@/app/actions/chat-actions";
import { sendFollowUp } from "@/app/actions/follow-up-actions";
import { generateShareToken } from "@/app/actions/share-actions";
import { refreshDailyCredits } from "@/app/actions/refresh-credits";
import PaywallCard from "@/components/PaywallCard";
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

// ─── Güvenli yardımcılar ──────────────────────────────────────────────────────

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

// ─── Typing Indicator ────────────────────────────────────────────────────────

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

// ─── İç Bileşen ───────────────────────────────────────────────────────────────

function HomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [phase, setPhase] = useState<Phase>("idle");
  const [dreamText, setDreamText] = useState("");
  const [inputText, setInputText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [sidebarRefresh, setSidebarRefresh] = useState(0);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [session, setSession] = useState<DreamSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  // Follow-up state
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [followUpLoading, setFollowUpLoading] = useState(false);

  // Share state
  const [shareLoading, setShareLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  // Credit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalReason, setModalReason] = useState<ModalReason>("NO_CREDIT");

  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // URL'den chat ID oku
  useEffect(() => {
    const chatId = searchParams?.get("chat");
    if (chatId && chatId !== activeChatId) {
      loadSession(chatId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Günlük kredi yenileme — sayfa açılınca sessizce kontrol et
  useEffect(() => {
    refreshDailyCredits().then((result) => {
      if (result.refreshed) {
        console.log(`[DailyRefresh] Kredi yenilendi → ${result.newCredits}`);
        // AppSidebar Supabase realtime ile otomatik güncellenir
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loading adımları
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

  // Otomatik scroll — yeni mesajda
  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  };

  useEffect(() => {
    if (phase === "session") scrollToBottom();
  }, [localMessages.length, followUpLoading, phase]);

  // ── Sohbet yükle ──
  async function loadSession(chatId: string) {
    setSessionLoading(true);
    setActiveChatId(chatId);
    setPhase("session");
    setLocalMessages([]);
    try {
      const data = await getDreamSession(chatId);
      if (!data) {
        setErrorMsg("Sohbet bulunamadı.");
        setPhase("idle");
        setActiveChatId(null);
      } else {
        setSession(data);
        setLocalMessages(data.messages ?? []);
        setErrorMsg(null);
      }
    } catch {
      setErrorMsg("Sohbet yüklenirken hata oluştu.");
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

  // ── İlk analiz gönder ──
  function handleSubmitDream() {
    if ((dreamText?.trim()?.length ?? 0) < 10 || isPending) return;
    setErrorMsg(null);
    setPhase("loading");

    startTransition(async () => {
      try {
        const res = await analyzeDream(dreamText);

        if (!res.success) {
          setPhase("idle");

          // Kredi yoksa veya giriş gerekmiyorsa → modal aç
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
          setSidebarRefresh((n) => n + 1);
          router.push(`/?chat=${res.dreamId}`, { scroll: false });
        }
      } catch {
        setErrorMsg("Beklenmeyen bir hata oluştu.");
        setPhase("idle");
      }
    });
  }

  // ── Follow-up gönder ──
  async function handleFollowUp() {
    const msg = inputText?.trim();
    if (!msg || msg.length < 3 || followUpLoading || !activeChatId) return;

    // Optimistic: kullanıcı mesajını hemen ekle
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
      // Optimistic mesajı geri al
      setLocalMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
      setInputText(msg); // yazdığını geri ver

      if (result.code === "NO_CREDIT" || result.code === "NO_AUTH") {
        setModalReason(result.code);
        setModalOpen(true);
      } else {
        setErrorMsg(result.error ?? "Bir hata oluştu.");
      }
    } else {
      // Optimistic'i gerçek mesajla değiştir + assistant ekle
      setLocalMessages((prev) => [
        ...prev.filter((m) => m.id !== optimisticUser.id),
        result.userMessage,
        result.assistantMessage,
      ]);
      // Sidebar'daki "last message" güncellensin
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
      {/* Credit Modal — HomeClient seviyesinde (follow-up için) */}
      <CreditModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        reason={modalReason}
      />

      <div className="flex h-screen overflow-hidden bg-white">

        <AppSidebar
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          refreshTrigger={sidebarRefresh}
        />

        <main className="flex flex-1 flex-col overflow-hidden bg-white">

          {/* ══ IDLE ══ */}
          {phase === "idle" && (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 overflow-y-auto">
              <div className="mb-10 text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  Bilinçaltınıza hoş geldiniz.
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

              <div className="w-full max-w-xl">
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
          )}

          {/* ══ LOADING (İlk analiz) ══ */}
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

              {/* Sohbet akışı */}
              <div
                className="flex-1 overflow-y-auto"
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
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                          Rüya
                        </p>
                        {/* ── Paylaş Butonu ── */}
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

                      {/* Share error / URL fallback */}
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

                    {/* Kısa özet */}
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

                    {/* Paywall */}
                    {session.ai_response && (
                      <PaywallCard
                        dreamId={session.id}
                        islamiAnaliz={session.ai_response.islami_analiz ?? ""}
                        psikolojikAnaliz={session.ai_response.psikolojik_analiz ?? ""}
                        semboller={session.ai_response.semboller ?? ""}
                      />
                    )}

                    {/* Follow-up mesajlar */}
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

                    {/* Typing indicator */}
                    {followUpLoading && (
                      <div className="space-y-4">
                        {localMessages.length === 0 && <div className="border-t border-zinc-100" />}
                        <TypingIndicator />
                      </div>
                    )}

                    {/* Inline hata */}
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

              {/* ── Sticky Bottom Input ── */}
              <div className="shrink-0 border-t border-zinc-100 bg-white px-4 py-3">
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
    </>
  );
}

// ─── Wrapper ─────────────────────────────────────────────────────────────────

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