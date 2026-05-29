import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import SearchBar from "@/components/SearchBar";
import { Calendar } from "lucide-react";

const SITE_URL = "https://www.ruyayorumcum.com.tr";

// ─── Metadata (değişmedi) ─────────────────────────────────────────────────────

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string };
}): Promise<Metadata> {
  const query = searchParams.q?.trim() ?? "";

  if (query) {
    return {
      title: `"${query}" Blog Arama — Rüya Yorumcum`,
      robots: { index: false, follow: true },
    };
  }

  return {
    title: "Blog — Rüya Yorumcum",
    description: "Rüya tabiri, psikoloji ve bilinçaltı üzerine uzman içerikler.",
    alternates: { canonical: `${SITE_URL}/blog` },
    robots: { index: true, follow: true },
    openGraph: {
      title: "Blog — Rüya Yorumcum",
      description: "Rüya tabiri, psikoloji ve bilinçaltı üzerine uzman içerikler.",
      url: `${SITE_URL}/blog`,
      type: "website",
    },
  };
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = createClient();
  const query    = searchParams.q?.trim() ?? "";

  let dbQuery = supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, image_url, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (query) {
    dbQuery = dbQuery.ilike("title", `%${query}%`);
  }

  const { data: posts } = await dbQuery;

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">

      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Blog</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Rüya tabiri, psikoloji ve bilinçaltı üzerine içerikler.
        </p>
      </div>

      <div className="mb-8">
        <Suspense>
          <SearchBar placeholder="Yazılarda ara..." defaultValue={query} />
        </Suspense>
      </div>

      {query && (
        <p className="mb-4 text-sm text-zinc-400">
          <span className="font-medium text-zinc-700">"{query}"</span> için{" "}
          {posts?.length ?? 0} sonuç
        </p>
      )}

      {!posts?.length ? (
        <div className="py-16 text-center">
          <p className="text-sm text-zinc-400">
            {query ? "Aramanızla eşleşen yazı bulunamadı." : "Henüz yazı yok."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-1.5 px-2 py-5 transition-all hover:bg-zinc-50/80 rounded-xl -mx-2"
            >
              <h2 className="text-base font-semibold text-zinc-900 group-hover:text-zinc-600 transition-colors">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="line-clamp-2 text-sm leading-relaxed text-zinc-500">
                  {post.excerpt}
                </p>
              )}
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Calendar className="h-3 w-3" strokeWidth={1.5} />
                {new Date(post.created_at).toLocaleDateString("tr-TR", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}