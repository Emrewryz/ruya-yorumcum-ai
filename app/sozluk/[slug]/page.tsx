import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { 
  ArrowLeft, BookOpen, Brain, 
  ChevronRight, Sparkles, GitGraph, 
  Quote, BrainCircuit, List, ArrowRight,
  HelpCircle // YENİ: FAQ ikonu eklendi
} from "lucide-react";
import type { Metadata } from 'next';
import { cache } from 'react';
import Script from 'next/script';
import AdUnit from "@/components/AdUnit"; 

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
  // YENİ: Sıkça Sorulan Sorular alanı eklendi
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

// --- YARDIMCI FONKSİYONLAR ---
const formatTerm = (term: string) => {
  if (!term) return "";
  let clean = term.replace(/^rüyada\s+/i, '').replace(/\s+görmek$/i, '');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
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

// --- METADATA ---
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = await getDreamData(params.slug);
  if (!item) return { title: 'Rüya Tabiri Bulunamadı' };
  const cleanTerm = formatTerm(item.term);

  return {
    title: `Rüyada ${cleanTerm} Görmek - İslami ve Psikolojik Yorumu`,
    description: item.description.substring(0, 160),
  };
}

// --- ESKİ RENDERER ---
const LegacyRenderer = ({ blocks }: { blocks: LegacyBlock[] }) => (
  <div className="space-y-4 text-slate-300 leading-relaxed font-light text-sm md:text-base">
    {blocks.map((block, i) => (
      <div key={i}>{block.text}</div>
    ))}
  </div>
);

