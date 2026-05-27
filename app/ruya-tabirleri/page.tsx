import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import SearchBar from "@/components/SearchBar";

// ISR — 60 saniyede bir yenile, zamanı gelen içerikler otomatik görünür
export const revalidate = 60;
import { ChevronLeft, ChevronRight } from "lucide-react";

const SITE_URL  = "https://www.ruyayorumcum.com.tr";
const PER_PAGE  = 48;
const ALPHABET  = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ".split("");

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string; harf?: string; page?: string };
}): Promise<Metadata> {
  const query        = searchParams.q?.trim() ?? "";
  const activeLetter = searchParams.harf?.toUpperCase() ?? "";
  const page         = parseInt(searchParams.page ?? "1", 10);

  if (query) {
    return {
      title: `"${query}" Rüya Tabiri Arama — Rüya Yorumcum`,
      robots: { index: false, follow: true },
    };
  }

  const canonicalPath = activeLetter
    ? `/ruya-tabirleri?harf=${activeLetter}`
    : page > 1
    ? `/ruya-tabirleri?page=${page}`
    : "/ruya-tabirleri";

  const title = activeLetter
    ? `${activeLetter} Harfi Rüya Tabirleri — Rüya Yorumcum`
    : page > 1
    ? `Rüya Tabirleri Sayfa ${page} — Rüya Yorumcum`
    : "Rüya Tabirleri Sözlüğü — Rüya Yorumcum";

  return {
    title,
    description: "Binlerce rüya sembolünün İslami ve psikolojik anlamlarını keşfedin. Kapsamlı rüya tabirleri sözlüğü.",
    alternates: { canonical: `${SITE_URL}${canonicalPath}` },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description: "Binlerce rüya sembolünün İslami ve psikolojik anlamlarını keşfedin.",
      url: `${SITE_URL}${canonicalPath}`,
      type: "website",
    },
  };
}

function Pagination({
  currentPage,
  totalCount,
  basePath,
}: {
  currentPage: number;
  totalCount: number;
  basePath: string;
}) {
  const totalPages = Math.ceil(totalCount / PER_PAGE);
  if (totalPages <= 1) return null;

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  function pageUrl(p: number) {
    return p === 1 ? basePath : `${basePath}?page=${p}`;
  }

  return (
    <div className="mt-10 flex items-center justify-between border-t border-zinc-100 pt-6">
      {prevPage ? (
        <Link
          href={pageUrl(prevPage)}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 transition-all"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          Önceki
        </Link>
      ) : <div />}

      <span className="text-xs text-zinc-400">
        {currentPage} / {totalPages} sayfa
      </span>

      {nextPage ? (
        <Link
          href={pageUrl(nextPage)}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 transition-all"
        >
          Sonraki
          <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      ) : <div />}
    </div>
  );
}

export default async function RuyaTabirleriPage({
  searchParams,
}: {
  searchParams: { q?: string; harf?: string; page?: string };
}) {
  const supabase     = createClient();
  const query        = searchParams.q?.trim() ?? "";
  const activeLetter = searchParams.harf?.toUpperCase() ?? "";
  const currentPage  = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const from         = (currentPage - 1) * PER_PAGE;
  const to           = from + PER_PAGE - 1;
  const nowISO       = new Date().toISOString();

  let dbQuery = supabase
    .from("dream_dictionary")
    .select("id, term, slug, description, first_letter", { count: "exact" })
    .eq("is_published", true)
    .lte("published_at", nowISO)
    .order("term", { ascending: true });

  if (query) {
    dbQuery = dbQuery.ilike("term", `%${query}%`);
  } else if (activeLetter) {
    dbQuery = dbQuery.ilike("first_letter", activeLetter);
  }

  if (!query) {
    dbQuery = dbQuery.range(from, to);
  } else {
    dbQuery = dbQuery.limit(100);
  }

  const { data: entries, count } = await dbQuery;
  const totalCount = count ?? 0;

  const basePath = activeLetter
    ? `/ruya-tabirleri?harf=${activeLetter}`
    : "/ruya-tabirleri";

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">

      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Rüya Tabirleri
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {totalCount.toLocaleString("tr-TR")} sembol — İslami gelenek ve modern psikoloji perspektifinden.
        </p>
      </div>

      {/* Arama */}
      <div className="mb-5">
        <Suspense>
          <SearchBar
            placeholder="Sembol ara... (örn: yılan, su, uçmak)"
            defaultValue={query}
          />
        </Suspense>
      </div>

      {/* Harf filtresi — mobilde yatay kaydırma */}
      {!query && (
        <div className="mb-6 -mx-5 overflow-x-auto px-5" style={{ scrollbarWidth: "none" }}>
          <div className="flex min-w-max gap-1 pb-1">
            <Link
              href="/ruya-tabirleri"
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                !activeLetter
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900"
              }`}
            >
              Tümü
            </Link>
            {ALPHABET.map((letter) => (
              <Link
                key={letter}
                href={`/ruya-tabirleri?harf=${letter}`}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  activeLetter === letter
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900"
                }`}
              >
                {letter}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Arama sonuç bilgisi */}
      {query && (
        <p className="mb-4 text-sm text-zinc-400">
          <span className="font-medium text-zinc-700">"{query}"</span> için{" "}
          {(entries?.length ?? 0).toLocaleString("tr-TR")} sonuç
        </p>
      )}

      {/* Sonuçlar */}
      {!entries?.length ? (
        <div className="py-16 text-center">
          <p className="text-sm text-zinc-400">
            {query ? "Eşleşen sembol bulunamadı." : "Bu harfle başlayan sembol yok."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {entries.map((entry) => (
              <Link
                key={entry.id}
                href={`/ruya-tabirleri/${entry.slug}`}
                className="group rounded-xl border border-transparent px-4 py-3.5 transition-all hover:border-zinc-200 hover:bg-zinc-50"
              >
                <p className="font-semibold text-zinc-900 group-hover:text-zinc-700 transition-colors">
                  {entry.term}
                </p>
                {entry.description && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-zinc-400">
                    {entry.description}
                  </p>
                )}
              </Link>
            ))}
          </div>

          {!query && (
            <Pagination
              currentPage={currentPage}
              totalCount={totalCount}
              basePath={basePath}
            />
          )}
        </>
      )}
    </div>
  );
}