import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { 
  ArrowLeft, BookOpen, Brain, 
  ChevronRight, Sparkles, GitGraph, 
  BrainCircuit, List, ArrowRight,
  HelpCircle, Clock, Home, CheckCircle2
} from "lucide-react";
import type { Metadata } from 'next';
import { cache } from 'react';
import Script from 'next/script';

// --- TİP TANIMLAMALARI ---
interface UltimateDreamData {
  type: 'ultimate';
  summary: string;
  islamic: { source: string; text: string }[];
  psychological: string;
  scenarios: { 
    title: string; 
    description: string; 
    isPositive: boolean;
    slug?: string;
  }[];
  faq?: { question: string; answer: string }[]; 
}

interface CategoryDream {
  slug: string;
  term: string;
  search_count: number;
}

interface RelatedDream {
  slug: string;
  term: string;
  description: string;
  first_letter: string;
}

interface LegacyBlock {
  type: 'heading' | 'paragraph' | 'quote' | 'list';
  text?: string;
  title?: string;
  items?: string[];
}

// --- VERİ ÇEKME FONKSİYONLARI ---
const getDreamData = cache(async (slug: string) => {
  const supabase = createClient();
  const { data: item } = await supabase
    .from('dream_dictionary')
    .select('*')
    .eq('slug', slug)
    .single();
  return item;
});

const getRelatedDreams = async (keywords: string[] | null, currentId: string): Promise<RelatedDream[]> => {
  if (!keywords || keywords.length === 0) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .rpc('get_related_dreams_by_keywords', { 
      target_keywords: keywords, 
      current_id: currentId 
    });
  if (error) console.error("Keyword Hatası:", error);
  return (data as RelatedDream[]) || [];
};

const getLatestDreams = cache(async (): Promise<RelatedDream[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('dream_dictionary')
    .select('slug, term, description, first_letter')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) console.error("Son Rüyalar Hatası:", error);
  return (data as RelatedDream[]) || [];
});

const getValidSlugs = async (slugsToCheck: string[]) => {
  if (!slugsToCheck || slugsToCheck.length === 0) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from('dream_dictionary')
    .select('slug')
    .in('slug', slugsToCheck); 
  return data ? data.map(d => d.slug) : [];
};

const parseContent = (rawContent: string | null): UltimateDreamData | LegacyBlock[] => {
  if (!rawContent) return [];
  try {
    const parsed = JSON.parse(rawContent);
    if (!Array.isArray(parsed) && parsed.type === 'ultimate') {
      return parsed as UltimateDreamData;
    }
    return parsed as LegacyBlock[];
  } catch (e) {
    return [{ type: 'paragraph', text: rawContent }] as LegacyBlock[];
  }
};

// --- METADATA (Tamamen Kullanıcının Girdiği Başlığa Sadık) ---
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = await getDreamData(params.slug);
  if (!item) return { title: 'Rüya Tabiri Bulunamadı' };

  return {
    title: `${item.term} - Diyanet ve Psikolojik Yorumu`,
    description: item.description.substring(0, 160),
    openGraph: {
      title: item.term,
      description: item.description.substring(0, 160),
      type: 'article',
    }
  };
}

const LegacyRenderer = ({ blocks }: { blocks: LegacyBlock[] }) => (
  <div className="space-y-4 text-[var(--text-muted)] leading-relaxed font-normal text-base md:text-lg">
    {blocks.map((block, i) => (
      <div key={i}>{block.text}</div>
    ))}
  </div>
);

