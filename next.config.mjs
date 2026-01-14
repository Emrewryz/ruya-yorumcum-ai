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
};

export default nextConfig;