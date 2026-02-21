import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import { 
  ArrowLeft, Calendar, Clock, Star, Flame, Mountain, 
  Wind, Droplets, ChevronRight, Crown, ArrowRight
} from "lucide-react";
import type { Metadata } from "next";
import AdUnit from "@/components/AdUnit"; 

// --- TEMA VE İKON EŞLEŞTİRMELERİ (Arayüz Bileşenleri) ---
const ICONS = {
  fire: Flame,
  earth: Mountain,
  air: Wind,
  water: Droplets,
  default: Star
};

const THEME_STYLES = {
  orange: { text: 'text-orange-400', bg: 'bg-orange-500', glow: 'from-orange-500/10', border: 'border-orange-500/30', lightBg: 'bg-orange-500/10', marker: 'bg-orange-500' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500', glow: 'from-emerald-500/10', border: 'border-emerald-500/30', lightBg: 'bg-emerald-500/10', marker: 'bg-emerald-500' },
  sky: { text: 'text-sky-400', bg: 'bg-sky-500', glow: 'from-sky-500/10', border: 'border-sky-500/30', lightBg: 'bg-sky-500/10', marker: 'bg-sky-500' },
  indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500', glow: 'from-indigo-500/10', border: 'border-indigo-500/30', lightBg: 'bg-indigo-500/10', marker: 'bg-indigo-500' },
};

// --- İÇERİK AYRIŞTIRICI (Blog Mantığı) ---
type ContentBlock = 
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; title?: string; text: string }
  | { type: 'list'; items: string[] };

const parseContent = (content: any): ContentBlock[] => {
  try {
    if (typeof content === 'string') return JSON.parse(content);
    return content as ContentBlock[];
  } catch (e) {
    return [{ type: 'paragraph', text: 'İçerik yüklenirken bir sorun oluştu.' }];
  }
};

// --- METADATA (SEO) ---
export async function generateMetadata({ params }: { params: { slug: string, post_slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: post } = await supabase.from('horoscope_posts').select('*').eq('slug', params.post_slug).single();
  
  if (!post) return { title: 'Yorum Bulunamadı' };

  return {
    title: `${post.title} | Rüya Yorumcum AI`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `https://www.ruyayorumcum.com.tr/burclar/${params.slug}/${params.post_slug}`,
    }
  };
}

