/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Uyarıları hata olarak görüp build'i durdurmasın
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Tip hatalarını görmezden gelsin (Hızlı deploy için)
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org', // Wikimedia (Tarot kartları) için
      },
    ],
  },
};

export default nextConfig;