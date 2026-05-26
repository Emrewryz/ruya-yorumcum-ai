import { MetadataRoute } from "next";
import { createClient } from "@/utils/supabase/server";

const SITE_URL = "https://www.ruyayorumcum.com.tr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();
    const nowISO = new Date().toISOString(); // ← en üste taşı


  // Blog yazıları — updated_at yoksa created_at kullan
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, created_at")
    .lte("published_at", nowISO)

    .order("created_at", { ascending: false });

  // Rüya tabirleri — yeni updated_at kolonu
 
const { data: entries } = await supabase
  .from("dream_dictionary")
  .select("slug, updated_at, created_at, published_at")
  .eq("is_published", true)
  .lte("published_at", nowISO)          // ← Planlanmış içerikler sitemap'e girmesin
  .order("published_at", { ascending: false });
 
  // ── Statik sayfalar ──────────────────────────────────────────────────────

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/ruya-tabirleri`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/auth`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/gizlilik`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/mesafeli-satis`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/iptal-iade`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // ── Blog yazıları ────────────────────────────────────────────────────────

  const blogPages: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // ── Rüya tabirleri ───────────────────────────────────────────────────────
  // updated_at varsa onu, yoksa created_at'i kullan

  const dictionaryPages: MetadataRoute.Sitemap = (entries ?? []).map((entry) => ({
    url: `${SITE_URL}/ruya-tabirleri/${entry.slug}`,
    lastModified: new Date(entry.updated_at ?? entry.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages, ...dictionaryPages];
}