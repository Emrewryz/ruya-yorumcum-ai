import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ArrowLeft, ArrowRight, TrendingUp } from "lucide-react";

const SITE_URL = "https://www.ruyayorumcum.com.tr";
export const revalidate = 3600;

// ─── Yardımcı: Başlık temizliği ───────────────────────────────────────────────

function cleanTitle(title: string): string {
  return title.replace(/\s*Rüyası\s*$/gi, "").trim();
}

// ─── Tipler ───────────────────────────────────────────────────────────────────

interface UltimateContent {
  type:               "ultimate";
  psychological?:     string;
  traditional_wisdom?: {
    introduction?: string;
    pillars?: { title: string; description: string }[];
  };
  scenarios?: { title: string; meaning: string }[];
  faq?:       { question: string; answer: string }[];
}

interface DictEntry {
  id:           string;
  term:         string;
  slug:         string;
  description:  string | null;
  content:      UltimateContent | any;
  tags:         string[] | null;
  search_count: number;
  updated_at:   string;
  created_at:   string;
  published_at: string | null;
}

interface RelatedEntry {
  id:          string;
  term:        string;
  slug:        string;
  description: string | null;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase
    .from("dream_dictionary")
    .select("term, description, updated_at, created_at")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (!data) return { title: "Rüya Tabirleri" };

  const ct    = cleanTitle(data.term);
  const title = `${ct} Rüyası Ne Anlama Gelir? — Rüya Yorumcum`;
  const desc  = data.description?.slice(0, 160) ?? `${ct} rüya tabiri, İslami ve psikolojik yorum.`;
  const url   = `${SITE_URL}/ruya-tabirleri/${params.slug}`;

  return {
    title,
    description: desc,
    alternates:  { canonical: url },
    robots:      { index: true, follow: true },
    openGraph: {
      title, description: desc, url, type: "article", siteName: "Rüya Yorumcum",
    },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

// ─── JSON-LD Builder ──────────────────────────────────────────────────────────

function buildSchemas(entry: DictEntry, ct: string) {
  const url = `${SITE_URL}/ruya-tabirleri/${entry.slug}`;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa",      item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Rüya Tabirleri", item: `${SITE_URL}/ruya-tabirleri` },
      { "@type": "ListItem", position: 3, name: `${ct} Rüyası`,   item: url },
    ],
  };

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:      `${ct} Rüyası Ne Anlama Gelir?`,
    description:   entry.description,
    datePublished: entry.created_at,
    dateModified:  entry.updated_at ?? entry.created_at,
    url,
    publisher: { "@type": "Organization", name: "Rüya Yorumcum", url: SITE_URL },
    author:    { "@type": "Organization", name: "Rüya Yorumcum" },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const faqItems: { question: string; answer: string }[] = [];
  const c = entry.content;
  if (c) {
    if (Array.isArray(c.faq))
      c.faq.forEach((f: any) => f.question && f.answer && faqItems.push(f));
    if (Array.isArray(c.scenarios))
      c.scenarios.forEach((s: any) =>
        s.title && s.meaning && faqItems.push({ question: s.title, answer: s.meaning })
      );
  }
  if (faqItems.length === 0) {
    faqItems.push({
      question: `${ct} rüyası ne anlama gelir?`,
      answer:   entry.description ?? `${ct} rüyası çeşitli anlamlar taşır.`,
    });
  }

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return { breadcrumb, article, faq };
}

// ─── Bölüm Başlığı ────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="not-prose text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-2.5 mb-5 mt-10">
      {children}
    </h2>
  );
}

// ─── İçerik Render ────────────────────────────────────────────────────────────

