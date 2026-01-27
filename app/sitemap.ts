import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.ruyayorumcum.com.tr'
  const supabase = await createClient() // Server client olduğu için await gerekebilir

  // 1. Veritabanındaki TÜM rüya sluglarını çekiyoruz
  // 'ruyalar' tablo adını veritabanındaki gerçek tablo adınla değiştir
  const { data: ruyalar, error } = await supabase
    .from('ruyalar') 
    .select('slug, updated_at')

  if (error) {
    console.error('Sitemap verisi çekilirken hata oluştu:', error)
  }

  // 2. Statik sayfaları tanımla
  const staticPages = [
    '',
    '/sozluk',
    '/pricing',
    '/yasal/gizlilik-politikasi',
    '/yasal/kullanim-kosullari',
    '/yasal/mesafeli-satis-sozlesmesi',
    '/yasal/iptal-ve-iade-kosullari'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }))

  // 3. Veritabanından gelen rüyaları haritaya dönüştür
  const rüyaPages = (ruyalar || []).map((ruya) => ({
    url: `${baseUrl}/sozluk/${ruya.slug}`,
    lastModified: ruya.updated_at ? new Date(ruya.updated_at) : new Date(),
  }))

  // Statik ve dinamik sayfaları birleştirip döndür
  return [...staticPages, ...rüyaPages]
}