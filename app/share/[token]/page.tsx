import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getDreamByToken } from "@/app/actions/share-actions";
import { Moon, ArrowRight, MessageSquare } from "lucide-react";

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { token: string };
}): Promise<Metadata> {
  return {
    title: "Paylaşılan Rüya Analizi — Rüya Yorumcum",
    description: "Yapay zeka ile oluşturulmuş kişisel rüya analizi.",
    robots: { index: false, follow: false }, // Kişisel içerik indexlenmesin
  };
}

// ─── Yardımcılar ─────────────────────────────────────────────────────────────

function formatDate(d: string | null | undefined): string {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("tr-TR", {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch { return ""; }
}

function safeLines(text: string | null | undefined): string[] {
  if (!text) return [];
  return text.split("\n").filter(Boolean);
}

// ─── Mesaj Balonu ─────────────────────────────────────────────────────────────

function ReadonlyBubble({
  role, content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`
        max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${isUser
          ? "bg-zinc-900 text-white rounded-br-sm"
          : "bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-bl-sm"
        }
      `}>
        {safeLines(content).map((line, i) => (
          <p key={i} className="mb-1 last:mb-0">{line}</p>
        ))}
      </div>
    </div>
  );
}

// ─── Analiz Bölümü ────────────────────────────────────────────────────────────

function AnalysisBlock({
  label, text,
}: {
  label: string;
  text: string | null | undefined;
}) {
  if (!text) return null;
  return (
    <div className="py-5 border-b border-zinc-100 last:border-0">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </p>
      <div className="space-y-1.5">
        {safeLines(text).map((line, i) => (
          <p key={i} className="text-sm leading-loose text-zinc-700">{line}</p>
        ))}
      </div>
    </div>
  );
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────

export default async function SharePage({
  params,
}: {
  params: { token: string };
}) {
  const data = await getDreamByToken(params.token);
  if (!data) notFound();

  const { dream, messages } = data;
  const analysis = dream.ai_response as {
    kisa_ozet?: string;
    islami_analiz?: string;
    psikolojik_analiz?: string;
    semboller?: string;
  } | null;

  return (
    <div className="min-h-screen bg-zinc-50">

      {/* ── Minimal üst bar ── */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-2 group">
            <Moon className="h-4 w-4 text-zinc-900" strokeWidth={1.5} />
            <span className="text-sm font-semibold text-zinc-900">Rüya Yorumcum</span>
          </Link>
          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-500">
            Okuma Modu
          </span>
        </div>
      </header>

      {/* ── İçerik ── */}
      <div className="mx-auto max-w-2xl px-5 py-10 space-y-8">

        {/* Rüya metni */}
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Rüya
          </p>
          <blockquote className="border-l-2 border-zinc-200 pl-4">
            <p className="text-sm leading-relaxed text-zinc-600 italic">
              {dream.dream_text ?? "—"}
            </p>
          </blockquote>
          {dream.created_at && (
            <p className="mt-2 text-xs text-zinc-400">{formatDate(dream.created_at)}</p>
          )}
        </div>

        <div className="border-t border-zinc-100" />

        {/* Kısa özet */}
        {analysis?.kisa_ozet && (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Genel Değerlendirme
            </p>
            <p className="text-base leading-relaxed text-zinc-800">
              {analysis.kisa_ozet}
            </p>
          </div>
        )}

        {/* Derin analiz kartı */}
        {(analysis?.islami_analiz || analysis?.psikolojik_analiz || analysis?.semboller) && (
          <div className="rounded-xl border border-zinc-200 bg-white px-6">
            <AnalysisBlock label="İslami Yorum" text={analysis.islami_analiz} />
            <AnalysisBlock label="Psikolojik Analiz" text={analysis.psikolojik_analiz} />
            <AnalysisBlock label="Semboller" text={analysis.semboller} />
          </div>
        )}

        {/* Follow-up sohbet geçmişi */}
        {messages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-200" />
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <MessageSquare className="h-3 w-3" strokeWidth={1.5} />
                <span>{messages.length} devam sorusu</span>
              </div>
              <div className="h-px flex-1 bg-zinc-200" />
            </div>
            {messages.map((msg) => (
              <ReadonlyBubble key={msg.id} role={msg.role} content={msg.content} />
            ))}
          </div>
        )}

      </div>

      {/* ── Viral CTA Banner ── */}
      <div className="sticky bottom-0 z-10 border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-5 py-3.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900">
              Siz de rüyanızın şifrelerini çözün.
            </p>
            <p className="text-xs text-zinc-400">
              Rüya Yorumcum — Yapay Zeka Laboratuvarı
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors"
          >
            Ücretsiz Dene
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </div>
      </div>

    </div>
  );
}