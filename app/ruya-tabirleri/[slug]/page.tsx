import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { TrendingUp, BookOpen, Brain, HelpCircle, Eye } from "lucide-react";
import RelatedDreams from "@/components/RelatedDreams";

// ISR — 30 saniyede bir yenile
export const revalidate = 30;

const SITE_URL = "https://www.ruyayorumcum.com.tr";

// ─── Metadata (değişmedi) ─────────────────────────────────────────────────────

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

// ─── FAQ Schema Builder (değişmedi) ──────────────────────────────────────────

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

// ─── Bölüm Başlığı ────────────────────────────────────────────────────────────

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-2.5 text-base font-semibold text-zinc-900 mb-4 mt-10">
      <Icon className="h-4 w-4 shrink-0 text-zinc-400" strokeWidth={1.5} />
      {children}
    </h2>
  );
}

// ─── Düz Metin Paragrafı ──────────────────────────────────────────────────────

function Prose({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").filter(Boolean).map((line, i) => (
        <p key={i} className="text-[16px] leading-loose text-zinc-700 mb-4">
          {line}
        </p>
      ))}
    </>
  );
}

// ─── İçerik Render (yeni sıralama ve sade tasarım) ───────────────────────────

function renderDictionaryContent(content: any): React.ReactNode {
  if (!content) return null;

  // ── "ultimate" format ──
  if (content.type === "ultimate") {
    const faqItems: { question: string; answer: string }[] = [
      ...(Array.isArray(content.faq) ? content.faq : []),
      ...(Array.isArray(content.scenarios)
        ? content.scenarios.map((s: any) => ({ question: s.title, answer: s.meaning }))
        : []),
    ];

    return (
      <>
        {/* 1. İslami ve Dini Yorum */}
        {content.traditional_wisdom &&
          (content.traditional_wisdom.introduction || content.traditional_wisdom.pillars?.length > 0) && (
            <section>
              <SectionHeading icon={BookOpen}>İslami ve Dini Yorum</SectionHeading>
              {content.traditional_wisdom.introduction && (
                <Prose text={content.traditional_wisdom.introduction} />
              )}
              {Array.isArray(content.traditional_wisdom.pillars) &&
                content.traditional_wisdom.pillars.map((p: any, i: number) => (
                  <div key={i} className="mb-5">
                    <p className="text-[15px] font-semibold text-zinc-800 mb-1.5">{p.title}</p>
                    <p className="text-[16px] leading-loose text-zinc-700">{p.description}</p>
                  </div>
                ))}
              <hr className="border-zinc-100 my-8" />
            </section>
          )}

        {/* 2. Psikolojik Analiz */}
        {content.psychological && (
          <section>
            <SectionHeading icon={Brain}>Psikolojik Analiz</SectionHeading>
            <Prose text={content.psychological} />
            <hr className="border-zinc-100 my-8" />
          </section>
        )}

        {/* 3. Sıkça Sorulan Sorular (FAQ + Senaryolar birleşik) */}
        {faqItems.length > 0 && (
          <section>
            <SectionHeading icon={HelpCircle}>Sıkça Sorulan Sorular</SectionHeading>
            <div className="space-y-6">
              {faqItems.map((item, i) => (
                <div key={i}>
                  <p className="text-[15px] font-semibold text-zinc-800 mb-1.5">{item.question}</p>
                  <p className="text-[16px] leading-loose text-zinc-700">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </>
    );
  }

  // ── Legacy "blocks" format ──
  if (Array.isArray(content.blocks) || Array.isArray(content)) {
    const blocks: any[] = Array.isArray(content) ? content : content.blocks;
    return (
      <>
        {blocks.map((block: any, i: number) => {
          switch (block.type) {
            case "heading":
              return (
                <h2 key={i} className="text-lg font-semibold text-zinc-900 mt-10 mb-4">
                  {block.content}
                </h2>
              );
            case "subheading":
              return (
                <h3 key={i} className="text-base font-semibold text-zinc-800 mt-7 mb-3">
                  {block.content}
                </h3>
              );
            case "paragraph":
            default:
              return block.content ? (
                <p key={i} className="text-[16px] leading-loose text-zinc-700 mb-4">
                  {block.content}
                </p>
              ) : null;
          }
        })}
      </>
    );
  }

  // ── Plain string ──
  if (typeof content === "string") {
    return <Prose text={content} />;
  }

  return null;
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────

export default async function DreamDictionaryDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const nowISO   = new Date().toISOString();

  const { data: entry, error } = await supabase
    .from("dream_dictionary")
    .select(
      "id, term, slug, description, content, tags, search_count, first_letter, updated_at, created_at, published_at"
    )
    .eq("slug", params.slug)
    .eq("is_published", true)
    .lte("published_at", nowISO)
    .single();

  if (error || !entry) notFound();

  // Arama sayacı — fire and forget (değişmedi)
  supabase
    .from("dream_dictionary")
    .update({ search_count: (entry.search_count ?? 0) + 1 })
    .eq("id", entry.id)
    .then(() => {});

  const tags: string[] = Array.isArray(entry.tags) ? entry.tags : [];

  // ── JSON-LD (değişmedi) ──
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa",      item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Rüya Tabirleri", item: `${SITE_URL}/ruya-tabirleri` },
      { "@type": "ListItem", position: 3, name: `${entry.term} Rüyası`, item: `${SITE_URL}/ruya-tabirleri/${entry.slug}` },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:      `${entry.term} Rüyası Ne Anlama Gelir?`,
    description:   entry.description,
    datePublished: entry.created_at,
    dateModified:  entry.updated_at ?? entry.created_at,
    url:           `${SITE_URL}/ruya-tabirleri/${entry.slug}`,
    publisher: { "@type": "Organization", name: "Rüya Yorumcum", url: SITE_URL },
  };

  const faqSchema = buildFaqSchema(entry.content, entry.term);

  return (
    <article className="mx-auto max-w-2xl px-5 py-12">

      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1.5 text-xs text-zinc-400" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-zinc-600 transition-colors">Ana Sayfa</Link>
        <span>/</span>
        <Link href="/ruya-tabirleri" className="hover:text-zinc-600 transition-colors">Rüya Tabirleri</Link>
        <span>/</span>
        <span className="max-w-[160px] truncate font-medium text-zinc-600">{entry.term}</span>
      </nav>

      {/* Başlık */}
      <header className="mb-8">
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
            <TrendingUp className="h-3 w-3" strokeWidth={1.5} />
            {(entry.search_count ?? 0).toLocaleString("tr-TR")} kez arandı
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 leading-snug">
          {entry.term} Rüyası Ne Anlama Gelir?
        </h1>

        {entry.description && (
          <p className="mt-4 text-[17px] leading-relaxed text-zinc-500">
            {entry.description}
          </p>
        )}

        {tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/ruya-tabirleri?q=${encodeURIComponent(tag)}`}
                className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-800"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      <hr className="border-zinc-100 mb-8" />

      {/* Genel Bakış — description'dan ayrı, content'in ilk paragrafından gelebilir */}
      {entry.content?.introduction && (
        <section className="mb-2">
          <SectionHeading icon={Eye}>Genel Bakış</SectionHeading>
          <Prose text={entry.content.introduction} />
          <hr className="border-zinc-100 my-8" />
        </section>
      )}

      {/* Ana İçerik */}
      <div>
        {renderDictionaryContent(entry.content)}
      </div>

      {/* CTA */}
      <div className="mt-14 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center">
        <p className="mb-1 font-semibold text-zinc-900">{entry.term} rüyasını mı gördünüz?</p>
        <p className="mb-4 text-sm text-zinc-500">Yapay zeka ile kişisel analizinizi hemen alın.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
        >
          Rüyamı Analiz Et
        </Link>
      </div>

      {/* Benzer Rüya Tabirleri */}
      <RelatedDreams
        currentSlug={entry.slug}
        tags={tags}
      />

      {/* JSON-LD (değişmedi) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

    </article>
  );
}