import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server' // Kendi supabase yoluna göre ayarla

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.ruyayorumcum.com.tr'
  const supabase = createClient()

  // 1. Supabase'deki tüm rüya sluglarını çekiyoruz
  const { data: ruyalar } = await supabase
    .from('ruyalar') // Tablo adın neyse onu yaz (örn: dreams veya ruyalar)
    .select('slug, updated_at')

  // 2. Statik sayfaları tanımla
  const staticPages = [
    '',
    '/sozluk',
    '/pricing',
    '/yasal/gizlilik-politikasi',
    '/yasal/kullanim-kosullari'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }))

  // 3. Dinamik rüya sayfalarını haritaya ekle
  const rüyaPages = (ruyalar || []).map((ruya) => ({
    url: `${baseUrl}/sozluk/${ruya.slug}`,
    lastModified: ruya.updated_at || new Date(),
  }))

  return [...staticPages, ...rüyaPages]
}