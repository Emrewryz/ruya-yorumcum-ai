import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowLeft, Calendar, Quote, Sparkles, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";

// --- TİP TANIMLAMALARI ---
type ContentBlock = 
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; title?: string; text: string }
  | { type: 'list'; items: string[] };

// --- METADATA ---
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: post } = await supabase.from('blog_posts').select('*').eq('slug', params.slug).single();
  
  if (!post) return { title: 'Yazı Bulunamadı' };

  return {
    title: `${post.title} - RüyaYorumcum Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      images: post.image_url ? [post.image_url] : [],
    }
  };
}

// --- YARDIMCI FONKSİYONLAR ---
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

// --- İÇERİK RENDERLAYICI BİLEŞEN ---
const BlockRenderer = ({ block }: { block: ContentBlock }) => {
  switch (block.type) {
    case 'heading':
      return (
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#fbbf24] pt-8 border-b border-white/10 pb-4 mt-4">
          {block.text}
        </h2>
      );
    case 'paragraph':
      return (
        <p className="text-lg text-gray-300 font-light leading-loose mb-4">
          {block.text}
        </p>
      );
    case 'quote':
      return (
        <div className="my-8 p-6 md:p-8 rounded-2xl bg-[#0f172a] border border-white/10 relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#fbbf24]"></div>
          <div className="relative z-10">
            {block.title && (
              <h3 className="text-[#fbbf24] font-bold text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                <Quote className="w-4 h-4" /> {block.title}
              </h3>
            )}
            <p className="text-white text-lg font-serif italic leading-relaxed">"{block.text}"</p>
          </div>
        </div>
      );
    case 'list':
      return (
        <ul className="space-y-4 my-6 pl-2">
          {block.items.map((li, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-300 text-lg leading-relaxed">
              <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#fbbf24] shrink-0"></span>
              <span>{li}</span>
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
  
  // 1. Mevcut Yazıyı Çek
  const { data: post } = await supabase.from('blog_posts').select('*').eq('slug', params.slug).single();
  if (!post) return notFound();

  // 2. Diğer (Related) Yazıları Çek (Mevcut yazı hariç son 3 yazı)
  const { data: relatedPosts } = await supabase
    .from('blog_posts')
    .select('title, slug, image_url, created_at')
    .eq('is_published', true)
    .neq('id', post.id) // Kendisini getirme
    .order('created_at', { ascending: false })
    .limit(3);

  const contentBlocks = parseContent(post.content);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.created_at,
    image: post.image_url,
    author: {
      '@type': 'Organization',
      name: 'RüyaYorumcum AI'
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans pb-32">
      
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ATMOSFER */}
      <div className="bg-noise fixed inset-0 opacity-20 pointer-events-none"></div>
      
      {/* İÇERİK */}
      <article className="max-w-3xl mx-auto px-6 pt-32 relative z-10">
        {/* Üst Bilgi */}
        <Link href="/blog" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors group px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#fbbf24]/50">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Blog'a Dön
        </Link>

        {/* Kapak Görseli */}
        {post.image_url && (
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden mb-10 border border-white/10 shadow-2xl">
                <img src={post.image_url} alt={post.title} className="object-cover w-full h-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80"></div>
            </div>
        )}

        <h1 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6 leading-[1.2] tracking-tight">
          {post.title}
        </h1>

        <div className="flex items-center justify-between border-b border-white/10 pb-8 mb-8">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10">
                <Calendar className="w-4 h-4 text-[#fbbf24]" /> {new Date(post.created_at).toLocaleDateString('tr-TR')}
            </span>
            <span className="text-[#fbbf24] font-medium">Rüya Rehberi</span>
          </div>
        </div>

        {/* DİNAMİK İÇERİK */}
        <div className="space-y-6">
            {contentBlocks.map((block, index) => (
                <BlockRenderer key={index} block={block} />
            ))}
        </div>

      </article>

      {/* İLGİNİZİ ÇEKEBİLİR (RELATED POSTS) - YENİ ÖZELLİK */}
      {relatedPosts && relatedPosts.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 mt-24 pt-16 border-t border-white/10 relative z-10">
            <h3 className="font-serif text-2xl font-bold text-white mb-8">İlginizi Çekebilecek Diğer Yazılar</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((rPost) => (
                    <Link key={rPost.slug} href={`/blog/${rPost.slug}`} className="group block">
                        <div className="bg-[#0f172a] rounded-xl overflow-hidden border border-white/5 hover:border-[#fbbf24]/30 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                            <div className="aspect-video bg-black/50 overflow-hidden relative">
                                {rPost.image_url && (
                                    <img src={rPost.image_url} alt={rPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                )}
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                                <span className="text-xs text-gray-500 mb-2 block">{new Date(rPost.created_at).toLocaleDateString('tr-TR')}</span>
                                <h4 className="font-serif text-lg font-bold text-white group-hover:text-[#fbbf24] transition-colors mb-4 line-clamp-2">
                                    {rPost.title}
                                </h4>
                                <span className="text-[#fbbf24] text-xs font-bold mt-auto flex items-center gap-1 uppercase tracking-wider">
                                    Oku <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
      )}

      {/* Makale Sonu CTA */}
      <div className="max-w-3xl mx-auto px-6 mt-20 relative z-10">
        <div className="bg-gradient-to-r from-[#fbbf24]/10 to-[#f59e0b]/10 border border-[#fbbf24]/20 rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
          <div className="relative z-10">
            <h3 className="font-serif text-2xl font-bold text-white mb-3 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-[#fbbf24]" />
                Bu Konuyu Rüyanda mı Gördün?
            </h3>
            <p className="text-gray-400 mb-6">Blog yazıları geneldir. Senin rüyanın sana özel gizli mesajını yapay zeka kahinimiz ile çöz.</p>
            <Link href="/dashboard" className="inline-block bg-[#fbbf24] text-black font-bold px-8 py-3 rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                Rüyamı Şimdi Yorumla
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}