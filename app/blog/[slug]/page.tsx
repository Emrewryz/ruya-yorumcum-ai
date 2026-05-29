import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { Calendar } from "lucide-react";

const SITE_URL = "https://www.ruyayorumcum.com.tr";

// ─── Metadata (değişmedi) ─────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt, image_url, created_at")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (!post) return { title: "Yazı Bulunamadı" };

  const url   = `${SITE_URL}/blog/${params.slug}`;
  const title = `${post.title} — Rüya Yorumcum`;
  const desc  = post.excerpt?.slice(0, 160) ?? undefined;

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title: post.title,
      description: desc,
      url,
      type: "article",
      publishedTime: post.created_at,
      siteName: "Rüya Yorumcum",
      images: post.image_url
        ? [{ url: post.image_url, width: 1200, height: 630, alt: post.title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: desc,
      images: post.image_url ? [post.image_url] : [],
    },
  };
}

// ─── İçerik Renderer ─────────────────────────────────────────────────────────

function renderContent(content: any): React.ReactNode {
  if (!content) return null;
  const blocks: any[] = Array.isArray(content) ? content : (content.blocks ?? []);

  return blocks.map((block: any, i: number) => {
    switch (block.type) {
      case "heading":
        return (
          <h2 key={i} className="mt-10 mb-4 text-xl font-semibold text-zinc-900">
            {block.content}
          </h2>
        );
      case "subheading":
        return (
          <h3 key={i} className="mt-7 mb-3 text-lg font-semibold text-zinc-800">
            {block.content}
          </h3>
        );
      case "paragraph":
        return (
          <p key={i} className="mb-5 text-[17px] leading-loose text-zinc-700">
            {block.content}
          </p>
        );
      case "image":
        return (
          <figure key={i} className="my-8">
            <img
              src={block.url}
              alt={block.alt ?? ""}
              loading="lazy"
              decoding="async"
              className="w-full rounded-2xl object-cover"
            />
            {block.caption && (
              <figcaption className="mt-2.5 text-center text-xs text-zinc-400">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );
      case "quote":
        return (
          <blockquote
            key={i}
            className="my-7 border-l-[3px] border-zinc-300 bg-zinc-50/50 px-5 py-3 rounded-r-lg italic text-[16px] leading-loose text-zinc-600"
          >
            {block.content}
          </blockquote>
        );
      default:
        return block.content ? (
          <p key={i} className="mb-5 text-[17px] leading-loose text-zinc-700">
            {block.content}
          </p>
        ) : null;
    }
  });
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────

export default async function BlogDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: post, error } = await supabase
  .from("blog_posts")
  .select("id, title, slug, excerpt, content, image_url, created_at")
  .eq("slug", params.slug)
  .eq("is_published", true)
  .lte("published_at", new Date().toISOString()) // ← ekle
  .single();
  if (error || !post) notFound();

  // İlgili blog yazıları (değişmedi)
  const { data: relatedPosts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, created_at")
    .eq("is_published", true)
    .neq("slug", params.slug)
    .order("created_at", { ascending: false })
    .limit(3);

  const formattedDate = new Date(post.created_at).toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric",
  });

  const postUrl = `${SITE_URL}/blog/${post.slug}`;

  // Breadcrumb Schema (değişmedi)
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog",      item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title,  item: postUrl },
    ],
  };

  // Article Schema — author + mainEntityOfPage eklendi
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:    post.title,
    description: post.excerpt,
    datePublished: post.created_at,
    image: post.image_url,
    url: postUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    author: {
      "@type": "Organization",
      name: "Rüya Yorumcum Uzman Kadrosu",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Rüya Yorumcum",
      url: SITE_URL,
    },
  };

  return (
    <article className="mx-auto max-w-2xl px-5 py-10">

      {/* Breadcrumb UI */}
      <nav
        className="mb-6 flex items-center gap-1.5 text-xs text-zinc-400"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-zinc-600 transition-colors">Ana Sayfa</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-zinc-600 transition-colors">Blog</Link>
        <span>/</span>
        <span className="truncate max-w-[200px] font-medium text-zinc-600">
          {post.title}
        </span>
      </nav>

      {/* Kapak Görseli — 16/9 sinematik oran */}
      {post.image_url && (
        <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-2xl">
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
          />
        </div>
      )}

      {/* Başlık */}
      <header className="mb-8">
        <h1 className="mb-3 text-2xl font-bold leading-snug tracking-tight text-zinc-900">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-[17px] leading-relaxed text-zinc-500">{post.excerpt}</p>
        )}
        <div className="mt-4 flex items-center gap-1.5 text-xs text-zinc-400">
          <Calendar className="h-3 w-3" strokeWidth={1.5} />
          {formattedDate}
        </div>
      </header>

      <hr className="border-zinc-100 mb-8" />

      {/* İçerik */}
      <div>
        {renderContent(post.content)}
      </div>

      {/* CTA */}
      <div className="mt-14 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center">
        <p className="mb-1 font-semibold text-zinc-900">
          Rüyanızın bilinçaltınızdaki gerçek karşılığını merak ediyor musunuz?
        </p>
        <p className="mb-4 text-sm text-zinc-500">
          Yapay zeka ile hem İslami hem psikolojik açıdan anında analiz edin. İlk analiz ücretsiz.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
        >
          Rüyamı Analiz Et
        </Link>
      </div>

      {/* İlgili Yazılar */}
      {relatedPosts && relatedPosts.length > 0 && (
        <div className="mt-14">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-100" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              İlgili Yazılar
            </h2>
            <div className="h-px flex-1 bg-zinc-100" />
          </div>
          <div className="space-y-1">
            {relatedPosts.map((rel) => (
              <Link
                key={rel.id}
                href={`/blog/${rel.slug}`}
                className="group flex flex-col gap-1 rounded-xl border border-transparent px-4 py-3.5 transition-all hover:border-zinc-200 hover:bg-zinc-50"
              >
                <p className="font-semibold text-zinc-900 group-hover:text-zinc-700 transition-colors">
                  {rel.title}
                </p>
                {rel.excerpt && (
                  <p className="line-clamp-1 text-xs text-zinc-400">{rel.excerpt}</p>
                )}
                <p className="text-xs text-zinc-300">
                  {new Date(rel.created_at).toLocaleDateString("tr-TR", {
                    day: "numeric", month: "long",
                  })}
                </p>
              </Link>
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
    </article>
  );
}