import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { ArrowLeft, TrendingUp } from "lucide-react";

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
    .select("term, description")
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
    openGraph: {
      title,
      description: desc,
      url,
      type: "article",
      siteName: "Rüya Yorumcum",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
    },
  };
}

// ─── İçerik Renderer ─────────────────────────────────────────────────────────

function renderContent(content: any): React.ReactNode {
  if (!content) return null;
  if (typeof content === "string") {
    return <p className="mb-4 leading-loose text-zinc-700">{content}</p>;
  }
  const blocks: any[] = Array.isArray(content) ? content : (content.blocks ?? []);
  return blocks.map((block: any, i: number) => {
    switch (block.type) {
      case "heading":
        return <h2 key={i} className="mt-8 mb-3 text-lg font-semibold text-zinc-900">{block.content}</h2>;
      case "subheading":
        return <h3 key={i} className="mt-6 mb-2 text-base font-semibold text-zinc-800">{block.content}</h3>;
      case "paragraph":
        return <p key={i} className="mb-4 leading-loose text-zinc-700">{block.content}</p>;
      default:
        return block.content
          ? <p key={i} className="mb-4 leading-loose text-zinc-700">{block.content}</p>
          : null;
    }
  });
}

// ─── 3. FAQ Schema Builder ────────────────────────────────────────────────────

function buildFaqSchema(content: any, term: string) {
  if (!content) return null;
  const faqs: { question: string; answer: string }[] = [];

  // content.faq dizisi varsa kullan
  if (Array.isArray(content?.faq)) {
    content.faq.forEach((item: any) => {
      if (item.question && item.answer) faqs.push(item);
    });
  }

  // content.scenarios varsa FAQ'ya çevir
  if (Array.isArray(content?.scenarios)) {
    content.scenarios.forEach((s: any) => {
      if (s.title && s.meaning) {
        faqs.push({ question: s.title, answer: s.meaning });
      }
    });
  }

  // FAQ yoksa otomatik üret
  if (faqs.length === 0) {
    faqs.push(
      {
        question: `${term} rüyası ne anlama gelir?`,
        answer: typeof content === "string"
          ? content.slice(0, 300)
          : (content?.blocks?.[0]?.content ?? ""),
      },
      {
        question: `${term} rüyasının İslami tabirde anlamı nedir?`,
        answer: `İslami rüya tabirinde ${term} görmek çeşitli anlamlar taşıyabilir. Detaylar için sayfamızı inceleyin.`,
      }
    );
  }

  if (faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

// ─── İlgili Tabirler Kartı ───────────────────────────────────────────────────

function RelatedCard({ entry }: { entry: { term: string; slug: string; description?: string | null } }) {
  return (
    <Link
      href={`/ruya-tabirleri/${entry.slug}`}
      className="group rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-400 hover:shadow-sm"
    >
      <p className="font-semibold text-zinc-900 group-hover:text-zinc-700 transition-colors">
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

// ─── Sayfa ────────────────────────────────────────────────────────────────────

export default async function DreamDictionaryDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: entry, error } = await supabase
    .from("dream_dictionary")
    .select("id, term, slug, description, content, search_count, first_letter")
    .eq("slug", params.slug)
    .single();

  if (error || !entry) notFound();

  // Sayaç artır (fire and forget)
  supabase
    .from("dream_dictionary")
    .update({ search_count: (entry.search_count ?? 0) + 1 })
    .eq("id", entry.id)
    .then(() => {});

  // 5. İlgili tabirler — aynı harfle başlayanlar veya rastgele
  const { data: related } = await supabase
    .from("dream_dictionary")
    .select("id, term, slug, description")
    .neq("slug", params.slug)
    .ilike("first_letter", entry.first_letter ?? "A")
    .limit(4);

  // Yeterli yoksa rastgele doldur
  let relatedEntries = related ?? [];
  if (relatedEntries.length < 4) {
    const { data: fallback } = await supabase
      .from("dream_dictionary")
      .select("id, term, slug, description")
      .neq("slug", params.slug)
      .limit(4 - relatedEntries.length);
    relatedEntries = [...relatedEntries, ...(fallback ?? [])];
  }

  // 5. Etiketler (content.tags veya varsayılan)
  const tags: string[] = Array.isArray(entry.content?.tags)
    ? entry.content.tags
    : [];

  // 2. Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana Sayfa",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Rüya Tabirleri",
        item: `${SITE_URL}/ruya-tabirleri`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${entry.term} Rüyası`,
        item: `${SITE_URL}/ruya-tabirleri/${entry.slug}`,
      },
    ],
  };

  // 3. FAQ Schema
  const faqSchema = buildFaqSchema(entry.content, entry.term);

  // Article Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${entry.term} Rüyası Ne Anlama Gelir?`,
    description: entry.description,
    url: `${SITE_URL}/ruya-tabirleri/${entry.slug}`,
    publisher: {
      "@type": "Organization",
      name: "Rüya Yorumcum",
      url: SITE_URL,
    },
  };

  return (
    <article className="mx-auto max-w-2xl px-5 py-10">

      {/* 2. Breadcrumb UI */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-zinc-400" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-zinc-600 transition-colors">Ana Sayfa</Link>
        <span>/</span>
        <Link href="/ruya-tabirleri" className="hover:text-zinc-600 transition-colors">Rüya Tabirleri</Link>
        <span>/</span>
        <span className="text-zinc-600 font-medium truncate max-w-[160px]">{entry.term}</span>
      </nav>

      {/* Başlık */}
      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
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

        {/* 5. Etiketler */}
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/ruya-tabirleri?q=${encodeURIComponent(tag)}`}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      <div className="border-t border-zinc-100 mb-8" />

      {/* İçerik */}
      <div className="text-[15px]">
        {renderContent(entry.content)}
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
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
        >
          Rüyamı Analiz Et
        </Link>
      </div>

      {/* 5. İlgili Tabirler */}
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

      {/* JSON-LD */}
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