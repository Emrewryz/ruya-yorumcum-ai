import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { ArrowLeft, Sparkles } from "lucide-react";

const SITE_URL = "https://www.ruyayorumcum.com.tr";

// ─── Metadata — Open Graph dahil ─────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data: dream } = await supabase
    .from("dreams")
    .select("dream_title, dream_text, image_url, category")
    .eq("slug", params.slug)
    .eq("is_public", true)
    .single();

  if (!dream) return { title: "Rüya Bulunamadı" };

  const title       = dream.dream_title
    ? `${dream.dream_title} | Rüya Yorumcum`
    : "Yapay Zeka Rüya Görseli | Rüya Yorumcum";
  const description = dream.dream_text.slice(0, 160);
  const url         = `${SITE_URL}/kesfet/${params.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      type:     "article",
      siteName: "Rüya Yorumcum",
      images:   dream.image_url
        ? [{ url: dream.image_url, width: 1024, height: 1024, alt: dream.dream_title ?? "Rüya görseli" }]
        : [],
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      images:      dream.image_url ? [dream.image_url] : [],
    },
  };
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────

export const revalidate = 3600; // 1 saatte bir yenile

export default async function KesfetDreamPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: dream, error } = await supabase
    .from("dreams")
    .select("id, dream_title, dream_text, image_url, category, tags, created_at")
    .eq("slug", params.slug)
    .eq("is_public", true)
    .single();

  if (error || !dream) notFound();

  // JSON-LD — Google Görseller için
  const jsonLd = {
    "@context": "https://schema.org",
    "@type":    "ImageObject",
    name:       dream.dream_title ?? "Yapay Zeka Rüya Görseli",
    description: dream.dream_text.slice(0, 200),
    contentUrl:  dream.image_url,
    url:         `${SITE_URL}/kesfet/${params.slug}`,
    creator: {
      "@type": "Organization",
      name:    "Rüya Yorumcum",
    },
    datePublished: dream.created_at,
    keywords:      dream.tags?.join(", "),
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Üst bar */}
      <header className="sticky top-0 z-10 border-b border-zinc-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link
            href="/kesfet"
            className="group flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.5} />
            Keşfet
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-zinc-900 hover:text-zinc-600 transition-colors"
          >
            Rüya Yorumcum
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-10">

        {/* Hero Görsel */}
        {dream.image_url && (
          <div className="relative mb-8 aspect-square w-full overflow-hidden rounded-3xl bg-zinc-100 shadow-lg">
            <Image
              src={dream.image_url}
              alt={dream.dream_title ?? "Yapay zeka ile oluşturulmuş rüya görseli"}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              unoptimized
            />
            {/* Kategori badge */}
            {dream.category && (
              <div className="absolute left-4 top-4">
                <span className="rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                  {dream.category}
                </span>
              </div>
            )}
            {/* Yapay zeka rozeti */}
            <div className="absolute bottom-4 right-4">
              <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-zinc-700 backdrop-blur-sm shadow-sm">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
                Yapay Zeka ile Oluşturuldu
              </span>
            </div>
          </div>
        )}

        {/* Başlık */}
        {dream.dream_title && (
          <h1 className="mb-4 text-2xl font-bold tracking-tight text-zinc-900">
            {dream.dream_title}
          </h1>
        )}

        {/* Rüya metni */}
        <div className="mb-6 rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
            Rüya
          </p>
          <p className="text-sm leading-loose text-zinc-700">
            {dream.dream_text}
          </p>
        </div>

        {/* Etiketler */}
        {dream.tags && dream.tags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {dream.tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/kesfet?kategori=${encodeURIComponent(dream.category ?? "")}`}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <Sparkles className="h-5 w-5 text-zinc-700" strokeWidth={1.5} />
            </div>
          </div>
          <p className="mb-1 font-semibold text-zinc-900">
            Sen de kendi rüyanı çizdir ve analiz et
          </p>
          <p className="mb-5 text-sm text-zinc-500">
            Yapay zeka ile rüyanı görselleştir, İslami ve psikolojik analizini al.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
          >
            Ücretsiz Dene
          </Link>
        </div>

        {/* Tarih */}
        <p className="mt-6 text-center text-xs text-zinc-400">
          {new Date(dream.created_at).toLocaleDateString("tr-TR", {
            day: "numeric", month: "long", year: "numeric",
          })}
        </p>
      </main>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}