// --- ANA BİLEŞEN ---
export default async function HoroscopeDetailPage({ params }: { params: { slug: string, post_slug: string } }) {
  const supabase = createClient();
  
  // 1. Asıl İçeriği Çek (Yazı)
  const { data: post } = await supabase.from('horoscope_posts').select('*').eq('slug', params.post_slug).single();
  if (!post) return notFound();

  // 2. Burcun Sabit Bilgilerini Çek (Koç, Boğa vb. İkon ve Teması için)
  const signId = params.slug.toLowerCase();
  const { data: signData } = await supabase.from('zodiac_details').select('*').eq('slug', signId).single();
  if (!signData) return notFound();

  // 3. Aynı Burcun Diğer Güncel Yorumlarını Çek (Sidebar İçin)
  const { data: relatedPosts } = await supabase
    .from('horoscope_posts')
    .select('title, slug, target_date, period')
    .eq('sign', signId)
    .neq('id', post.id)
    .eq('is_published', true)
    .order('target_date', { ascending: false })
    .limit(4);

  // Tema ve İkon Atamaları (Dinamik)
  const theme = THEME_STYLES[signData.theme as keyof typeof THEME_STYLES] || THEME_STYLES.sky;
  
  const elementStr = signData.element.toLowerCase();
  let iconKey = 'default';
  if(elementStr.includes('ateş') || elementStr.includes('fire')) iconKey = 'fire';
  else if(elementStr.includes('toprak') || elementStr.includes('earth')) iconKey = 'earth';
  else if(elementStr.includes('hava') || elementStr.includes('air')) iconKey = 'air';
  else if(elementStr.includes('su') || elementStr.includes('water')) iconKey = 'water';
  
  const ElementIcon = ICONS[iconKey as keyof typeof ICONS];

  const contentBlocks = parseContent(post.content);
  const wordCount = JSON.stringify(contentBlocks).split(' ').length;
  const readTime = Math.ceil(wordCount / 200) || 1; 

  // --- REKLAM MATEMATİĞİ ---
  const MAX_IN_CONTENT_ADS = 2; // İçerik arası maks reklam
  const AD_INTERVAL = Math.max(4, Math.floor(contentBlocks.length / (MAX_IN_CONTENT_ADS + 1))); 

  // Dönem formatlaması (Günlük -> Bugün)
  const periodLabel = post.period === 'daily' ? 'Günlük' : post.period === 'weekly' ? 'Haftalık' : post.period === 'monthly' ? 'Aylık' : 'Yıllık';

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans pb-24 selection:bg-amber-500/30 overflow-x-hidden relative scroll-smooth">
      
      {/* JSON-LD Schema */}
      <Script id="json-ld-article" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        datePublished: post.created_at,
        author: { '@type': 'Organization', name: 'RüyaYorumcum AI' }
      }) }} />

      {/* Arkaplan Efektleri (Dinamik Tema) */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay z-0" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${theme.glow} via-transparent to-transparent rounded-full blur-[150px] pointer-events-none z-0`}></div>

      {/* --- BREADCRUMB (SEO & UX Navigasyonu) --- */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-32 relative z-20">
         <nav className="flex items-center flex-wrap gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-8">
            <Link href="/burclar" className="hover:text-white transition-colors">Tüm Burçlar</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/burclar/${signId}`} className={`hover:${theme.text} transition-colors`}>{signData.name}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className={`${theme.text}`}>{periodLabel} Yorum</span>
         </nav>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
        
        {/* ================= SOL SÜTUN (YAZI İÇERİĞİ) ================= */}
        <article className="col-span-1 lg:col-span-8 order-1">
            
            {/* HERO KARTI */}
            <header className="bg-[#131722] border border-white/5 rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden mb-12">
                <div className={`absolute top-0 right-0 w-80 h-80 ${theme.lightBg} rounded-full blur-[100px] pointer-events-none opacity-50`}></div>
                <div className="relative z-10">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className={`px-3 py-1 rounded-lg ${theme.bg} text-[#0B0F19] font-bold uppercase tracking-widest text-[10px]`}>
                            {periodLabel} Yorum
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-slate-400 font-medium tracking-wide">
                            <Calendar className={`w-4 h-4 ${theme.text}`} /> 
                            {new Date(post.target_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-slate-400 font-medium tracking-wide">
                            <Clock className={`w-4 h-4 ${theme.text}`} /> {readTime} dk okuma
                        </span>
                    </div>
                    
                    <h1 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6 leading-[1.2] tracking-tight">
                        {post.title}
                    </h1>
                    
                    <div className={`border-l-4 ${theme.border} pl-5`}>
                        <p className="text-base md:text-lg text-slate-300 font-light leading-relaxed italic">
                            {post.excerpt}
                        </p>
                    </div>
                </div>
            </header>

            {/* 1. REKLAM (Yazı Başı) */}
            <div className="w-full mb-10">
               <p className="text-center text-[10px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu İçerik</p>
               <AdUnit slot="4542150009" format="fluid" />
            </div>

            {/* İÇERİK BLOKLARI VE DİNAMİK REKLAM */}
            <div className="space-y-4">
                {contentBlocks.map((block, index) => {
                    const blockNumber = index + 1;
                    const isAdInterval = blockNumber % AD_INTERVAL === 0;
                    const isUnderLimit = (blockNumber / AD_INTERVAL) <= MAX_IN_CONTENT_ADS;
                    const isNotLastBlock = index < contentBlocks.length - 2;
                    const shouldShowAd = isAdInterval && isUnderLimit && isNotLastBlock;

                    return (
                        <div key={index}>
                            {/* Block Renderer */}
                            {block.type === 'heading' && (
                                <h2 className="text-xl md:text-2xl font-serif font-bold text-white pt-6 border-b border-white/5 pb-3 mt-6 mb-5 tracking-tight flex items-center gap-3">
                                   <span className={`w-2 h-2 rounded-full ${theme.marker}`}></span> {block.text}
                                </h2>
                            )}
                            {block.type === 'paragraph' && (
                                <p className="text-base md:text-[17px] text-slate-300 font-light leading-relaxed md:leading-[1.8] mb-6 antialiased" dangerouslySetInnerHTML={{ __html: block.text }} />
                            )}
                            {block.type === 'quote' && (
                                <div className={`my-10 p-6 md:p-8 rounded-3xl ${theme.lightBg} border ${theme.border} relative overflow-hidden`}>
                                   <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.bg}`}></div>
                                   {block.title && <h3 className={`${theme.text} font-bold text-[10px] uppercase tracking-[0.2em] mb-3 pl-2`}>{block.title}</h3>}
                                   <p className="text-white text-lg font-serif italic leading-relaxed pl-2">"{block.text}"</p>
                                </div>
                            )}
                            {block.type === 'list' && (
                                <ul className="space-y-3 my-8 p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                                    {block.items.map((li, i) => (
                                       <li key={i} className="flex items-start gap-3 text-slate-300 text-sm md:text-base leading-relaxed group">
                                          <div className={`mt-2 w-1.5 h-1.5 rounded-full ${theme.marker} shrink-0`}></div>
                                          <span dangerouslySetInnerHTML={{ __html: li }} />
                                       </li>
                                    ))}
                                </ul>
                            )}
                            
                            {/* Yazı İçi Dinamik Reklam */}
                            {shouldShowAd && (
                                <div className="py-8 w-full border-y border-white/5 my-10 bg-white/[0.01]">
                                    <p className="text-center text-[10px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu</p>
                                    <AdUnit slot="4542150009" format="fluid" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {/* MULTIPLEX REKLAM (Makale Sonu) */}
            <div className="w-full pt-12 mt-12 border-t border-white/5">
              <p className="text-center text-[10px] text-slate-600 mb-4 uppercase tracking-widest font-bold">İlginizi Çekebilecek Diğer Konular</p>
              <AdUnit slot="6481917633" format="autorelaxed" />
            </div>
        </article>

        {/* ================= SAĞ SÜTUN (SIDEBAR) ================= */}
        <aside className="col-span-1 lg:col-span-4 order-2">
            <div className="sticky top-24 space-y-6">
               
               {/* 1. MİNİ BURÇ KARTI (Veritabanından Çekilen Sabit Bilgi İle) */}
               <Link href={`/burclar/${signId}`} className={`block bg-[#131722] border border-white/5 hover:${theme.border} rounded-[2rem] p-6 shadow-xl transition-colors group`}>
                  <div className="flex items-center gap-4 mb-4">
                     <div className={`w-14 h-14 rounded-2xl bg-[#0a0c10] border ${theme.border} flex items-center justify-center text-3xl font-serif text-white`}>
                        {signData.symbol}
                     </div>
                     <div>
                        <h3 className="text-lg font-serif font-bold text-white group-hover:text-white transition-colors">{signData.name} Burcu</h3>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">{signData.dates}</div>
                     </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                     <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${theme.text}`}>
                        <ElementIcon className="w-3.5 h-3.5" /> {signData.element}
                     </span>
                     <span className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors">Yorumlara Dön <ArrowRight className="inline w-3 h-3" /></span>
                  </div>
               </Link>

               {/* 2. DİĞER GÜNCEL YORUMLAR (Aynı Burç İçin) */}
               {relatedPosts && relatedPosts.length > 0 && (
                   <div className="bg-[#131722] border border-white/5 rounded-[2rem] p-6 shadow-xl">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5 border-b border-white/5 pb-4 flex items-center gap-2">
                         <Clock className="w-4 h-4 text-slate-400" /> Diğer Yorumlar
                      </h3>
                      <ul className="space-y-4">
                          {relatedPosts.map((rPost) => (
                             <li key={rPost.slug}>
                                <Link href={`/burclar/${signId}/${rPost.slug}`} className="group block">
                                   <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                      <Calendar className="w-3 h-3" /> {new Date(rPost.target_date).toLocaleDateString('tr-TR')}
                                      <span className="bg-[#0a0c10] px-1.5 py-0.5 rounded ml-auto">
                                        {rPost.period === 'daily' ? 'Günlük' : rPost.period === 'weekly' ? 'Haftalık' : rPost.period === 'monthly' ? 'Aylık' : 'Yıllık'}
                                      </span>
                                   </div>
                                   <h4 className="text-sm font-medium text-slate-300 group-hover:text-white leading-snug transition-colors line-clamp-2">
                                      {rPost.title}
                                   </h4>
                                </Link>
                             </li>
                          ))}
                      </ul>
                   </div>
               )}

               {/* 3. PREMIUM CTA (Tam Harita) */}
               <div className={`w-full bg-gradient-to-br from-[#131722] to-[#0a0c10] border ${theme.border} rounded-[2rem] p-6 relative overflow-hidden shadow-xl group`}>
                   <div className={`absolute top-0 right-0 w-full h-full bg-gradient-to-bl ${theme.glow} to-transparent pointer-events-none opacity-30`}></div>
                   <div className="relative z-10">
                       <div className={`inline-flex items-center gap-2 mb-3 px-2.5 py-1 ${theme.lightBg} border border-white/5 rounded text-white text-[9px] font-bold uppercase tracking-widest`}>
                           <Crown className={`w-3 h-3 ${theme.text}`} /> Derin Astroloji
                       </div>
                       <h3 className="font-serif text-xl font-bold text-white mb-2 leading-tight">Yükseleniniz Nedir?</h3>
                       <p className="text-xs text-slate-400 font-light leading-relaxed mb-5">
                           Günlük yorumları okurken olayların tam haritasını görmek için Yükselen burcunuzu bilmeniz gerekir.
                       </p>
                       <Link href="/dashboard/astroloji" className={`flex items-center justify-center gap-2 w-full py-3 ${theme.bg} text-[#0a0c10] rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all hover:opacity-90 shadow-lg active:scale-95`}>
                           Haritanı Çıkar <ArrowRight className="w-3 h-3" />
                       </Link>
                   </div>
               </div>
               
               {/* 4. SIDEBAR REKLAMI */}
               <div className="bg-[#131722] border border-white/5 rounded-[2rem] p-4 text-center shadow-xl">
                  <p className="text-[9px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu</p>
                  <AdUnit slot="8565155493" format="rectangle" />
               </div>

            </div>
        </aside>

      </main>
    </div>
  );
}