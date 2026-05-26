import { MetadataRoute } from "next";
import { createClient } from "@/utils/supabase/server";

const SITE_URL = "https://www.ruyayorumcum.com.tr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();

  // Blog yazıları
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  // Rüya tabirleri
  const { data: entries } = await supabase
    .from("dream_dictionary")
    .select("slug, created_at")
    .order("term", { ascending: true });

  // Statik sayfalar
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
      priority: 0.5,
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

  // Blog yazıları — yüksek öncelik
  const blogPages: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Rüya tabirleri — uzun kuyruk SEO trafiğinin kaynağı
  const dictionaryPages: MetadataRoute.Sitemap = (entries ?? []).map((entry) => ({
    url: `${SITE_URL}/ruya-tabirleri/${entry.slug}`,
    lastModified: new Date(entry.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages, ...dictionaryPages];
}