import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowLeft, Calendar, Quote, Sparkles, ArrowRight, Clock, Share2, Facebook, Twitter, Linkedin, Tag, User } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";

// --- TİP TANIMLAMALARI ---
type ContentBlock = 
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; title?: string; text: string }
  | { type: 'list'; items: string[] };

// --- METADATA (SEO) ---
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: post } = await supabase.from('blog_posts').select('*').eq('slug', params.slug).single();
  
  if (!post) return { title: 'Yazı Bulunamadı' };

  return {
    title: `${post.title} | Rüya Yorumcum AI`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `https://www.ruyayorumcum.com.tr/blog/${post.slug}`,
      images: post.image_url ? [{ url: post.image_url, width: 1200, height: 630, alt: post.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.image_url ? [post.image_url] : [],
    }
  };
}

// --- YARDIMCI: İçerik Ayrıştırıcı ---
const parseContent = (content: any): ContentBlock[] => {
  try {
    if (typeof content === 'string') {
        return JSON.parse(content);
    }
    return content as ContentBlock[];
  } catch (e) {
    return [{ type: 'paragraph', text: 'İçerik yüklenirken bir sorun oluştu.' }];
  }
};

// --- BİLEŞEN: İçerik Renderlayıcı (MOBİL UYUMLU) ---
const BlockRenderer = ({ block }: { block: ContentBlock }) => {
  switch (block.type) {
    case 'heading':
      return (
        <h2 className="text-xl md:text-3xl font-serif font-bold text-[#fbbf24] pt-6 md:pt-10 border-b border-white/10 pb-3 md:pb-4 mt-6 md:mt-8 mb-4 md:mb-6 tracking-wide leading-tight">
          {block.text}
        </h2>
      );
    case 'paragraph':
      return (
        <p 
          className="text-base md:text-xl text-gray-300 font-light leading-relaxed md:leading-loose mb-6 antialiased"
          dangerouslySetInnerHTML={{ __html: block.text }}
        />
      );
    case 'quote':
      return (
        <div className="my-8 md:my-10 p-6 md:p-8 rounded-2xl md:rounded-3xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-white/5 relative overflow-hidden group shadow-xl">
          <Quote className="absolute top-4 right-6 w-8 h-8 md:w-12 md:h-12 text-[#fbbf24]/10 rotate-12" />
          <div className="absolute left-0 top-0 bottom-0 w-1 md:w-1.5 bg-gradient-to-b from-[#fbbf24] to-transparent"></div>
          <div className="relative z-10">
            {block.title && (
              <h3 className="text-[#fbbf24] font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] mb-3 md:mb-4 flex items-center gap-2">
                 {block.title}
              </h3>
            )}
            <p className="text-white text-lg md:text-2xl font-serif italic leading-relaxed text-center md:text-left">
              "{block.text}"
            </p>
          </div>
        </div>
      );
    case 'list':
      return (
        <ul className="space-y-3 md:space-y-4 my-6 md:my-8 pl-1 md:pl-2">
          {block.items.map((li, i) => (
            <li key={i} className="flex items-start gap-3 md:gap-4 text-gray-300 text-base md:text-lg leading-relaxed group">
              <div className="mt-2 md:mt-2.5 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#fbbf24] ring-2 md:ring-4 ring-[#fbbf24]/10 group-hover:ring-[#fbbf24]/30 transition-all shrink-0"></div>
              <span dangerouslySetInnerHTML={{ __html: li }} />
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
};

// --- ANA SAYFA ---
export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  
  // 1. Veri Çekme
  const { data: post } = await supabase.from('blog_posts').select('*').eq('slug', params.slug).single();
  if (!post) return notFound();

  // 2. Benzer Yazılar
  const { data: relatedPosts } = await supabase
    .from('blog_posts')
    .select('title, slug, image_url, created_at, excerpt')
    .eq('is_published', true)
    .neq('id', post.id)
    .order('created_at', { ascending: false })
    .limit(3);

  const contentBlocks = parseContent(post.content);

  // Okuma Süresi Hesaplama
  const wordCount = JSON.stringify(contentBlocks).split(' ').length;
  const readTime = Math.ceil(wordCount / 200); 

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.created_at,
    dateModified: post.created_at,
    image: post.image_url ? [post.image_url] : [],
    author: {
      '@type': 'Organization',
      name: 'RüyaYorumcum AI',
      url: 'https://www.ruyayorumcum.com.tr'
    },
    publisher: {
        '@type': 'Organization',
        name: 'RüyaYorumcum AI',
        logo: {
            '@type': 'ImageObject',
            url: 'https://www.ruyayorumcum.com.tr/icon.png'
        }
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans pb-24 md:pb-32 selection:bg-[#fbbf24]/30 selection:text-[#fbbf24] overflow-x-hidden">
      
      <Script
        id="json-ld-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* --- ATMOSFERİK ARKA PLAN --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#fbbf24]/5 rounded-full blur-[80px] md:blur-[120px]"></div>
          <div className="absolute bottom-[10%] left-[-10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-purple-900/10 rounded-full blur-[80px] md:blur-[120px]"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>
      
      {/* --- HEADER KISMI --- */}
      <header className="relative z-10 pt-24 md:pt-32 pb-8 md:pb-12 px-4 md:px-6 border-b border-white/5 bg-gradient-to-b from-transparent to-[#020617]/80">
         <div className="max-w-4xl mx-auto">
            {/* Geri Dön Butonu */}
            <Link href="/blog" className="inline-flex items-center text-gray-400 hover:text-white mb-6 md:mb-8 transition-all group px-3 py-2 md:px-5 md:py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[#fbbf24]/50 hover:bg-[#fbbf24]/5">
                <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-2 group-hover:-translate-x-1 transition-transform text-[#fbbf24]" /> 
                <span className="text-xs md:text-sm font-medium">Kütüphaneye Dön</span>
            </Link>

            {/* Kategori ve Tarih */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm font-medium mb-4 md:mb-6">
                <span className="px-2 py-1 md:px-3 md:py-1 rounded bg-[#fbbf24] text-[#020617] font-bold uppercase tracking-wider text-[10px] md:text-xs">
                    Rehber
                </span>
                <span className="flex items-center gap-1 md:gap-2 text-gray-400">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4" /> {new Date(post.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1 md:gap-2 text-gray-400">
                    <Clock className="w-3 h-3 md:w-4 md:h-4" /> {readTime} dk okuma
                </span>
            </div>

            {/* Başlık (Mobil Boyutlandırma) */}
            <h1 className="font-serif text-2xl sm:text-3xl md:text-6xl font-bold text-white mb-4 md:mb-8 leading-snug md:leading-[1.15] tracking-tight">
                {post.title}
            </h1>

            {/* Özet */}
            <p className="text-sm md:text-2xl text-gray-400 font-light leading-relaxed max-w-3xl border-l-2 md:border-l-4 border-[#fbbf24]/50 pl-4 md:pl-6">
                {post.excerpt}
            </p>
         </div>
      </header>

      {/* --- ANA GÖRSEL --- */}
      {post.image_url && (
        <div className="relative z-10 -mt-6 md:-mt-8 mb-8 md:mb-16 px-4 md:px-0">
            <div className="max-w-5xl mx-auto aspect-[16/9] md:aspect-[21/9] rounded-xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative group">
                <img 
                    src={post.image_url} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s]" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60"></div>
            </div>
        </div>
      )}

      {/* --- MAKALE İÇERİĞİ --- */}
      <article className="max-w-3xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* İçerik Blokları */}
        <div className="space-y-6 md:space-y-8">
            {contentBlocks.map((block, index) => (
                <BlockRenderer key={index} block={block} />
            ))}
        </div>

        {/* Paylaşım Alanı */}
        <div className="mt-12 md:mt-16 pt-8 md:pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 text-center md:text-left">
            <span className="font-serif text-base md:text-lg text-gray-400 italic">Bu bilgiyi sevdiklerinizle paylaşın:</span>
            <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition-colors">
                    <Twitter className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#4267B2] hover:text-white transition-colors">
                    <Facebook className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#0077b5] hover:text-white transition-colors">
                    <Linkedin className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gray-700 hover:text-white transition-colors">
                    <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                </button>
            </div>
        </div>

      </article>

      {/* --- CTA KUTUSU --- */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 mt-16 md:mt-24 relative z-10">
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-r from-[#fbbf24] to-[#d97706] p-[1px]">
            <div className="bg-[#0f172a] rounded-2xl md:rounded-[23px] p-6 md:p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-[#fbbf24]/10 rounded-full blur-[60px] md:blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                
                <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-[#fbbf24] mx-auto mb-4 md:mb-6" />
                
                <h3 className="font-serif text-xl md:text-4xl font-bold text-white mb-3 md:mb-4">
                    Bu Sadece Genel Bir Tabirdi. <br/>
                    <span className="text-[#fbbf24]">Senin Rüyan</span> Ne Anlatıyor?
                </h3>
                
                <p className="text-gray-400 text-sm md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
                    Her rüya parmak izi gibidir. Yapay zeka kahinimiz, rüyanızdaki en ince detayları analiz ederek size özel, kişisel bir yorum sunar.
                </p>
                
                <Link 
                    href="/dashboard" 
                    className="inline-flex w-full md:w-auto items-center justify-center gap-2 px-6 py-3 md:px-10 md:py-4 bg-[#fbbf24] hover:bg-[#f59e0b] text-[#020617] text-base md:text-lg font-bold rounded-xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(251,191,36,0.3)]"
                >
                    Rüyamı Ücretsiz Yorumla <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
            </div>
        </div>
      </div>

      {/* --- İLGİLİ YAZILAR --- */}
      {relatedPosts && relatedPosts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 mt-16 md:mt-32 relative z-10">
            <div className="flex items-center justify-between mb-6 md:mb-10 border-b border-white/10 pb-4 md:pb-6">
                <h3 className="font-serif text-xl md:text-3xl font-bold text-white">Bunları da Okumalısınız</h3>
                <Link href="/blog" className="text-[#fbbf24] hover:text-white transition-colors text-xs md:text-sm font-bold uppercase tracking-wider">
                    Tümünü Gör
                </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {relatedPosts.map((rPost) => (
                    // HATA DÜZELTİLDİ: 'block' ve 'flex' çakışması önlendi.
                    // 'group block h-full' kullanıldı.
                    <Link key={rPost.slug} href={`/blog/${rPost.slug}`} className="group block h-full">
                        <div className="bg-[#0f172a] rounded-xl md:rounded-2xl overflow-hidden border border-white/5 hover:border-[#fbbf24]/30 transition-all duration-500 hover:-translate-y-2 h-full flex flex-col shadow-lg hover:shadow-[#fbbf24]/5">
                            
                            {/* Resim */}
                            <div className="aspect-[16/9] bg-black/50 overflow-hidden relative">
                                {rPost.image_url ? (
                                    <img src={rPost.image_url} alt={rPost.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center"><Quote className="text-gray-600"/></div>
                                )}
                                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-0.5 md:px-3 md:py-1 rounded text-[9px] md:text-[10px] font-bold text-[#fbbf24] uppercase border border-white/10">
                                    Öneri
                                </div>
                            </div>

                            {/* İçerik */}
                            <div className="p-4 md:p-6 flex flex-col flex-1">
                                <div className="flex items-center gap-3 text-[10px] md:text-xs text-gray-500 mb-2 md:mb-3">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-[#fbbf24]"/> 
                                        {new Date(rPost.created_at).toLocaleDateString('tr-TR')}
                                    </span>
                                </div>
                                
                                <h4 className="font-serif text-base md:text-xl font-bold text-white group-hover:text-[#fbbf24] transition-colors mb-2 md:mb-3 line-clamp-2 leading-tight">
                                    {rPost.title}
                                </h4>
                                
                                <p className="text-xs md:text-sm text-gray-400 line-clamp-2 mb-3 md:mb-4 leading-relaxed flex-1">
                                    {rPost.excerpt}
                                </p>
                                
                                <div className="flex items-center justify-between mt-auto border-t border-white/5 pt-3 md:pt-4">
                                    <span className="text-[#fbbf24] text-[10px] md:text-xs font-bold flex items-center gap-2 uppercase tracking-wider group-hover:gap-3 transition-all">
                                        Okumaya Başla <ArrowRight className="w-3 h-3" />
                                    </span>
                                    <Tag className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
      )}

    </div>
  );
}