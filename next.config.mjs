/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint:     { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  async redirects() {
    return [
      { source: "/sozluk",        destination: "/ruya-tabirleri",        permanent: true },
      { source: "/sozluk/:slug*", destination: "/ruya-tabirleri/:slug*", permanent: true },
      { source: "/dashboard",        destination: "/", permanent: true },
      { source: "/dashboard/:path*", destination: "/", permanent: true },

      // Yasal sayfalar — Google'ın eski URL'lerini doğru URL'lere yönlendir
      { source: "/yasal/mesafeli-satis-sozlesmesi", destination: "/mesafeli-satis", permanent: true },
      { source: "/yasal/gizlilik-politikasi",       destination: "/gizlilik",       permanent: true },
      { source: "/yasal/iptal-iade-kosullari",      destination: "/iptal-iade",     permanent: true },
      { source: "/yasal/:path*",                    destination: "/",               permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: "/ads.txt",
        headers: [{ key: "Content-Type", value: "text/plain; charset=utf-8" }],
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      {
        protocol: "https",
        hostname:  "jhejnsarsxhvmsquxuat.supabase.co",
        pathname:  "/storage/v1/object/public/**",
      },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "www.ruyayorumcum.com.tr" },
      { protocol: "https", hostname: "ruyayorumcum.com.tr" },
    ],
  },
};

export default nextConfig;
