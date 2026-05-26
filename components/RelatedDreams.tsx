import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { ArrowRight } from "lucide-react";

// ─── Tipler ───────────────────────────────────────────────────────────────────

interface RelatedEntry {
  id:          string;
  term:        string;
  slug:        string;
  description: string | null;
  tags:        string[] | null;
}

interface RelatedDreamsProps {
  currentSlug: string;
  tags:        string[];
}

// ─── Kart ─────────────────────────────────────────────────────────────────────

function RelatedCard({ entry }: { entry: RelatedEntry }) {
  return (
    <Link
      href={`/ruya-tabirleri/${entry.slug}`}
      className="group flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-200 hover:border-zinc-400 hover:shadow-md"
    >
      <div>
        <p className="mb-2 font-semibold text-zinc-900 transition-colors group-hover:text-zinc-700">
          {entry.term} Rüyası
        </p>
        {entry.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400">
            {entry.description}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors group-hover:text-zinc-700">
        <span>Tabiri Oku</span>
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
      </div>
    </Link>
  );
}

// ─── Ana Bileşen (Server Component) ──────────────────────────────────────────

export default async function RelatedDreams({ currentSlug, tags }: RelatedDreamsProps) {
  const supabase = createClient();
  const nowISO   = new Date().toISOString();
  const LIMIT    = 3;

  let entries: RelatedEntry[] = [];

  // ── 1. Etiket kesişimi ile benzer rüyalar ──
  if (tags.length > 0) {
    const { data: tagMatches } = await supabase
      .from("dream_dictionary")
      .select("id, term, slug, description, tags")
      .neq("slug", currentSlug)
      .eq("is_published", true)
      .lte("published_at", nowISO)
      .overlaps("tags", tags)
      .limit(LIMIT);

    entries = (tagMatches ?? []) as RelatedEntry[];
  }

  // ── 2. Fallback — eksik varsa son yayınlananlarla tamamla ──
  if (entries.length < LIMIT) {
    const needed       = LIMIT - entries.length;
    const excludeSlugs = [currentSlug, ...entries.map((e) => e.slug)];

    const { data: fallback } = await supabase
      .from("dream_dictionary")
      .select("id, term, slug, description, tags")
      .not("slug", "in", `(${excludeSlugs.map((s) => `"${s}"`).join(",")})`)
      .eq("is_published", true)
      .lte("published_at", nowISO)
      .order("published_at", { ascending: false })
      .limit(needed);

    entries = [...entries, ...((fallback ?? []) as RelatedEntry[])];
  }

  // Hiç sonuç yoksa bileşeni render etme
  if (entries.length === 0) return null;

  return (
    <section className="mt-14">

      {/* Başlık */}
      <div className="mb-5 flex items-center gap-4">
        <div className="h-px flex-1 bg-zinc-100" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          İlginizi Çekebilecek Diğer Rüyalar
        </h2>
        <div className="h-px flex-1 bg-zinc-100" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {entries.map((entry) => (
          <RelatedCard key={entry.id} entry={entry} />
        ))}
      </div>

      {/* Tümünü gör */}
      <div className="mt-5 text-center">
        <Link
          href="/ruya-tabirleri"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-700"
        >
          Tüm rüya tabirlerini görüntüle
          <ArrowRight className="h-3 w-3" strokeWidth={2} />
        </Link>
      </div>

    </section>
  );
}