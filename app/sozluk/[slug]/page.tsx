import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { 
  ArrowLeft, BookOpen, Brain, 
  ChevronRight, Sparkles, Star, 
  GitGraph, LayoutGrid 
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

const getCategoryDreams = async (category: string | null, currentId: string): Promise<CategoryDream[]> => {
  if (!category) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .rpc('get_dreams_by_category', { 
      target_category: category, 
      current_id: currentId 
    });
  if (error) console.error("Kategori Hatası:", error);
  return (data as CategoryDream[]) || [];
};

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
  <div className="space-y-6 text-gray-300">
    {blocks.map((block, i) => (
      <div key={i}>{block.text}</div>
    ))}
  </div>
);

// --- ANA COMPONENT ---
export default async function Page({ params }: { params: { slug: string } }) {
  const item = await getDreamData(params.slug);
  const supabase = createClient();

  if (!item) return <div className="text-white text-center py-20">İçerik bulunamadı.</div>;

  const [categoryDreams, relatedDreams] = await Promise.all([
    getCategoryDreams(item.category, item.id),
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Rüyada ${cleanTitle} Görmek`,
    description: item.description,
    author: { '@type': 'Organization', name: 'RüyaYorumcum' },
  };

  // Kategori Listesi Bileşeni
  const CategoryListComponent = () => (
    <div className="bg-[#0f172a] rounded-2xl border border-white/5 p-5 shadow-xl">
        <h3 className="text-[#fbbf24] font-bold text-xs uppercase tracking-[0.2em] mb-5 flex items-center gap-2 border-b border-white/5 pb-3">
            <LayoutGrid className="w-4 h-4" /> 
            {item.category ? `${item.category.toUpperCase()} RÜYALARI` : 'BENZER RÜYALAR'}
        </h3>
        
        {categoryDreams.length > 0 ? (
            <ul className="space-y-3">
                {categoryDreams.map((dream) => (
                    <li key={dream.slug}>
                      <Link 
                        href={`/sozluk/${dream.slug}`} 
                        className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-[#fbbf24]/30 transition-all duration-300"
                      >
                            <div className="w-8 h-8 rounded-lg bg-[#fbbf24]/10 flex items-center justify-center shrink-0 group-hover:bg-[#fbbf24] transition-colors duration-300">
                                <Star className="w-4 h-4 text-[#fbbf24] group-hover:text-black transition-colors duration-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-200 group-hover:text-white truncate">
                                    {formatTerm(dream.term)}
                                </h4>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-transform group-hover:translate-x-1" />
                      </Link>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-gray-500 text-sm italic">Bu kategoride başka rüya bulunamadı.</p>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans pb-20 pt-24 md:pt-28">
      <Script id="json-ld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* --- SOL SIDEBAR (Sadece Masaüstü) --- */}
        <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-32 space-y-6">
                <Link href="/sozluk" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#fbbf24] transition-colors text-sm font-medium mb-2 pl-1">
                    <ArrowLeft className="w-4 h-4" /> Sözlüğe Dön
                </Link>
                <CategoryListComponent />

                {/* --- 1. REKLAM ALANI: SIDEBAR (DISPLAY - GÖRÜNTÜLÜ) --- */}
                {/* Burası dar alan olduğu için 'Görüntülü Reklam' (8565155493) kullanıyoruz */}
                <div className="mt-4 border border-white/5 rounded-2xl p-2 bg-[#0a0a0a]">
                    <p className="text-[10px] text-center text-gray-600 mb-2 uppercase tracking-widest">- Sponsorlu -</p>
                    <AdUnit slot="8565155493" format="rectangle" />
                </div>
            </div>
        </aside>

        {/* --- ORTA İÇERİK --- */}
        <article className="col-span-1 lg:col-span-9">
           
           {/* MOBİL GERİ BUTONU */}
           <div className="lg:hidden mb-6">
                <Link href="/sozluk" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#fbbf24] text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" /> Sözlüğe Dön
                </Link>
           </div>

           {/* HERO SECTION (BAŞLIK) */}
           <header className="relative p-6 md:p-12 rounded-[1.5rem] md:rounded-[2rem] bg-[#0a0a0a] border border-white/5 overflow-hidden mb-8 md:mb-12 shadow-2xl">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#fbbf24]/10 rounded-full blur-[100px] pointer-events-none"></div>
              <div className="relative z-10">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#fbbf24]/10 text-[#fbbf24] text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] mb-4 md:mb-6">
                      {item.category || 'RÜYA SÖZLÜĞÜ'}
                  </span>
                  <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold text-white mb-6 md:mb-8 leading-tight">
                      Rüyada <span className="text-[#fbbf24]">{cleanTitle}</span> Görmek
                  </h1>
                  <div className="border-l-2 border-[#fbbf24]/50 pl-4 md:pl-8">
                      <p className="text-base md:text-xl text-gray-300 font-light leading-relaxed">
                          {isUltimate ? ultimateData!.summary : item.description}
                      </p>
                  </div>
              </div>
           </header>

           {/* --- 2. REKLAM ALANI: İÇERİK ÜSTÜ (YAZI İÇİ) --- */}
           {/* Metin başladığı için burada 'Yazı İçi' (4542150009) en iyisidir */}
           <div className="mb-12 w-full">
              <p className="text-center text-[10px] text-gray-600 mb-2 uppercase tracking-widest">- Sponsorlu -</p>
              <AdUnit slot="4542150009" format="fluid" />
           </div>

           {/* İÇERİK DETAYLARI */}
           {isUltimate && ultimateData ? (
              <div className="space-y-12 md:space-y-16">
                  
                  {/* Yorumlar Bloğu */}
                  <div className="space-y-10 md:space-y-12">
                     <section>
                         <h2 className="text-xl md:text-2xl font-serif font-bold text-emerald-400 mb-4 md:mb-6 flex items-center gap-3">
                            <BookOpen className="w-5 h-5 md:w-6 md:h-6"/> İslami Tabir
                         </h2>
                         <div className="space-y-6 md:space-y-8 border-l-2 border-emerald-500/30 pl-4 md:pl-6">
                           {ultimateData.islamic.map((src, i) => (
                             <div key={i}>
                                 <p className="text-gray-300 italic mb-2 leading-relaxed text-base md:text-lg">"{src.text}"</p>
                                 <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider block">— {src.source}</span>
                             </div>
                           ))}
                         </div>
                     </section>

                     <section>
                         <h2 className="text-xl md:text-2xl font-serif font-bold text-purple-400 mb-4 md:mb-6 flex items-center gap-3">
                            <Brain className="w-5 h-5 md:w-6 md:h-6"/> Psikolojik Analiz
                         </h2>
                         <div className="border-l-2 border-purple-500/30 pl-4 md:pl-6">
                           <p className="text-gray-300 leading-relaxed mb-6 text-base md:text-lg">
                               {ultimateData.psychological}
                           </p>
                           <div className="flex gap-2">
                               <span className="px-3 py-1 bg-purple-500/10 text-purple-300 rounded text-[10px] font-bold uppercase">BİLİNÇALTI</span>
                               <span className="px-3 py-1 bg-purple-500/10 text-purple-300 rounded text-[10px] font-bold uppercase">SEMBOLİZM</span>
                           </div>
                         </div>
                     </section>
                  </div>

                  {/* --- 3. REKLAM ALANI: ANALİZ ARASI (YAZI İÇİ) --- */}
                  {/* Uzun okumayı böler, yine 'Yazı İçi' (4542150009) kullanıyoruz */}
                  <div className="py-8 w-full border-t border-b border-white/5">
                      <AdUnit slot="4542150009" format="fluid" />
                  </div>

                  {/* SENARYOLAR */}
                  <section className="pt-8">
                     <h2 className="text-xl md:text-3xl font-serif font-bold text-white mb-8 md:mb-10 flex items-center gap-3">
                        <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-[#fbbf24]" />
                        Farklı Durumlara Göre Tabirler
                     </h2>
                     <div className="space-y-4 md:space-y-6">
                        {ultimateData.scenarios.map((scene, i) => (
                           <div key={i} className="group relative bg-[#0f172a]/50 hover:bg-[#0f172a] border border-white/5 hover:border-[#fbbf24]/20 rounded-xl md:rounded-2xl p-5 md:p-6 transition-all duration-300">
                              <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${scene.isPositive ? 'bg-emerald-500' : 'bg-[#fbbf24]'}`}></div>
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 pl-3 md:pl-4">
                                 <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                       <h3 className="text-lg md:text-xl font-bold text-gray-100 group-hover:text-white transition-colors">
                                          {scene.title}
                                       </h3>
                                    </div>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                       {scene.description}
                                    </p>
                                 </div>
                                 {scene.slug && validSlugs.includes(scene.slug) && (
                                    <Link 
                                      href={`/sozluk/${scene.slug}`}
                                      className="shrink-0 flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-[#fbbf24] hover:border-[#fbbf24] hover:text-black text-xs font-bold text-gray-400 transition-all uppercase tracking-wider whitespace-nowrap w-fit"
                                    >
                                       DETAYLI OKU <ChevronRight className="w-3 h-3" />
                                    </Link>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  </section>
              </div>
           ) : (
              <LegacyRenderer blocks={contentData as LegacyBlock[]} />
           )}

           {/* --- MOBİL İÇİN KATEGORİ LİSTESİ --- */}
           <div className="lg:hidden mt-12 mb-12">
              <CategoryListComponent />
           </div>

           {/* --- 4. REKLAM ALANI: İÇERİK SONU (MULTIPLEX) --- */}
           {/* Kullanıcı okumayı bitirdi, 'Multiplex' (6481917633) ile öneriler sunuyoruz */}
           <div className="mt-12 mb-8 w-full">
              <p className="text-center text-[10px] text-gray-600 mb-2 uppercase tracking-widest">- İlginizi Çekebilir -</p>
              <AdUnit slot="6481917633" />
           </div>

           {/* --- ALT BÖLÜM: BENZER RÜYALAR --- */}
           {relatedDreams.length > 0 && (
             <section className="mt-12 md:mt-20 pt-10 border-t border-white/10">
                <h2 className="text-xl md:text-2xl font-serif font-bold text-white mb-6 md:mb-8 flex items-center gap-3">
                    <GitGraph className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                    Bunları da Merak Edebilirsiniz
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relatedDreams.map((related) => (
                        <Link 
                            key={related.slug} 
                            href={`/sozluk/${related.slug}`}
                            className="group p-5 bg-[#0f172a] border border-white/5 rounded-xl md:rounded-2xl hover:border-blue-500/30 hover:bg-[#0f172a]/80 transition-all"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <h4 className="text-base md:text-lg font-bold text-gray-200 group-hover:text-blue-400 transition-colors">
                                    {formatTerm(related.term)}
                                </h4>
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-serif font-bold text-gray-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                    {related.first_letter}
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 line-clamp-2">
                                {related.description}
                            </p>
                        </Link>
                    ))}
                </div>
             </section>
           )}

        </article>
      </main>
    </div>
  );
}