function ContentRenderer({ content }: { content: UltimateContent }) {
  return (
    <div className="prose prose-zinc max-w-none prose-p:text-zinc-700 prose-p:leading-loose prose-headings:font-semibold prose-a:text-zinc-900">

      {/* İslami / Geleneksel Yorum */}
      {content.traditional_wisdom && (
        <>
          <SectionHeading>İslami ve Geleneksel Yorum</SectionHeading>

          {content.traditional_wisdom.introduction && (
            <p>{content.traditional_wisdom.introduction}</p>
          )}

          {content.traditional_wisdom.pillars?.map((pillar, i) => (
            <div key={i} className="not-prose mb-4 rounded-xl border border-zinc-100 bg-zinc-50 px-5 py-4">
              <p className="text-sm font-semibold text-zinc-900 mb-1.5">{pillar.title}</p>
              <p className="text-sm leading-loose text-zinc-600">{pillar.description}</p>
            </div>
          ))}
        </>
      )}

      {/* Psikolojik Analiz */}
      {content.psychological && (
        <>
          <SectionHeading>Psikolojik Analiz</SectionHeading>
          {content.psychological.split("\n\n").filter(Boolean).map((para, i) => (
            <p key={i}>{para.trim()}</p>
          ))}
        </>
      )}

      {/* Senaryolar */}
      {content.scenarios && content.scenarios.length > 0 && (
        <>
          <SectionHeading>Rüya Senaryoları</SectionHeading>
          <div className="not-prose space-y-3">
            {content.scenarios.map((s, i) => (
              <div key={i} className="flex gap-4 rounded-xl border border-zinc-100 px-5 py-4">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 mb-1">{s.title}</p>
                  <p className="text-sm leading-loose text-zinc-600">{s.meaning}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* SSS */}
      {content.faq && content.faq.length > 0 && (
        <>
          <SectionHeading>Sık Sorulan Sorular</SectionHeading>
          <div className="not-prose space-y-5">
            {content.faq.map((item, i) => (
              <div key={i}>
                <p className="text-sm font-semibold text-zinc-900 mb-1.5">{item.question}</p>
                <p className="text-sm leading-loose text-zinc-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}

// ─── İlgili Rüyalar (mobilde carousel, masaüstünde grid) ─────────────────────

async function RelatedDreams({
  currentSlug,
  tags,
  firstLetter,
}: {
  currentSlug: string;
  tags: string[];
  firstLetter: string;
}) {
  const supabase = createClient();
  const now      = new Date().toISOString();
  let entries: RelatedEntry[] = [];

  // 1. Aynı etiketler
  if (tags.length > 0) {
    const { data } = await supabase
      .from("dream_dictionary")
      .select("id, term, slug, description")
      .neq("slug", currentSlug)
      .eq("is_published", true)
      .lte("published_at", now)
      .overlaps("tags", tags)
      .limit(3);
    entries = (data ?? []) as RelatedEntry[];
  }

  // 2. Aynı ilk harf ile tamamla
  if (entries.length < 3 && firstLetter) {
    const needed       = 3 - entries.length;
    const excludeSlugs = [currentSlug, ...entries.map((e) => e.slug)];
    const { data } = await supabase
      .from("dream_dictionary")
      .select("id, term, slug, description")
      .neq("slug", currentSlug)
      .not("slug", "in", `(${excludeSlugs.map((s) => `"${s}"`).join(",")})`)
      .eq("is_published", true)
      .lte("published_at", now)
      .ilike("first_letter", firstLetter)
      .limit(needed);
    entries = [...entries, ...((data ?? []) as RelatedEntry[])];
  }

  // 3. Fallback: son eklenenler
  if (entries.length < 3) {
    const needed       = 3 - entries.length;
    const excludeSlugs = [currentSlug, ...entries.map((e) => e.slug)];
    const { data } = await supabase
      .from("dream_dictionary")
      .select("id, term, slug, description")
      .not("slug", "in", `(${excludeSlugs.map((s) => `"${s}"`).join(",")})`)
      .eq("is_published", true)
      .lte("published_at", now)
      .order("published_at", { ascending: false })
      .limit(needed);
    entries = [...entries, ...((data ?? []) as RelatedEntry[])];
  }

  if (entries.length === 0) return null;

  return (
    <section className="mt-14">
      <div className="mb-5 flex items-center gap-4">
        <div className="h-px flex-1 bg-zinc-100" />
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          İlginizi Çekebilecek Diğer Rüyalar
        </p>
        <div className="h-px flex-1 bg-zinc-100" />
      </div>

      {/* Mobilde yatay kaydırma, masaüstünde 3 kolon grid */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 hide-scrollbar md:grid md:grid-cols-3 md:overflow-visible">
        {entries.map((entry) => {
          const ct = cleanTitle(entry.term);
          return (
            <Link
              key={entry.id}
              href={`/ruya-tabirleri/${entry.slug}`}
              className="min-w-[280px] snap-start md:min-w-0 flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-sm shrink-0"
            >
              <div>
                <p className="font-semibold text-zinc-900 text-sm mb-2">{ct} Rüyası</p>
                {entry.description && (
                  <p className="text-xs leading-relaxed text-zinc-400 line-clamp-2">
                    {entry.description}
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-zinc-400">
                <span>Tabiri Oku</span>
                <ArrowRight className="h-3 w-3" strokeWidth={2} />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-5 text-center">
        <Link
          href="/ruya-tabirleri"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          Tüm rüya tabirlerini görüntüle
          <ArrowRight className="h-3 w-3" strokeWidth={2} />
        </Link>
      </div>
    </section>
  );
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────

export default async function RuyaTabiriPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const now      = new Date().toISOString();

  const { data, error } = await supabase
    .from("dream_dictionary")
    .select("id, term, slug, description, content, tags, search_count, first_letter, updated_at, created_at, published_at")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .lte("published_at", now)
    .single();

  if (error || !data) notFound();

  const entry      = data as DictEntry & { first_letter: string | null };
  const ct         = cleanTitle(entry.term);
  const tags        = Array.isArray(entry.tags) ? entry.tags : [];
  const firstLetter = entry.first_letter ?? ct.charAt(0).toUpperCase();
  const hasContent  = entry.content && Object.keys(entry.content).length > 0;

  // search_count artır (fire-and-forget)
  supabase
    .from("dream_dictionary")
    .update({ search_count: (entry.search_count ?? 0) + 1 })
    .eq("id", entry.id)
    .then(() => {});

  const { breadcrumb, article, faq } = buildSchemas(entry, ct);

  return (
    <article className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-5 py-10 pb-20">

        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-1.5 text-xs text-zinc-400" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-zinc-600 transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/ruya-tabirleri" className="hover:text-zinc-600 transition-colors">
            Rüya Tabirleri
          </Link>
          <span>/</span>
          <span className="max-w-[180px] truncate font-medium text-zinc-600">{ct}</span>
        </nav>

        {/* Başlık */}
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-1.5 text-xs text-zinc-400">
            <TrendingUp className="h-3 w-3" strokeWidth={1.5} />
            <span>{(entry.search_count ?? 0).toLocaleString("tr-TR")} kez okundu</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 leading-tight md:text-4xl">
            {ct} Rüyası Ne Anlama Gelir?
          </h1>

          {entry.description && (
            <p className="mt-4 text-[17px] leading-relaxed text-zinc-500">
              {entry.description}
            </p>
          )}

          {/* Tıklanabilir etiketler */}
          {tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/ruya-tabirleri?q=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-800"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        <hr className="border-zinc-100 mb-8" />

        {/* Ana İçerik */}
        {hasContent ? (
          <ContentRenderer content={entry.content} />
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-200 py-14 text-center">
            <p className="text-sm text-zinc-400">Bu madde için henüz içerik hazırlanmamış.</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-14 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center">
          <p className="text-sm font-semibold text-zinc-900 mb-1">
            {ct} rüyasını siz mi gördünüz?
          </p>
          <p className="text-xs leading-relaxed text-zinc-500 mb-4">
            Yapay zeka ile kişiselleştirilmiş, derinlikli bir yorum alın. İlk analiz ücretsiz.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
          >
            Rüyamı Analiz Et
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>

        {/* İlgili Rüyalar */}
        <RelatedDreams
          currentSlug={entry.slug}
          tags={tags}
          firstLetter={firstLetter}
        />

      </div>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
    </article>
  );
}