// --- ANA COMPONENT ---
export default async function Page({ params }: { params: { slug: string } }) {
  const item = await getDreamData(params.slug);
  const supabase = createClient();

  if (!item) return <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">İçerik bulunamadı.</div>;

  const [relatedDreams] = await Promise.all([
    getRelatedDreams(item.keywords, item.id),
    supabase.rpc('increment_search_count', { row_id: item.id })
  ]);

  const cleanTitle = formatTerm(item.term);
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

  // YENİ: JSON-LD Dinamik Schema Array Yapısı
  const schemas: any[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: `Rüyada ${cleanTitle} Görmek`,
      description: item.description,
      author: { '@type': 'Organization', name: 'RüyaYorumcum' },
    }
  ];

  // Eğer içerikte FAQ varsa FAQPage şemasını da ekle
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
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans pb-20 selection:bg-amber-500/30 relative scroll-smooth">
      {/* Schema basımı array olarak güncellendi */}
      <Script id="json-ld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      
      {/* Noise Texture */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay z-0" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      {/* Geri Butonu (En Üstte, Genel) */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-32 relative z-20">
         <Link href="/sozluk" className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors text-xs font-bold uppercase tracking-widest pl-2">
            <ArrowLeft className="w-4 h-4" /> Sözlüğe Dön
         </Link>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* ================= SOL İÇERİK (lg:col-span-8) - ANA YAZI ALANI ================= */}
        <article className="col-span-1 lg:col-span-8 order-1 space-y-8">
            
            {/* 1. HERO KUTUSU */}
            <div className="bg-[#131722] border border-white/5 rounded-[1.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10">
                   <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-6 border border-amber-500/20">
                      {item.category || 'RÜYA TABİRİ'}
                   </div>
                   
                   <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
                      Rüyada <span className="text-amber-500">{cleanTitle}</span> Görmek
                   </h1>
                   
                   <div className="border-l-2 border-amber-500/50 pl-4 md:pl-5">
                      <p className="text-base md:text-lg text-slate-300 font-light leading-relaxed">
                         {isUltimate ? ultimateData!.summary : item.description}
                      </p>
                   </div>
                </div>
            </div>

            {/* Reklam (Yazı İçi) */}
            <div className="w-full">
               <p className="text-center text-[9px] text-slate-600 mb-2 uppercase tracking-widest">Sponsorlu</p>
               <AdUnit slot="4542150009" format="fluid" />
            </div>

            {/* İÇERİK DETAYLARI */}
            {isUltimate && ultimateData ? (
               <div className="space-y-8">
                  
                  {/* --- İslami Tabir --- */}
                  <section className="bg-[#131722] border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                      
                      <div className="flex items-center gap-4 mb-6">
                         <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-emerald-400"/>
                         </div>
                         <h2 className="text-xl font-serif font-bold text-white">İslami Tabir</h2>
                      </div>
                      
                      <div className="space-y-5 pl-1">
                        {ultimateData.islamic.map((src, i) => (
                          <div key={i} className="flex gap-4 items-start">
                              <div className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500/50 shrink-0"></div>
                              <div>
                                 <p className="text-slate-300 font-light leading-relaxed mb-2 text-sm md:text-base">
                                     "{src.text}"
                                 </p>
                                 <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block">
                                     — {src.source}
                                 </span>
                              </div>
                          </div>
                        ))}
                      </div>
                  </section>

                  {/* --- REKLAM (İslami ve Psikolojik Arası) --- */}
                  <div className="w-full py-2">
                     <p className="text-center text-[9px] text-slate-600 mb-2 uppercase tracking-widest">Sponsorlu</p>
                     <AdUnit slot="4542150009" format="fluid" />
                  </div>

                  {/* --- Psikolojik Analiz --- */}
                  <section className="bg-[#131722] border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                      
                      <div className="flex items-center gap-4 mb-6">
                         <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <Brain className="w-5 h-5 text-indigo-400"/>
                         </div>
                         <h2 className="text-xl font-serif font-bold text-white">Psikolojik Analiz</h2>
                      </div>

                      <div className="pl-1">
                          <p className="text-slate-300 font-light leading-relaxed mb-5 text-sm md:text-base">
                              {ultimateData.psychological}
                          </p>
                          <div className="flex flex-wrap gap-2">
                              <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-indigo-300 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                 <Sparkles className="w-3 h-3"/> Bilinçaltı
                              </span>
                              <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-indigo-300 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                 <GitGraph className="w-3 h-3"/> Sembolizm
                              </span>
                          </div>
                      </div>
                  </section>

                  {/* --- Senaryolar --- */}
                  <section>
                     <h2 className="text-xl font-serif font-bold text-white mb-5 pl-1">
                        Detaylı Durum Analizleri
                     </h2>
                     <div className="space-y-3">
                        {ultimateData.scenarios.map((scene, i) => {
                           const hasLink = scene.slug ? validSlugs.includes(scene.slug) : false;
                           
                           const CardContent = (
                              <>
                                 {hasLink && <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-[30px] group-hover:bg-amber-500/10 transition-colors pointer-events-none"></div>}

                                 <div className="flex-1 pr-4 relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                       <div className={`w-2 h-2 rounded-full ${scene.isPositive ? 'bg-emerald-500' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}></div>
                                       <h3 className={`text-base font-bold transition-colors ${hasLink ? 'text-white group-hover:text-amber-400' : 'text-white'}`}>
                                          {scene.title}
                                       </h3>
                                    </div>
                                    <p className="text-slate-400 text-sm leading-relaxed font-light pl-4">
                                       {scene.description}
                                    </p>
                                 </div>
                                 
                                 {hasLink && (
                                    <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-white/5 group-hover:bg-amber-500 text-slate-400 group-hover:text-[#0B0F19] transition-all ml-4 md:ml-0 relative z-10 shadow-md">
                                       <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                 )}
                              </>
                           );

                           const baseClasses = "relative scroll-mt-24 bg-[#131722] border rounded-2xl p-5 md:p-6 flex flex-col md:flex-row gap-4 md:items-center justify-between group transition-colors overflow-hidden";

                           if (hasLink) {
                              return (
                                 <Link 
                                    key={i} 
                                    id={`senaryo-${i}`} 
                                    href={`/sozluk/${scene.slug}`}
                                    className={`${baseClasses} border-white/5 cursor-pointer hover:border-amber-500/50 hover:bg-[#1a1f2e]`}
                                 >
                                    {CardContent}
                                 </Link>
                              );
                           }

                           return (
                              <div 
                                 key={i} 
                                 id={`senaryo-${i}`} 
                                 className={`${baseClasses} border-white/5`}
                              >
                                 {CardContent}
                              </div>
                           );

                        })}
                     </div>
                  </section>

                  {/* --- YENİ: FAQ BÖLÜMÜ --- */}
                  {ultimateData.faq && ultimateData.faq.length > 0 && (
                     <section className="bg-[#131722] border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl mt-8">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                        
                        <div className="flex items-center gap-4 mb-6">
                           <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                              <HelpCircle className="w-5 h-5 text-amber-400"/>
                           </div>
                           <h2 className="text-xl font-serif font-bold text-white">Sıkça Sorulan Sorular</h2>
                        </div>

                        <div className="space-y-4 pl-1">
                           {ultimateData.faq.map((faqItem, i) => (
                              <details 
                                 key={i} 
                                 className="group bg-white/5 border border-white/5 rounded-2xl open:bg-white/[0.07] transition-all duration-300"
                              >
                                 <summary className="cursor-pointer p-4 md:p-5 font-medium text-slate-200 group-open:text-amber-400 transition-colors flex items-center justify-between list-none">
                                    <span>{faqItem.question}</span>
                                    <ChevronRight className="w-4 h-4 transition-transform duration-300 group-open:rotate-90 text-slate-500" />
                                 </summary>
                                 <div className="p-4 md:p-5 pt-0 text-slate-400 font-light text-sm md:text-base leading-relaxed border-t border-white/5 mt-2">
                                    {faqItem.answer}
                                 </div>
                              </details>
                           ))}
                        </div>
                     </section>
                  )}

               </div>
            ) : (
               <div className="bg-[#131722] p-6 rounded-2xl border border-white/5">
                  <LegacyRenderer blocks={contentData as LegacyBlock[]} />
               </div>
            )}

            {/* --- REKLAM (MULTIPLEX - Alt Kısım) --- */}
            <div className="pt-6 border-t border-white/5">
               <p className="text-center text-[9px] text-slate-600 mb-3 uppercase tracking-widest font-medium">İlginizi Çekebilir</p>
               <AdUnit slot="6481917633" format="autorelaxed" />
            </div>

        </article>

        {/* ================= SAĞ SIDEBAR (lg:col-span-4) - YARDIMCI ARAÇLAR ================= */}
        <aside className="col-span-1 lg:col-span-4 order-2">
           <div className="sticky top-24 space-y-6">
              
              {/* 1. YENİ KUTU: Premium CTA */}
              <div className="bg-gradient-to-br from-amber-500/10 to-[#131722] border border-amber-500/20 rounded-2xl p-5 md:p-6 relative overflow-hidden group shadow-lg">
                  <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                     <BrainCircuit className="w-24 h-24 text-amber-500" />
                  </div>
                  <div className="relative z-10 space-y-3">
                     <h3 className="text-amber-400 font-serif font-bold text-lg">Rüyanız Size Özeldir</h3>
                     <p className="text-xs text-slate-300 font-light leading-relaxed">
                        Sözlükteki genel tabirler yerine, rüyanızın tüm detaylarını yapay zekaya anlatın. Size özel, 3 boyutlu psikolojik analizinizi anında hazırlayalım.
                     </p>
                     <Link href="/dashboard" className="w-full py-3 bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0B0F19] rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition-colors flex items-center justify-center gap-2 mt-2">
                        <Sparkles className="w-3 h-3" /> Özel Analiz Yaptır
                     </Link>
                  </div>
              </div>

              {/* 2. İÇİNDEKİLER */}
              {isUltimate && ultimateData && ultimateData.scenarios.length > 0 && (
                  <div className="bg-[#131722] border border-white/5 rounded-2xl p-5 shadow-lg">
                      <h3 className="text-amber-500 font-bold text-[9px] uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
                          <List className="w-3 h-3" /> 
                          Bu Rüyanın Diğer Halleri
                      </h3>
                      
                      <ul className="space-y-1">
                          {ultimateData.scenarios.map((scene, i) => {
                             const hasLink = scene.slug ? validSlugs.includes(scene.slug) : false;
                             const hrefTarget = hasLink ? `/sozluk/${scene.slug}` : `#senaryo-${i}`;
                             
                             return (
                                <li key={i}>
                                  <Link 
                                    href={hrefTarget} 
                                    className="group flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-all duration-300"
                                  >
                                      <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-amber-500 shrink-0 mt-0.5 transition-colors" />
                                      <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
                                          {scene.title}
                                      </span>
                                  </Link>
                                </li>
                             )
                          })}
                      </ul>
                  </div>
              )}

              {/* 3. BENZER RÜYALAR */}
              {relatedDreams.length > 0 && (
                  <div className="bg-[#131722] border border-white/5 rounded-2xl p-5 shadow-lg">
                      <h3 className="text-amber-500 font-bold text-[9px] uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
                          <GitGraph className="w-3 h-3" /> 
                          Benzer Rüyalar
                      </h3>
                      
                      <ul className="space-y-1.5">
                          {relatedDreams.slice(0, 5).map((related) => (
                              <li key={related.slug}>
                                <Link 
                                  href={`/sozluk/${related.slug}`} 
                                  className="group flex flex-col p-2.5 rounded-lg hover:bg-white/5 transition-all duration-300"
                                >
                                      <div className="flex items-center justify-between">
                                          <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-400 truncate pr-2">
                                              {formatTerm(related.term)}
                                          </h4>
                                      </div>
                                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 font-light">
                                          {related.description}
                                      </p>
                                </Link>
                              </li>
                          ))}
                      </ul>
                  </div>
              )}

              {/* 4. REKLAM ALANI (Sağ Sütun) */}
              <div className="bg-[#131722] border border-white/5 rounded-2xl p-3 text-center shadow-lg">
                  <p className="text-[9px] text-slate-600 mb-2 uppercase tracking-widest">Sponsorlu</p>
                  <AdUnit slot="8565155493" format="rectangle" />
              </div>

           </div>
        </aside>

      </main>
    </div>
  );
}