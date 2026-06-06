import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { ArrowLeft, ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import SearchBar from "@/components/SearchBar";

const SITE_URL = "https://www.ruyayorumcum.com.tr";
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Rüya Tabirleri Sözlüğü — Rüya Yorumcum",
  description:
    "İslami ve psikolojik perspektiften kapsamlı rüya tabirleri sözlüğü. Bilinçaltınızın dilini çözün.",
 alternates: {
    canonical: "https://www.ruyayorumcum.com.tr/ruya-tabirleri",
  },
  openGraph: {
    title: "Rüya Tabirleri Sözlüğü — Rüya Yorumcum",
    description: "İslami ve psikolojik perspektiften kapsamlı rüya tabirleri sözlüğü.",
    url: `${SITE_URL}/ruya-tabirleri`,
    type: "website",
    
  },
};

interface DictEntry {
  id:           string;
  term:         string;
  slug:         string;
  description:  string | null;
  search_count: number;
}

// ─── Arama Sonuçları ──────────────────────────────────────────────────────────

async function SearchResults({ q }: { q: string }) {
  const supabase = createClient();
  const now      = new Date().toISOString();

  const { data } = await supabase
    .from("dream_dictionary")
    .select("id, term, slug, description, search_count")
    .eq("is_published", true)
    .lte("published_at", now)
    .ilike("term", `%${q.trim()}%`)
    .order("search_count", { ascending: false })
    .limit(40);

  const entries = (data ?? []) as DictEntry[];

  return (
    <section>
      <p className="mb-4 text-sm text-zinc-500">
        <span className="font-medium text-zinc-800">"{q}"</span> için{" "}
        {entries.length} sonuç
      </p>
      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 py-14 text-center">
          <p className="text-sm text-zinc-400">Eşleşen sembol bulunamadı.</p>
          <p className="mt-1 text-xs text-zinc-300">Farklı bir anahtar kelime deneyin.</p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white overflow-hidden">
          {entries.map((entry) => (
            <Link
              key={entry.id}
              href={`/ruya-tabirleri/${entry.slug}`}
              className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-zinc-50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-900 truncate">{entry.term}</p>
                {entry.description && (
                  <p className="mt-0.5 text-xs text-zinc-400 truncate leading-snug">
                    {entry.description}
                  </p>
                )}
              </div>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-zinc-300" strokeWidth={2} />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Ana İçerik ───────────────────────────────────────────────────────────────

async function MainContent() {
  const supabase = createClient();
  const now      = new Date().toISOString();

  // Popüler — search_count'a göre top 6
  const { data: popularData } = await supabase
    .from("dream_dictionary")
    .select("id, term, slug, description, search_count")
    .eq("is_published", true)
    .lte("published_at", now)
    .order("search_count", { ascending: false })
    .limit(6);

  // Son eklenenler — published_at'e göre en yeni 10
  const { data: latestData } = await supabase
    .from("dream_dictionary")
    .select("id, term, slug, description, search_count")
    .eq("is_published", true)
    .lte("published_at", now)
    .order("published_at", { ascending: false })
    .limit(10);

  const popular = (popularData ?? []) as DictEntry[];
  const latest  = (latestData  ?? []) as DictEntry[];

  return (
    <div className="space-y-14">

      {/* ── Popüler Tabirler ── */}
      {popular.length > 0 && (
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
              <h2 className="text-base font-bold text-zinc-900">En Çok Okunanlar</h2>
            </div>
            <Link
              href="/ruya-tabirleri?sort=popular"
              className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              Tümünü gör →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {popular.map((entry) => (
              <Link
                key={entry.id}
                href={`/ruya-tabirleri/${entry.slug}`}
                className="group rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-400 hover:shadow-sm"
              >
                <p className="truncate text-sm font-semibold text-zinc-900 group-hover:text-zinc-700 transition-colors">
                  {entry.term}
                </p>
                {entry.description ? (
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-400">
                    {entry.description}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-zinc-300">İslami ve psikolojik yorum</p>
                )}
                <div className="mt-3 flex items-center gap-1 text-[11px] text-zinc-300 group-hover:text-zinc-500 transition-colors">
                  <TrendingUp className="h-3 w-3" strokeWidth={1.5} />
                  <span>{(entry.search_count ?? 0).toLocaleString("tr-TR")} okunma</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Son Eklenenler ── */}
      {latest.length > 0 && (
        <section>
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
            <h2 className="text-base font-bold text-zinc-900">Son Eklenen Rüyalar</h2>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
            {latest.map((entry) => (
              <Link
                key={entry.id}
                href={`/ruya-tabirleri/${entry.slug}`}
                className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-3.5 last:border-0 hover:bg-zinc-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-900 truncate">{entry.term}</p>
                  {entry.description && (
                    <p className="mt-0.5 text-xs text-zinc-400 truncate leading-snug">
                      {entry.description}
                    </p>
                  )}
                </div>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-zinc-300 group-hover:text-zinc-500 transition-colors" strokeWidth={2} />
              </Link>
            ))}
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/ruya-tabirleri?sort=latest"
              className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              Daha fazla rüya tabiri gör →
            </Link>
          </div>
        </section>
      )}

    </div>
  );
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────

export default async function RuyaTabirleriPage({
  searchParams,
}: {
  searchParams: { q?: string; sort?: string };
}) {
  const q = searchParams.q?.trim() ?? "";

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">

        {/* Üst Bar */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            Ana Sayfaya Dön
          </Link>
        </div>

        {/* Hero */}
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
            Sözlük
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
            Rüya Tabirleri Sözlüğü
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-zinc-500">
            Bilinçaltınızın dilini İslami gelenek ve psikoloji perspektifinden çözün.
          </p>

          {/* Arama */}
          <div className="mx-auto mt-7 max-w-lg">
            <Suspense>
              <SearchBar
                placeholder="Rüya sembolü arayın... (yılan, su, uçmak)"
                defaultValue={q}
              />
            </Suspense>
          </div>
        </div>

        {/* İçerik */}
        <Suspense
          fallback={
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-zinc-100 animate-pulse" />
              ))}
            </div>
          }
        >
          {q ? <SearchResults q={q} /> : <MainContent />}
        </Suspense>

      </div>
    </div>
  );
}