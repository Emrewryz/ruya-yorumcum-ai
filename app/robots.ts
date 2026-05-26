import { MetadataRoute } from "next";

const SITE_URL = "https://www.ruyayorumcum.com.tr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/callback",
          "/payment/",
          "/profile",
          "/onboarding",
          "/share/",    // Kişisel paylaşım sayfaları indexlenmesin
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}