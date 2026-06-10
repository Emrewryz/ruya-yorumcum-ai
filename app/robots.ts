import type { MetadataRoute } from "next";

const SITE_URL = "https://www.ruyayorumcum.com.tr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/ruya-tabirleri", "/blog", "/testler", "/gizlilik", "/mesafeli-satis", "/iptal-iade"],
        disallow: [
          "/admin",
          "/api/",
          "/auth",
          "/profile",
          "/payment",
          "/onboarding",
          "/galerim",
          "/oruntu-analizi",
          "/kesfet",
        ],
      },
      { userAgent: "GPTBot",          allow: "/", disallow: ["/admin", "/api/", "/auth"] },
      { userAgent: "ClaudeBot",       allow: "/", disallow: ["/admin", "/api/", "/auth"] },
      { userAgent: "anthropic-ai",    allow: "/", disallow: ["/admin", "/api/", "/auth"] },
      { userAgent: "Google-Extended", allow: "/", disallow: ["/admin", "/api/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host:    SITE_URL,
  };
}