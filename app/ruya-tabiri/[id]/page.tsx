import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { DreamAnalysis } from "@/app/actions/analyze-dream";
import PaywallCard from "@/components/PaywallCard";
import { Moon, ArrowLeft, Share2 } from "lucide-react";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  return {
    title: "Rüya Analiz Sonucu",
    description: "Yapay zeka destekli kişisel rüya analiz sonucunuz.",
    robots: { index: false, follow: false },
  };
}

// ─── Yardımcı: Ay fazını Türkçeye çevir ──────────────────────────────────────

function formatMoonPhase(phase: string | null): string {
  if (!phase) return "Bilinmiyor";
  const map: Record<string, string> = {
    "New Moon": "Yeni Ay 🌑",
    "Waxing Crescent": "Hilal 🌒",
    "First Quarter": "İlk Dördün 🌓",
    "Waxing Gibbous": "Şişen Ay 🌔",
    "Full Moon": "Dolunay 🌕",
    "Waning Gibbous": "Azalan Ay 🌖",
    "Last Quarter": "Son Dördün 🌗",
    "Waning Crescent": "Biten Hilal 🌘",
  };
  return map[phase] ?? phase;
}

// ─── Sayfa ───────────────────────────────────────────────────────────────────

export default async function DreamResultPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: dream, error } = await supabase
    .from("dreams")
    .select("id, dream_text, ai_response, moon_phase, created_at")
    .eq("id", params.id)
    .single();

  if (error || !dream) notFound();

  const analysis = dream.ai_response as DreamAnalysis;

  if (!analysis?.kisa_ozet || !analysis?.islami_analiz || !analysis?.psikolojik_analiz) {
    notFound();
  }

  const formattedDate = new Date(dream.created_at).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="relative min-h-screen bg-[#080810]">

      {/* ── Arka plan ışıkları ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-60 left-1/4 h-[700px] w-[700px] rounded-full bg-violet-950/40 blur-[130px]" />
        <div className="absolute top-1/2 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-950/30 blur-[110px]" />
        <div className="absolute -bottom-40 left-0 h-[400px] w-[400px] rounded-full bg-violet-950/20 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* ── İçerik ── */}
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-8">

        {/* Üst navigasyon */}
        <div className="mb-10 flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm text-white/30 transition-colors hover:text-white/60"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Yeni Rüya</span>
          </Link>

          <button
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/35 transition-colors hover:text-white/60"
            title="Paylaş (yakında)"
          >
            <Share2 className="h-3 w-3" />
            Paylaş
          </button>
        </div>

        {/* ── Meta bilgi bandı ── */}
        <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/25">
          <span className="flex items-center gap-1.5">
            <Moon className="h-3 w-3 text-amber-400/50" />
            {formatMoonPhase(dream.moon_phase)}
          </span>
          <span className="h-1 w-1 rounded-full bg-white/15" />
          <span>{formattedDate}</span>
          <span className="h-1 w-1 rounded-full bg-white/15" />
          <span className="rounded-full border border-violet-500/20 bg-violet-500/8 px-2.5 py-0.5 text-violet-400/70">
            AI Analizi
          </span>
        </div>

        {/* ══════════════════════════════════════════
            1. BLOK — RÜYA METNİ (Blockquote)
        ══════════════════════════════════════════ */}
        <section className="mb-10">
          <blockquote
            className="
              relative rounded-2xl
              border-l-2 border-white/10
              bg-gradient-to-br from-white/[0.04] to-white/[0.01]
              px-6 py-5
              backdrop-blur-sm
            "
          >
            <div
              className="absolute -top-1 -left-1 select-none text-5xl leading-none text-white/6"
              aria-hidden="true"
            >
              &ldquo;
            </div>

            <p
              className="relative text-[0.95rem] italic leading-relaxed text-white/45"
              style={{ fontFamily: "'Crimson Pro', Georgia, serif" }}
            >
              {dream.dream_text}
            </p>

            <div
              className="absolute -bottom-3 -right-1 select-none text-5xl leading-none text-white/6"
              aria-hidden="true"
            >
              &rdquo;
            </div>
          </blockquote>
        </section>

        {/* ══════════════════════════════════════════
            2. BLOK — KISA ÖZET (Herkese Açık)
        ══════════════════════════════════════════ */}
        <section className="mb-12">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-violet-500/30 to-transparent" />
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-violet-400/70">
              <span className="text-base">🔮</span>
              İlk İzlenim
            </span>
          </div>

          <div
            className="
              rounded-2xl
              border border-violet-500/15
              bg-gradient-to-br from-violet-900/15 via-violet-950/10 to-indigo-950/15
              px-7 py-6
              shadow-[0_0_40px_rgba(139,92,246,0.07)]
            "
          >
            <p
              className="text-[1.15rem] font-medium leading-relaxed text-white/85"
              style={{ fontFamily: "'Crimson Pro', Georgia, serif" }}
            >
              {analysis.kisa_ozet}
            </p>
            <div className="mt-5 h-px w-16 rounded-full bg-gradient-to-r from-violet-500/40 to-transparent" />
          </div>

          <p className="mt-4 text-center text-sm text-white/30">
            Bu sadece yüzey. Rüyanızın gerçek anlamı aşağıda kilitli...
          </p>
        </section>

        {/* ══════════════════════════════════════════
            3. BLOK — PAYWALL (Kilitli Bölümler)
        ══════════════════════════════════════════ */}
        <section>
          <PaywallCard
            dreamId={dream.id}
            islamiAnaliz={analysis.islami_analiz}
            psikolojikAnaliz={analysis.psikolojik_analiz}
            semboller={analysis.semboller ?? ""}
          />
        </section>

      </div>
    </main>
  );
}