import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.ruyayorumcum.com.tr'
  
  // 1. Supabase istemcisini oluştur
  const supabase = createClient()

  // 2. Veritabanındaki 'dream_dictionary' tablosundan tüm slugları çek
  // Not: Eğer tablonuzda 'updated_at' sütunu yoksa sadece 'slug' seçebilirsiniz.
  const { data: terms } = await supabase
    .from('dream_dictionary')
    .select('slug, updated_at')

  // 3. Statik Sayfalar (Elle eklediklerimiz)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/sozluk`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/yasal/gizlilik-politikasi`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/yasal/kullanim-kosullari`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/yasal/mesafeli-satis-sozlesmesi`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/yasal/iptal-ve-iade-kosullari`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // 4. Dinamik Rüya Sayfaları (Otomatik oluşturulanlar)
  const dictionaryPages: MetadataRoute.Sitemap = (terms || []).map((term) => ({
    url: `${baseUrl}/sozluk/${term.slug}`,
    // Eğer veritabanında tarih varsa onu kullan, yoksa bugünün tarihini at
    lastModified: term.updated_at ? new Date(term.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // 5. Hepsini birleştirip döndür
  return [...staticPages, ...dictionaryPages]
}