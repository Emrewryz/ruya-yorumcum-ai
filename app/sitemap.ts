import { MetadataRoute } from "next";
import { createClient } from "@/utils/supabase/server";

const SITE_URL = "https://www.ruyayorumcum.com.tr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();
  const nowISO   = new Date().toISOString();

  // ── Blog yazıları — is_published + zaman filtresi + limit ────────────────
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, created_at")
    .eq("is_published", true)           // taslak sızma önlemi
    .lte("published_at", nowISO)        // zaman makinesi koruması
    .order("created_at", { ascending: false })
    .limit(1000);                       // bellek koruması

  // ── Rüya tabirleri ───────────────────────────────────────────────────────
  const { data: entries } = await supabase
    .from("dream_dictionary")
    .select("slug, updated_at, created_at, published_at")
    .eq("is_published", true)
    .lte("published_at", nowISO)
    .order("published_at", { ascending: false })
    .limit(5000);                       // bellek koruması

  // ── Keşfet (UGC) rüyaları ────────────────────────────────────────────────
  const { data: dreams } = await supabase
    .from("dreams")
    .select("slug, created_at")
    .eq("is_public", true)
    .not("slug", "is", null)            // slug'ı olmayanları atla
    .order("created_at", { ascending: false })
    .limit(5000);                       // bellek koruması

  // ── Statik sayfalar — /auth kaldırıldı ───────────────────────────────────
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
      url: `${SITE_URL}/kesfet`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
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
    { url: `${SITE_URL}/testler`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  // ── Blog sayfaları ────────────────────────────────────────────────────────
  const blogPages: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // ── Rüya tabirleri sayfaları ──────────────────────────────────────────────
  const dictionaryPages: MetadataRoute.Sitemap = (entries ?? []).map((entry) => ({
    url: `${SITE_URL}/ruya-tabirleri/${entry.slug}`,
    lastModified: new Date(entry.updated_at ?? entry.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // ── Keşfet (UGC) sayfaları ────────────────────────────────────────────────
  const kesfetPages: MetadataRoute.Sitemap = (dreams ?? []).map((dream) => ({
    url: `${SITE_URL}/kesfet/${dream.slug}`,
    lastModified: new Date(dream.created_at),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages, ...dictionaryPages, ...kesfetPages];
}