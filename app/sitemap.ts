import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.ruyayorumcum.com.tr'
  
  // 1. Supabase istemcisini oluştur
  const supabase = createClient()

  // 2. Veritabanındaki 'dream_dictionary' tablosundan slug ve tarih bilgisini çekiyoruz
  // Not: Senin gönderdiğin CSV'ye göre tablo adının 'dream_dictionary' olduğunu varsayıyorum.
  // Eğer tablo adın farklıysa (örn: dictionary), aşağıdaki 'dream_dictionary' kısmını değiştir.
  const { data: terms, error } = await supabase
    .from('dream_dictionary')
    .select('slug, created_at')

  if (error) {
    console.error('Sitemap verisi çekilirken hata:', error)
  }

  // 3. Statik (Sabit) Sayfalar
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
      priority: 0.5,
    },
    {
      url: `${baseUrl}/yasal/kullanim-kosullari`,
      lastModified: new Date(),
      priority: 0.5,
    },
    {
      url: `${baseUrl}/yasal/mesafeli-satis-sozlesmesi`,
      lastModified: new Date(),
      priority: 0.5,
    },
    {
      url: `${baseUrl}/yasal/iptal-ve-iade-kosullari`,
      lastModified: new Date(),
      priority: 0.5,
    },
  ]

  // 4. Dinamik Rüya Sayfaları (Veritabanından Gelenler)
  // Senin gönderdiğin datadaki 'slug' (örn: ruyada-kopek-gormek) ve 'created_at' kullanılıyor.
  const dictionaryPages: MetadataRoute.Sitemap = (terms || []).map((term) => ({
    url: `${baseUrl}/sozluk/${term.slug}`,
    // Veritabanındaki oluşturulma tarihini kullanıyoruz, yoksa bugünün tarihi
    lastModified: term.created_at ? new Date(term.created_at) : new Date(),
    changeFrequency: 'monthly', // Rüya tabirleri çok sık değişmez, monthly idealdir
    priority: 0.7,
  }))

  // 5. Hepsini birleştirip döndür
  return [...staticPages, ...dictionaryPages]
}