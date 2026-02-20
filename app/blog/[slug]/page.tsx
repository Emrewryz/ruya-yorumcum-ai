import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowLeft, Calendar, Quote, Clock, ChevronRight, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import AdUnit from "@/components/AdUnit";
import BlogSidebarCTA from "@/components/BlogSidebarCTA"; 

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

// --- BİLEŞEN: İçerik Renderlayıcı ---
const BlockRenderer = ({ block }: { block: ContentBlock }) => {
  switch (block.type) {
    case 'heading':
      return (
        <h2 className="text-xl md:text-2xl font-serif font-bold text-white pt-6 border-b border-white/5 pb-3 mt-6 mb-5 tracking-tight flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> {block.text}
        </h2>
      );
    case 'paragraph':
      return (
        <p 
          className="text-sm md:text-base text-slate-300 font-light leading-relaxed md:leading-[1.7] mb-5 antialiased"
          dangerouslySetInnerHTML={{ __html: block.text }}
        />
      );
    case 'quote':
      return (
        <div className="my-10 p-6 md:p-10 rounded-[2rem] bg-[#131722] border border-white/5 relative overflow-hidden shadow-xl">
          <Quote className="absolute top-6 right-6 w-12 h-12 text-amber-500/10 rotate-180" />
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-amber-700"></div>
          <div className="relative z-10 pl-2">
            {block.title && (
              <h3 className="text-amber-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-4">
                 {block.title}
              </h3>
            )}
            <p className="text-white text-lg md:text-xl font-serif italic leading-relaxed">
              "{block.text}"
            </p>
          </div>
        </div>
      );
    case 'list':
      return (
        <ul className="space-y-3 my-8 p-6 bg-white/[0.02] rounded-2xl border border-white/5">
          {block.items.map((li, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-300 text-sm md:text-base leading-relaxed group">
              <div className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-500/50 shrink-0"></div>
              <span dangerouslySetInnerHTML={{ __html: li }} />
            :</li>
          ))}
        </ul>
      );
    default:
      return null;
  }
};

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  
  const { data: post } = await supabase.from('blog_posts').select('*').eq('slug', params.slug).single();
  if (!post) return notFound();

  const { data: relatedPosts } = await supabase
    .from('blog_posts')
    .select('title, slug, image_url, created_at, excerpt')
    .eq('is_published', true)
    .neq('id', post.id)
    .order('created_at', { ascending: false })
    .limit(3);

  const contentBlocks = parseContent(post.content);
  const wordCount = JSON.stringify(contentBlocks).split(' ').length;
  const readTime = Math.ceil(wordCount / 200) || 1; 

  // --- REKLAM SINIRLANDIRMA VE YERLEŞTİRME MATEMATİĞİ ---
  const MAX_IN_CONTENT_ADS = 3; // Yazı içerisinde (baş ve son hariç) en fazla çıkacak reklam sayısı
  
  // İçerik blok sayısını baz alarak reklamların kaç blokta bir çıkacağını hesaplıyoruz.
  // Math.max(6, ...) kullanarak, yazı ne kadar kısa olursa olsun reklamların en az 6 blok arayla çıkmasını sağlıyoruz.
  const AD_INTERVAL = Math.max(6, Math.floor(contentBlocks.length / (MAX_IN_CONTENT_ADS + 1))); 

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans pb-24 selection:bg-amber-500/30 overflow-x-hidden relative scroll-smooth">
      <Script id="json-ld-article" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        datePublished: post.created_at,
        author: { '@type': 'Organization', name: 'RüyaYorumcum AI' }
      }) }} />

      {/* Arkaplan Efektleri */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay z-0" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* Header Geri Dön */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-32 relative z-20">
         <Link href="/blog" className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors text-xs font-bold uppercase tracking-widest mb-8">
            <ArrowLeft className="w-4 h-4" /> Geri Dön
         </Link>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
        
        {/* ================= SOL SÜTUN ================= */}
        <article className="col-span-1 lg:col-span-8 order-1">
            <header className="bg-[#131722] border border-white/5 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden mb-12">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <span className="px-3 py-1 rounded-lg bg-amber-500 text-[#0B0F19] font-bold uppercase tracking-widest text-[10px]">Rehber</span>
                        <span className="flex items-center gap-2 text-sm text-slate-400 font-medium tracking-wide">
                            <Calendar className="w-4 h-4 text-amber-500" /> {new Date(post.created_at).toLocaleDateString('tr-TR')}
                        </span>
                        <span className="flex items-center gap-2 text-sm text-slate-400 font-medium tracking-wide">
                            <Clock className="w-4 h-4 text-amber-500" /> {readTime} dk okuma
                        </span>
                    </div>
                    <h1 className="font-serif text-3xl md:text-5xl font-bold text-white mb-8 leading-[1.1] tracking-tight">{post.title}</h1>
                    <div className="border-l-4 border-amber-500/50 pl-6">
                        <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed italic">{post.excerpt}</p>
                    </div>
                </div>
            </header>

            {/* 1. REKLAM: Yazı Başı (Sabit) */}
            <div className="w-full mb-12">
               <p className="text-center text-[10px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu İçerik</p>
               <AdUnit slot="4542150009" format="fluid" />
            </div>

            {/* İçerik Blokları ve Dinamik Yazı İçi Reklamlar */}
            <div className="space-y-2">
                {contentBlocks.map((block, index) => {
                    const blockNumber = index + 1;
                    
                    // Reklam Şartları:
                    // 1. O anki blok numarası AD_INTERVAL'ın katı mı? (Örn: 6, 12, 18. bloklar)
                    const isAdInterval = blockNumber % AD_INTERVAL === 0;
                    // 2. Maksimum reklam limitini aştık mı?
                    const isUnderLimit = (blockNumber / AD_INTERVAL) <= MAX_IN_CONTENT_ADS;
                    // 3. Yazının son 2 bloğuna reklam koyma (okumaya devam et kısmına girmesin)
                    const isNotLastBlock = index < contentBlocks.length - 2;

                    const shouldShowAd = isAdInterval && isUnderLimit && isNotLastBlock;

                    return (
                        <div key={index}>
                            <BlockRenderer block={block} />
                            
                            {shouldShowAd && (
                                <div className="py-10 w-full border-y border-white/5 my-10 bg-white/[0.01]">
                                    <p className="text-center text-[10px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu</p>
                                    <AdUnit slot="4542150009" format="fluid" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {/* Yazı Sonu İçerik Bölümü */}
            {relatedPosts && relatedPosts.length > 0 && (
              <section className="mt-16 pt-12 border-t border-white/5">
                  <div className="flex items-center justify-between mb-8">
                      <h3 className="font-serif text-2xl font-bold text-white">Okumaya Devam Et</h3>
                      <Link href="/blog" className="text-amber-500 hover:text-amber-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-1.5 transition-all">
                          Tüm Blog <ArrowRight className="w-4 h-4" />
                      </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                      {relatedPosts.map((rPost) => (
                          <Link key={rPost.slug} href={`/blog/${rPost.slug}`} className="group block h-full">
                              <article className="h-full bg-[#131722] border border-white/5 rounded-[1.5rem] p-6 hover:border-amber-500/30 transition-all flex flex-col relative overflow-hidden shadow-lg">
                                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-3 font-medium uppercase tracking-widest">
                                      <Calendar className="w-3 h-3 text-amber-500" /> {new Date(rPost.created_at).toLocaleDateString('tr-TR')}
                                  </div>
                                  <h4 className="font-serif text-base font-bold text-white mb-3 group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">{rPost.title}</h4>
                                  <p className="text-slate-400 text-[13px] font-light leading-relaxed line-clamp-2 mb-6">{rPost.excerpt}</p>
                                  <div className="mt-auto pt-4 border-t border-white/5">
                                      <span className="text-[10px] font-bold text-slate-300 group-hover:text-amber-500 transition-colors uppercase tracking-wider flex items-center gap-1">Okumaya Başla <ArrowRight className="w-3 h-3" /></span>
                                  </div>
                              </article>
                          </Link>
                      ))}
                  </div>

                  {/* SON REKLAM: Multiplex (Önerilen İçerikler) */}
                  <div className="w-full pt-8 border-t border-white/5">
                    <p className="text-center text-[10px] text-slate-600 mb-4 uppercase tracking-widest font-bold">İlginizi Çekebilecek Diğer Konular</p>
                    <AdUnit slot="6481917633" format="autorelaxed" />
                  </div>
              </section>
            )}
        </article>

        {/* ================= SAĞ SÜTUN (Sidebar) ================= */}
        <aside className="col-span-1 lg:col-span-4 order-2">
            <div className="sticky top-24 space-y-6">
               <BlogSidebarCTA />
               
               {/* Sidebar Reklamı */}
               <div className="bg-[#131722] border border-white/5 rounded-[2rem] p-5 text-center shadow-xl">
                  <p className="text-[10px] text-slate-600 mb-3 uppercase tracking-widest font-bold">Sponsorlu</p>
                  <AdUnit slot="8565155493" format="rectangle" />
               </div>
            </div>
        </aside>
      </main>
    </div>
  );
}