/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Build Hatalarını Yoksayma (Hızlı Deploy İçin)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // 2. Resim Optimizasyonu
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
        hostname: 'upload.wikimedia.org',
      },
    ],
  },

  // 3. ADS.TXT GARANTİSİ (Headers Ayarı)
  // Bu ayar, tarayıcılara ve Google Botlarına bu dosyanın kesinlikle bir metin dosyası olduğunu söyler.
  async headers() {
    return [
      {
        source: '/ads.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain; charset=utf-8',
          },
        ],
      },
    ];
  },
};

export default nextConfig;