import { MetadataRoute } from 'next'
// Burada kendi Supabase istemcini veya veri çekme fonksiyonunu kullanmalısın
// import { getRuyalar } from '@/lib/db' 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.ruyayorumcum.com.tr'

  // 1. Statik sayfaların (Ana sayfa, Sözlük ana sayfa vb.)
  const staticPages = [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/sozluk`, lastModified: new Date() },
  ]

  // 2. Dinamik sayfaların (Supabase'deki tüm rüya tabirleri)
  // Örn: const ruyalar = await getRuyalar()
  const ruyalar = [ { slug: 'ruyada-altin-gormek' }, { slug: 'ruyada-yilan-gormek' } ] // Temsili veri

  const dynamicPages = ruyalar.map((ruya) => ({
    url: `${baseUrl}/sozluk/${ruya.slug}`,
    lastModified: new Date(),
  }))

  return [...staticPages, ...dynamicPages]
}