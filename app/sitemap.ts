import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.ruyayorumcum.com.tr'
  
  // 1. Supabase istemcisini oluştur
  const supabase = createClient()

  // --- VERİ ÇEKME İŞLEMLERİ ---

  // A) Rüyaları Çek (Mevcut)
  const { data: terms, error: dreamsError } = await supabase
    .from('dream_dictionary')
    .select('slug, created_at')

  if (dreamsError) {
    console.error('Sitemap (Rüyalar) çekilirken hata:', dreamsError)
  }

  // B) Blog Yazılarını Çek (YENİ EKLENEN KISIM)
  // Sadece yayınlanmış (is_published = true) olanları alıyoruz.
  const { data: posts, error: blogError } = await supabase
    .from('blog_posts')
    .select('slug, created_at')
    .eq('is_published', true)

  if (blogError) {
    console.error('Sitemap (Blog) çekilirken hata:', blogError)
  }

  // --- SAYFA LİSTELERİ OLUŞTURMA ---

  // 2. Statik (Sabit) Sayfalar
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
      // YENİ: Blog Ana Sayfası
      url: `${baseUrl}/blog`,
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
    // Yasal Sayfalar
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

  // 3. Dinamik Rüya Sayfaları
  const dictionaryPages: MetadataRoute.Sitemap = (terms || []).map((term) => ({
    url: `${baseUrl}/sozluk/${term.slug}`,
    lastModified: term.created_at ? new Date(term.created_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // 4. Dinamik Blog Sayfaları (YENİ EKLENEN KISIM)
  const blogPages: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.created_at ? new Date(post.created_at) : new Date(),
    changeFrequency: 'weekly', // Bloglar yorum vs. ile güncellenebilir
    priority: 0.8, // Blog yazıları SEO için değerlidir, yüksek puan veriyoruz
  }))

  // 5. Hepsini birleştirip döndür
  return [...staticPages, ...dictionaryPages, ...blogPages]
}