// --- ANA COMPONENT ---
export default async function Page({ params }: { params: { slug: string } }) {
  const item = await getDreamData(params.slug);
  const supabase = createClient();

  if (!item) return <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex items-center justify-center font-medium">Bu rüya tabiri henüz eklenmemiş veya yayından kaldırılmış olabilir.</div>;

  const [relatedDreams, latestDreams] = await Promise.all([
    getRelatedDreams(item.keywords, item.id),
    getLatestDreams(),
    supabase.rpc('increment_search_count', { row_id: item.id })
  ]);

  const contentData = parseContent(item.content);
  const isUltimate = !Array.isArray(contentData) && (contentData as any).type === 'ultimate';
  const ultimateData = isUltimate ? contentData as UltimateDreamData : null;

  let validSlugs: string[] = [];
  if (isUltimate && ultimateData) {
    const potentialSlugs = ultimateData.scenarios
      .map(s => s.slug)
      .filter((s): s is string => !!s);
    validSlugs = await getValidSlugs(potentialSlugs);
  }

  // Schema.org Yapısal Verileri
  const schemas: any[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: item.term,
      description: item.description,
      author: { '@type': 'Organization', name: 'RüyaYorumcum AI' },
      publisher: { '@type': 'Organization', name: 'RüyaYorumcum AI' },
      datePublished: item.created_at,
    }
  ];

  if (isUltimate && ultimateData?.faq && ultimateData.faq.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: ultimateData.faq.map((q) => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.answer
        }
      }))
    });
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans pb-20 selection:bg-amber-500/30 relative scroll-smooth antialiased">
      <Script id="json-ld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-28 md:pt-32 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* ================= SOL İÇERİK (lg:col-span-8) ================= */}
        <article className="col-span-1 lg:col-span-8 order-1 space-y-8">
            
            {/* Breadcrumb */}
            <nav className="flex items-center text-[var(--text-muted)] text-xs md:text-sm font-medium overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-amber-500 flex items-center gap-1.5 transition-colors">
                <Home className="w-3.5 h-3.5" /> Ana Sayfa
              </Link>
              <ChevronRight className="w-4 h-4 mx-1.5 opacity-50 shrink-0" />
              <Link href="/sozluk" className="hover:text-amber-500 transition-colors">
                Rüya Sözlüğü
              </Link>
              <ChevronRight className="w-4 h-4 mx-1.5 opacity-50 shrink-0" />
              <span className="text-[var(--text-main)] truncate">{item.term}</span>
            </nav>

            {/* HERO KUTUSU (Başlık doğrudan veritabanından alınır) */}
            <header className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[1.5rem] p-6 md:p-10 shadow-lg md:shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 md:w-80 h-64 md:h-80 bg-amber-500/10 rounded-full blur-[80px] md:blur-[100px] pointer-events-none"></div>
                <div className="relative z-10">
                   <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6 border border-amber-500/20">
                      {item.category || 'RÜYA TABİRİ'}
                   </div>
                   <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--text-main)] mb-6 leading-[1.2] md:leading-[1.1] tracking-tight">
                      {item.term}
                   </h1>
                   <div className="border-l-2 border-amber-500/50 pl-4 md:pl-5">
                      {isUltimate && ultimateData ? (
                        <div 
                          className="text-base md:text-lg text-[var(--text-muted)] font-normal leading-relaxed [&>strong]:font-semibold [&>strong]:text-[var(--text-main)] [&>em]:italic [&>a]:text-amber-500 hover:[&>a]:underline transition-all"
                          dangerouslySetInnerHTML={{ __html: ultimateData.summary }}
                        />
                      ) : (
                        <p className="text-base md:text-lg text-[var(--text-muted)] font-normal leading-relaxed">{item.description}</p>
                      )}
                   </div>
                </div>
            </header>

            {isUltimate && ultimateData ? (
               <div className="space-y-8">
                 
                 {/* İslami Tabir */}
                 <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-md md:shadow-xl">
                     <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                     <div className="flex items-center gap-4 mb-6 md:mb-8">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                           <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-emerald-600 dark:text-emerald-400"/>
                        </div>
                        <h2 className="text-xl md:text-2xl font-serif font-bold text-[var(--text-main)]">Dini ve Geleneksel Tabir</h2>
                     </div>
                     <div className="space-y-6 md:space-y-8 pl-1 md:pl-2">
                       {ultimateData.islamic.map((src, i) => (
                         <div key={i} className="flex gap-4 items-start">
                             <div className="mt-2.5 w-2 h-2 rounded-full bg-emerald-500/50 shrink-0"></div>
                             <div>
                                <p className="text-[var(--text-main)] font-normal leading-relaxed mb-2 md:mb-3 text-base md:text-lg">
                                   "{src.text}"
                                </p>
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-widest block">
                                   — Kaynak: {src.source}
                                </span>
                             </div>
                         </div>
                       ))}
                     </div>
                 </section>

                 {/* Psikolojik Analiz */}
                 <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-md md:shadow-xl">
                     <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                     <div className="flex items-center gap-4 mb-6 md:mb-8">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                           <Brain className="w-5 h-5 md:w-6 md:h-6 text-indigo-600 dark:text-indigo-400"/>
                        </div>
                        <h2 className="text-xl md:text-2xl font-serif font-bold text-[var(--text-main)]">Psikolojik ve Modern Analiz</h2>
                     </div>
                     <div className="pl-1 md:pl-2">
                         <div 
                           className="text-[var(--text-muted)] font-normal leading-relaxed mb-6 md:mb-8 text-base md:text-lg [&>strong]:font-semibold [&>strong]:text-[var(--text-main)] [&>em]:italic [&>a]:text-amber-500 hover:[&>a]:underline transition-all"
                           dangerouslySetInnerHTML={{ __html: ultimateData.psychological }}
                         />
                         <div className="flex flex-wrap gap-2 md:gap-3">
                             <span className="px-3 py-1.5 md:px-4 md:py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-indigo-700 dark:text-indigo-300 text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 md:gap-2">
                                <Sparkles className="w-3 h-3 md:w-4 md:h-4"/> Bilinçaltı
                             </span>
                             <span className="px-3 py-1.5 md:px-4 md:py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-indigo-700 dark:text-indigo-300 text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 md:gap-2">
                                <GitGraph className="w-3 h-3 md:w-4 md:h-4"/> Sembolizm
                             </span>
                         </div>
                     </div>
                 </section>

                 {/* Senaryolar - Linkleme Hatası Düzeltildi */}
                 <section>
                     <h2 className="text-xl md:text-2xl font-serif font-bold text-[var(--text-main)] mb-6 md:mb-8 pl-1">
                        Bu Rüyanın Farklı Durum Analizleri
                     </h2>
                     <div className="space-y-4">
                        {ultimateData.scenarios.map((scene, i) => {
                           const hasLink = scene.slug ? validSlugs.includes(scene.slug) : false;
                           
                           return (
                              <div 
                                 key={i} 
                                 id={`senaryo-${i}`} 
                                 className="relative scroll-mt-24 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 md:p-6 flex flex-col transition-all overflow-hidden shadow-sm hover:shadow-md"
                              >
                                 <div className="flex items-center gap-3 mb-2 md:mb-3">
                                    <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full shrink-0 ${scene.isPositive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}></div>
                                   <h3 className="text-base md:text-lg font-bold text-[var(--text-main)]">
   {/* BAŞTAKİ H3: YAZISINI TEMİZLER */}
   {scene.title.replace(/^H3:\s*/i, '')}
</h3>
                                 </div>
                                 <p className="text-[var(--text-muted)] text-sm md:text-base leading-relaxed font-normal pl-5 md:pl-6">
                                    {scene.description}
                                 </p>
                                 
                                 {/* Tıklanabilir Link Sadece Buton Olarak Eklendi */}
                                 {hasLink && (
                                    <Link 
                                       href={`/sozluk/${scene.slug}`}
                                       className="mt-4 ml-5 md:ml-6 inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 text-sm font-semibold transition-colors w-fit"
                                    >
                                       Bu Tabiri Detaylı İncele <ArrowRight className="w-4 h-4" />
                                    </Link>
                                 )}
                              </div>
                           );
                        })}
                     </div>
                 </section>

                 {/* SIKÇA SORULAN SORULAR BÖLÜMÜ */}
                 {ultimateData.faq && ultimateData.faq.length > 0 && (
                     <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-md md:shadow-xl mt-10">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
                        <div className="flex items-center gap-4 mb-6 md:mb-8">
                           <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                              <HelpCircle className="w-5 h-5 md:w-6 md:h-6 text-amber-600 dark:text-amber-400"/>
                           </div>
                           <h2 className="text-xl md:text-2xl font-serif font-bold text-[var(--text-main)]">Sıkça Sorulan Sorular</h2>
                        </div>
                        <div className="space-y-4 md:space-y-5 pl-1 md:pl-2">
                           {ultimateData.faq.map((faqItem, i) => (
                              <details 
                                 key={i} 
                                 className="group bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-2xl open:bg-black/10 dark:open:bg-white/[0.07] transition-all duration-300"
                              >
                                 <summary className="cursor-pointer p-4 md:p-5 font-semibold text-base md:text-lg text-[var(--text-main)] group-open:text-amber-500 transition-colors flex items-center justify-between list-none">
                                    <span className="pr-4">{faqItem.question}</span>
                                    <ChevronRight className="w-5 h-5 transition-transform duration-300 group-open:rotate-90 text-[var(--text-muted)] shrink-0" />
                                 </summary>
                                 <div className="p-4 md:p-5 pt-0 text-[var(--text-muted)] font-normal text-sm md:text-base leading-relaxed border-t border-[var(--border-color)] mt-2">
                                    {faqItem.answer}
                                 </div>
                              </details>
                           ))}
                        </div>
                     </section>
                 )}

                 {/* YAZAR KUTUSU */}
                 <section className="bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-3xl p-6 md:p-8 mt-10 flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-6 shadow-sm">
                     <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
                         <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-amber-600 dark:text-amber-500" />
                     </div>
                     <div>
                         <h4 className="text-[var(--text-main)] font-bold text-lg mb-2">Rüya Yorumcum AI Uzman Sistemi</h4>
                         <p className="text-[var(--text-muted)] text-sm md:text-base font-normal leading-relaxed">
                             Bu sayfa, İslami rüya tabiri kaynakları (İmam Nablusi, İbn-i Şirin vb.) ve modern psikolojik analiz yöntemleri (Jungian sembolizm) kullanılarak hazırlanmıştır. Amacımız, rüya gören kullanıcılara en kapsamlı, güvenilir ve derinlemesine rüya yorumunu sunmaktır.
                         </p>
                     </div>
                 </section>

               </div>
            ) : (
               <div className="bg-[var(--bg-card)] p-6 md:p-8 rounded-3xl border border-[var(--border-color)] shadow-md md:shadow-xl">
                  <LegacyRenderer blocks={contentData as LegacyBlock[]} />
               </div>
            )}
        </article>

        {/* ================= SAĞ SIDEBAR (lg:col-span-4) ================= */}
        <aside className="col-span-1 lg:col-span-4 order-2">
            <div className="sticky top-28 space-y-6 md:space-y-8">
              
              <div className="bg-gradient-to-br from-amber-500/10 to-[var(--bg-card)] border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
                  <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                     <BrainCircuit className="w-28 h-28 text-amber-500" />
                  </div>
                  <div className="relative z-10 space-y-3">
                     <h3 className="text-amber-600 dark:text-amber-400 font-serif font-bold text-xl">Rüyanız Size Özeldir</h3>
                     <p className="text-sm md:text-base text-[var(--text-main)] font-light leading-relaxed mb-2 opacity-90">
                        Sözlükteki genel tabirler yerine, rüyanızın tüm detaylarını yapay zekaya anlatın. Size özel analiz anında hazırlansın.
                     </p>
                     <Link href="/dashboard" className="w-full py-3.5 bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0B0F19] rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 transition-colors flex items-center justify-center gap-2 mt-4">
                        <Sparkles className="w-4 h-4 text-[#0B0F19]" /> Ücretsiz Analiz Yaptır
                     </Link>
                  </div>
              </div>

              {/* İÇİNDEKİLER */}
              {isUltimate && ultimateData && ultimateData.scenarios.length > 0 && (
                  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 md:p-6 shadow-lg">
                      <h3 className="text-amber-600 dark:text-amber-500 font-bold text-xs md:text-sm uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
                          <List className="w-4 h-4" /> 
                          Rüyanın Diğer Halleri
                      </h3>
                      <ul className="space-y-1.5 md:space-y-2">
                          {ultimateData.scenarios.map((scene, i) => {
                             const hasLink = scene.slug ? validSlugs.includes(scene.slug) : false;
                             const hrefTarget = hasLink ? `/sozluk/${scene.slug}` : `#senaryo-${i}`;
                             
                             return (
                                <li key={i}>
                                  <Link 
                                    href={hrefTarget} 
                                    className="group flex items-start gap-3 p-2 md:p-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300"
                                  >
                                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-amber-500 shrink-0 mt-0.5 transition-colors" />
                                      <span className="text-sm md:text-base font-medium text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors line-clamp-2">
                                          {scene.title}
                                      </span>
                                  </Link>
                                </li>
                             )
                          })}
                      </ul>
                  </div>
              )}

              {/* YENİ EKLENEN RÜYALAR (Başlıklar Veritabanından Direkt Okunur) */}
              {latestDreams.length > 0 && (
                  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 md:p-6 shadow-lg">
                      <h3 className="text-emerald-600 dark:text-emerald-500 font-bold text-xs md:text-sm uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
                          <Clock className="w-4 h-4" /> 
                          Yeni Eklenen Tabirler
                      </h3>
                      <ul className="space-y-2">
                          {latestDreams.map((latest) => (
                              <li key={latest.slug}>
                                <Link 
                                  href={`/sozluk/${latest.slug}`} 
                                  className="group flex flex-col p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-[var(--border-color)]"
                                >
                                      <div className="flex items-center justify-between">
                                          <h4 className="text-sm md:text-base font-bold text-[var(--text-main)] group-hover:text-emerald-500 truncate pr-2 transition-colors">
                                              {latest.term}
                                          </h4>
                                      </div>
                                      <p className="text-xs md:text-sm text-[var(--text-muted)] line-clamp-1 mt-1 font-normal">
                                          {latest.description}
                                      </p>
                                </Link>
                              </li>
                          ))}
                      </ul>
                  </div>
              )}

              {/* BENZER RÜYALAR (Başlıklar Veritabanından Direkt Okunur) */}
              {relatedDreams.length > 0 && (
                  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 md:p-6 shadow-lg">
                      <h3 className="text-indigo-600 dark:text-indigo-400 font-bold text-xs md:text-sm uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
                          <GitGraph className="w-4 h-4" /> 
                          İlişkili Rüyalar
                      </h3>
                      <ul className="space-y-2">
                          {relatedDreams.slice(0, 5).map((related) => (
                              <li key={related.slug}>
                                <Link 
                                  href={`/sozluk/${related.slug}`} 
                                  className="group flex flex-col p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-[var(--border-color)]"
                                >
                                      <div className="flex items-center justify-between">
                                          <h4 className="text-sm md:text-base font-bold text-[var(--text-main)] group-hover:text-indigo-500 truncate pr-2 transition-colors">
                                              {related.term}
                                          </h4>
                                      </div>
                                      <p className="text-xs md:text-sm text-[var(--text-muted)] line-clamp-1 mt-1 font-normal">
                                          {related.description}
                                      </p>
                                </Link>
                              </li>
                          ))}
                      </ul>
                  </div>
              )}

            </div>
        </aside>

      </main>
    </div>
  );
}