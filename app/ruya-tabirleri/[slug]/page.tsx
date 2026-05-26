import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { TrendingUp } from "lucide-react";

const SITE_URL = "https://www.ruyayorumcum.com.tr";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data: entry } = await supabase
    .from("dream_dictionary")
    .select("term, description, updated_at, created_at")
    .eq("slug", params.slug)
    .single();

  if (!entry) return { title: "Rüya Tabiri Bulunamadı" };

  const url   = `${SITE_URL}/ruya-tabirleri/${params.slug}`;
  const title = `${entry.term} Rüyası Ne Anlama Gelir? — Rüya Yorumcum`;
  const desc  = entry.description?.slice(0, 160) ?? undefined;

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title, description: desc, url, type: "article", siteName: "Rüya Yorumcum" },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// BÖLÜM BİLEŞENLERİ — Ultimate Format
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Psikolojik Analiz ────────────────────────────────────────────────────────

function PsychologicalSection({ text }: { text: string }) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-100" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Psikolojik & Bilinçaltı Analizi
        </h2>
        <div className="h-px flex-1 bg-zinc-100" />
      </div>
      <div
        className="rounded-2xl border border-zinc-200 bg-white p-6 text-[15px] leading-loose text-zinc-700"
        dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, "<br/>") }}
      />
    </section>
  );
}

// ─── Kadim Bilgelik Kartı ─────────────────────────────────────────────────────

function PillarCard({
  pillar,
}: {
  pillar: { title: string; description: string };
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5">
      <p className="mb-2 text-sm font-semibold text-zinc-900">{pillar.title}</p>
      <p className="text-sm leading-relaxed text-zinc-600">{pillar.description}</p>
    </div>
  );
}

