import { MetadataRoute } from "next";
import { createClient }  from "@/utils/supabase/server";

const SITE_URL = "https://www.ruyayorumcum.com.tr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();
  const nowISO   = new Date().toISOString();

  // ── Paralel sorgular ──────────────────────────────────────────────────────
  const [postsRes, entriesRes, testsRes] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("slug, created_at, updated_at")
      .eq("is_published", true)
      .lte("published_at", nowISO)
      .order("created_at", { ascending: false })
      .limit(1000),

    supabase
      .from("dream_dictionary")
      .select("slug, updated_at, published_at, created_at")
      .eq("is_published", true)
      .lte("published_at", nowISO)
      .order("published_at", { ascending: false })
      .limit(5000),

    supabase
      .from("viral_tests")
      .select("slug, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const posts   = postsRes.data   ?? [];
  const entries = entriesRes.data ?? [];
  const tests   = testsRes.data   ?? [];

  // ── Statik sayfalar ───────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url:             SITE_URL,
      lastModified:    new Date(),
      changeFrequency: "daily",
      priority:        1.0,
    },
    {
      url:             `${SITE_URL}/blog`,
      lastModified:    new Date(),
      changeFrequency: "daily",
      priority:        0.9,
    },
    {
      url:             `${SITE_URL}/ruya-tabirleri`,
      lastModified:    new Date(),
      changeFrequency: "daily",
      priority:        0.9,
    },
    {
      url:             `${SITE_URL}/testler`,
      lastModified:    new Date(),
      changeFrequency: "weekly",
      priority:        0.8,
    },
    {
      url:             `${SITE_URL}/gizlilik`,
      lastModified:    new Date(),
      changeFrequency: "yearly",
      priority:        0.3,
    },
    {
      url:             `${SITE_URL}/mesafeli-satis`,
      lastModified:    new Date(),
      changeFrequency: "yearly",
      priority:        0.3,
    },
    {
      url:             `${SITE_URL}/iptal-iade`,
      lastModified:    new Date(),
      changeFrequency: "yearly",
      priority:        0.3,
    },
  ];

  // ── Blog sayfaları ────────────────────────────────────────────────────────
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url:             `${SITE_URL}/blog/${post.slug}`,
    lastModified:    new Date((post as any).updated_at ?? post.created_at),
    changeFrequency: "monthly" as const,
    priority:        0.8,
  }));

  // ── Rüya tabirleri sayfaları ──────────────────────────────────────────────
  const dictionaryPages: MetadataRoute.Sitemap = entries.map((entry) => ({
    url:             `${SITE_URL}/ruya-tabirleri/${entry.slug}`,
    lastModified:    new Date(
      (entry as any).updated_at ?? entry.published_at ?? entry.created_at
    ),
    changeFrequency: "monthly" as const,
    priority:        0.7,
  }));

  // ── Psikoloji testleri sayfaları ──────────────────────────────────────────
  const testPages: MetadataRoute.Sitemap = tests.map((test) => ({
    url:             `${SITE_URL}/testler/${test.slug}`,
    lastModified:    new Date(test.created_at),
    changeFrequency: "monthly" as const,
    priority:        0.8,
  }));

  return [
    ...staticPages,
    ...blogPages,
    ...dictionaryPages,
    ...testPages,
  ];
}