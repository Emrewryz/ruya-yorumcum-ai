import type { MetadataRoute } from "next";

const SITE_URL = "https://www.ruyayorumcum.com.tr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── Standart arama motorları ──────────────────────────────────────────
      {
        userAgent: "*",
        allow: ["/", "/ruya-tabirleri", "/kesfet", "/blog", "/share"],
        disallow: [
          "/admin",
          "/api/",
          "/auth",
          "/profile",
          "/payment",
          "/onboarding",
          "/galerim",
          "/oruntu-analizi",
        ],
      },

      // ── LLM / AI tarayıcıları — llms.txt'e yönlendir ─────────────────────
      // Bu botlar llms.txt'i okuyarak siteyi doğru bağlamla tanır.
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/admin", "/api/", "/auth", "/profile", "/payment"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/admin", "/api/", "/auth", "/profile", "/payment"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/admin", "/api/", "/auth", "/profile", "/payment"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/admin", "/api/", "/auth", "/profile", "/payment"],
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
        disallow: ["/admin", "/api/", "/auth", "/profile", "/payment"],
      },
      {
        userAgent: "cohere-ai",
        allow: "/",
        disallow: ["/admin", "/api/", "/auth", "/profile", "/payment"],
      },
    ],

    // ── Sitemap ───────────────────────────────────────────────────────────
    sitemap: `${SITE_URL}/sitemap.xml`,

    // ── LLM Bağlam Dosyası ────────────────────────────────────────────────
    // GPTBot, ClaudeBot ve diğer LLM tarayıcıları bu dosyayı okuyarak
    // platformu doğru şekilde tanımlar ve kullanıcılara doğru önerir.
    // Spec: https://llmstxt.org
    // Dosya konumu: /llms.txt (public/ altında statik olarak servis edilir)
  };
}