function TraditionalWisdomSection({
  data,
}: {
  data: { introduction: string; pillars: { title: string; description: string }[] };
}) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-100" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Kadim Bilgelik & Dini Yorumlar
        </h2>
        <div className="h-px flex-1 bg-zinc-100" />
      </div>

      {data.introduction && (
        <p className="mb-5 text-[15px] leading-loose text-zinc-700">
          {data.introduction}
        </p>
      )}

      {data.pillars?.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.pillars.map((pillar, i) => (
            <PillarCard key={i} pillar={pillar} />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Senaryolar ───────────────────────────────────────────────────────────────

const SCENARIO_COLORS = [
  "border-violet-300",
  "border-sky-300",
  "border-emerald-300",
  "border-amber-300",
  "border-rose-300",
  "border-indigo-300",
];

function ScenariosSection({
  scenarios,
}: {
  scenarios: { title: string; meaning: string }[];
}) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-100" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Farklı Senaryolar & Durumlar
        </h2>
        <div className="h-px flex-1 bg-zinc-100" />
      </div>

      <div className="space-y-3">
        {scenarios.map((scenario, i) => (
          <div
            key={i}
            className={`rounded-xl border-l-4 bg-white border border-zinc-200 pl-5 pr-5 py-4 ${
              SCENARIO_COLORS[i % SCENARIO_COLORS.length]
            }`}
          >
            <p className="mb-1.5 text-sm font-semibold text-zinc-900">
              {scenario.title}
            </p>
            <p className="text-sm leading-relaxed text-zinc-600">
              {scenario.meaning}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function FaqSection({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-100" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Sıkça Sorulan Sorular
        </h2>
        <div className="h-px flex-1 bg-zinc-100" />
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-200 bg-white overflow-hidden"
          >
            <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-3.5">
              <p className="text-sm font-semibold text-zinc-900">{faq.question}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm leading-relaxed text-zinc-600">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANA RENDERER — Ultimate + Fallback
// ═══════════════════════════════════════════════════════════════════════════════

function renderDictionaryContent(content: any): React.ReactNode {
  if (!content) return null;

  // ── Ultimate Format ──────────────────────────────────────────────────────────
  if (content.type === "ultimate") {
    return (
      <div>
        {content.psychological && (
          <PsychologicalSection text={content.psychological} />
        )}

        {content.traditional_wisdom &&
          (content.traditional_wisdom.introduction ||
            content.traditional_wisdom.pillars?.length > 0) && (
            <TraditionalWisdomSection data={content.traditional_wisdom} />
          )}

        {Array.isArray(content.scenarios) && content.scenarios.length > 0 && (
          <ScenariosSection scenarios={content.scenarios} />
        )}

        {Array.isArray(content.faq) && content.faq.length > 0 && (
          <FaqSection faqs={content.faq} />
        )}
      </div>
    );
  }

  // ── Fallback: Eski blocks formatı ────────────────────────────────────────────
  if (Array.isArray(content.blocks) || Array.isArray(content)) {
    const blocks: any[] = Array.isArray(content) ? content : content.blocks;
    return (
      <div>
        {blocks.map((block: any, i: number) => {
          switch (block.type) {
            case "heading":
              return (
                <h2 key={i} className="mt-8 mb-3 text-lg font-semibold text-zinc-900">
                  {block.content}
                </h2>
              );
            case "subheading":
              return (
                <h3 key={i} className="mt-6 mb-2 text-base font-semibold text-zinc-800">
                  {block.content}
                </h3>
              );
            case "paragraph":
              return (
                <p key={i} className="mb-4 leading-loose text-zinc-700">
                  {block.content}
                </p>
              );
            default:
              return block.content ? (
                <p key={i} className="mb-4 leading-loose text-zinc-700">
                  {block.content}
                </p>
              ) : null;
          }
        })}
      </div>
    );
  }

  // ── Fallback: Düz string ──────────────────────────────────────────────────────
  if (typeof content === "string") {
    return (
      <p className="mb-4 leading-loose text-zinc-700">{content}</p>
    );
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FAQ SCHEMA BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

function buildFaqSchema(content: any, term: string) {
  if (!content) return null;
  const faqs: { question: string; answer: string }[] = [];

  if (Array.isArray(content?.faq)) {
    content.faq.forEach((item: any) => {
      if (item.question && item.answer) faqs.push(item);
    });
  }

  if (Array.isArray(content?.scenarios)) {
    content.scenarios.forEach((s: any) => {
      if (s.title && s.meaning) faqs.push({ question: s.title, answer: s.meaning });
    });
  }

  if (faqs.length === 0) {
    const firstParagraph =
      typeof content === "string"
        ? content.slice(0, 300)
        : content?.blocks?.find((b: any) => b.type === "paragraph")?.content ?? "";

    if (!firstParagraph) return null;

    faqs.push(
      { question: `${term} rüyası ne anlama gelir?`, answer: firstParagraph },
      {
        question: `${term} rüyasının İslami tabirde anlamı nedir?`,
        answer: `İslami rüya tabirinde ${term} görmek çeşitli anlamlar taşır. Detaylar için sayfamızı inceleyin.`,
      }
    );
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

// ─── İlgili Kart ─────────────────────────────────────────────────────────────

function RelatedCard({
  entry,
}: {
  entry: { term: string; slug: string; description?: string | null };
}) {
  return (
    <Link
      href={`/ruya-tabirleri/${entry.slug}`}
      className="group rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-400 hover:shadow-sm"
    >
      <p className="font-semibold text-zinc-900 transition-colors group-hover:text-zinc-700">
        {entry.term}
      </p>
      {entry.description && (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-400">
          {entry.description}
        </p>
      )}
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SAYFA
// ═══════════════════════════════════════════════════════════════════════════════

export default async function DreamDictionaryDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: entry, error } = await supabase
    .from("dream_dictionary")
    .select(
      "id, term, slug, description, content, tags, search_count, first_letter, updated_at, created_at"
    )
    .eq("slug", params.slug)
    .single();

  if (error || !entry) notFound();

  // Arama sayacı — dokunma (SEO için korunuyor)
  supabase
    .from("dream_dictionary")
    .update({ search_count: (entry.search_count ?? 0) + 1 })
    .eq("id", entry.id)
    .then(() => {});

  // İlgili tabirler
  const { data: related } = await supabase
    .from("dream_dictionary")
    .select("id, term, slug, description")
    .neq("slug", params.slug)
    .ilike("first_letter", entry.first_letter ?? "A")
    .limit(4);

  let relatedEntries = related ?? [];
  if (relatedEntries.length < 4) {
    const needed = 4 - relatedEntries.length;
    const excludeSlugs = [params.slug, ...relatedEntries.map((r) => r.slug)];
    const { data: fallback } = await supabase
      .from("dream_dictionary")
      .select("id, term, slug, description")
      .not("slug", "in", `(${excludeSlugs.map((s) => `"${s}"`).join(",")})`)
      .limit(needed);
    relatedEntries = [...relatedEntries, ...(fallback ?? [])];
  }

  const tags: string[] = Array.isArray(entry.tags) ? entry.tags : [];

  // ─── JSON-LD (dokunma) ───────────────────────────────────────────────────────

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Rüya Tabirleri", item: `${SITE_URL}/ruya-tabirleri` },
      {
        "@type": "ListItem",
        position: 3,
        name: `${entry.term} Rüyası`,
        item: `${SITE_URL}/ruya-tabirleri/${entry.slug}`,
      },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${entry.term} Rüyası Ne Anlama Gelir?`,
    description: entry.description,
    datePublished: entry.created_at,
    dateModified: entry.updated_at ?? entry.created_at,
    url: `${SITE_URL}/ruya-tabirleri/${entry.slug}`,
    publisher: { "@type": "Organization", name: "Rüya Yorumcum", url: SITE_URL },
  };

  const faqSchema = buildFaqSchema(entry.content, entry.term);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <article className="mx-auto max-w-2xl px-5 py-10">

      {/* Breadcrumb UI */}
      <nav
        className="mb-6 flex items-center gap-1.5 text-xs text-zinc-400"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-zinc-600 transition-colors">Ana Sayfa</Link>
        <span>/</span>
        <Link href="/ruya-tabirleri" className="hover:text-zinc-600 transition-colors">
          Rüya Tabirleri
        </Link>
        <span>/</span>
        <span className="max-w-[160px] truncate font-medium text-zinc-600">
          {entry.term}
        </span>
      </nav>

      {/* Başlık */}
      <header className="mb-8">
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-500">
            <TrendingUp className="h-3 w-3" strokeWidth={1.5} />
            {(entry.search_count ?? 0).toLocaleString("tr-TR")} kez arandı
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          {entry.term} Rüyası Ne Anlama Gelir?
        </h1>

        {entry.description && (
          <p className="mt-3 text-base leading-relaxed text-zinc-500">
            {entry.description}
          </p>
        )}

        {/* Etiketler (tags) */}
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/ruya-tabirleri?q=${encodeURIComponent(tag)}`}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      <div className="border-t border-zinc-100 mb-8" />

      {/* ─── İçerik (Ultimate veya Fallback) ─── */}
      <div className="text-[15px]">
        {renderDictionaryContent(entry.content)}
      </div>

      {/* CTA */}
      <div className="mt-10 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center">
        <p className="mb-1 font-semibold text-zinc-900">
          {entry.term} rüyasını mı gördünüz?
        </p>
        <p className="mb-4 text-sm text-zinc-500">
          Yapay zeka ile kişisel analizinizi hemen alın.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
        >
          Rüyamı Analiz Et
        </Link>
      </div>

      {/* İlgili Tabirler */}
      {relatedEntries.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-base font-semibold text-zinc-900">
            İlgili Rüya Tabirleri
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {relatedEntries.map((rel) => (
              <RelatedCard key={rel.id} entry={rel} />
            ))}
          </div>
        </div>
      )}

      {/* JSON-LD — dokunulmadı */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </article>
  );
}