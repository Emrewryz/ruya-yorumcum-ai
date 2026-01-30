import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { 
  ArrowLeft, BookOpen, Brain, 
  ChevronRight, Sparkles, List,
  Quote, Info, CheckCircle2, AlertTriangle
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
    isPositive: boolean; // true: Yeşil, false: Sarı/Turuncu
    slug?: string;       // Doluysa "Detaylı Oku" butonu çıkar
  }[];
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
};

// --- VERİ ÇEKME (DATABASE) ---
const getDreamData = cache(async (slug: string) => {
  const supabase = createClient();
  const { data: item } = await supabase
    .from('dream_dictionary')
    .select('*')
    .eq('slug', slug)
    .single();
  return item;
});

const parseContent = (rawContent: string | null): UltimateDreamData | LegacyBlock[] => {
  if (!rawContent) return [];
  try {
    const parsed = JSON.parse(rawContent);
    // Eğer yeni format ise (ultimate type)
    if (!Array.isArray(parsed) && parsed.type === 'ultimate') {
      return parsed as UltimateDreamData;
    }
    // Eski format ise
    return parsed as LegacyBlock[];
  } catch (e) {
    return [{ type: 'paragraph', text: rawContent }] as LegacyBlock[];
  }
};

// --- METADATA (SEO) ---
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = await getDreamData(params.slug);
  if (!item) return { title: 'Rüya Tabiri Bulunamadı' };
  const cleanTerm = formatTerm(item.term);

  return {
    title: `Rüyada ${cleanTerm} Görmek - İslami ve Psikolojik Yorumu`,
    description: item.description.substring(0, 160),
  };
}

// --- ESKİ İÇERİK İÇİN YEDEK RENDERER ---
const LegacyRenderer = ({ blocks }: { blocks: LegacyBlock[] }) => (
  <div className="space-y-6 text-gray-300">
    {blocks.map((block, i) => (
      <div key={i}>{block.text}</div>
    ))}
  </div>
);

// --- ANA SAYFA COMPONENTİ ---
export default async function Page({ params }: { params: { slug: string } }) {
  const item = await getDreamData(params.slug);
  const supabase = createClient();

  if (!item) return <div className="text-white text-center py-20">İçerik bulunamadı.</div>;

  // Okunma sayısını artır
  await supabase.rpc('increment_search_count', { row_id: item.id });

  const cleanTitle = formatTerm(item.term);
  const contentData = parseContent(item.content);
  const isUltimate = !Array.isArray(contentData) && (contentData as any).type === 'ultimate';
  const ultimateData = isUltimate ? contentData as UltimateDreamData : null;

  // JSON-LD (Google için Yapısal Veri)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Rüyada ${cleanTitle} Görmek`,
    description: item.description,
    author: { '@type': 'Organization', name: 'RüyaYorumcum' },
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans pb-20 pt-28">
      <Script id="json-ld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* --- SOL SIDEBAR (Sticky) --- */}
        <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-32 space-y-6">
                
                {/* Geri Dön Linki */}
                <Link href="/sozluk" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#fbbf24] transition-colors text-sm font-medium mb-2 pl-1">
                    <ArrowLeft className="w-4 h-4" /> Sözlüğe Dön
                </Link>

                {/* İçindekiler Menüsü */}
                <nav className="bg-[#0f172a] rounded-2xl border border-white/5 p-6 shadow-xl">
                    <h3 className="text-[#fbbf24] font-bold text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-2 border-b border-white/5 pb-3">
                       <List className="w-4 h-4" /> İÇİNDEKİLER
                    </h3>
                    <ul className="space-y-4 text-sm text-gray-400 font-medium">
                        <li><a href="#genel" className="hover:text-white transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-[#fbbf24] transition-colors"></span> Genel Bakış</a></li>
                        {isUltimate && (
                            <>
                            <li><a href="#islami" className="hover:text-white transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 group-hover:bg-emerald-500 transition-colors"></span> İslami Tabir (Dini Yorum)</a></li>
                            <li><a href="#psikolojik" className="hover:text-white transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-purple-500/50 group-hover:bg-purple-500 transition-colors"></span> Psikolojik Yorum</a></li>
                            <li><a href="#senaryolar" className="hover:text-white transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 group-hover:bg-blue-500 transition-colors"></span> Detaylı Durumlar</a></li>
                            </>
                        )}
                    </ul>
                </nav>

                {/* CTA KUTUSU (Analiz Et) */}
                <div className="relative overflow-hidden rounded-2xl bg-[#1e1b4b]/40 border border-white/10 p-6 text-center group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#fbbf24]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Sparkles className="w-8 h-8 text-[#fbbf24] mx-auto mb-4" />
                    <p className="text-xs text-gray-300 mb-6 leading-relaxed">
                        Bu sembol sizin rüyanızda nasıl göründü? Yapay zeka ile kişisel analizini yap.
                    </p>
                    <Link href="/dashboard" className="block w-full py-3 bg-white/5 border border-white/10 hover:bg-[#fbbf24] hover:border-[#fbbf24] text-white hover:text-black font-bold rounded-xl text-xs transition-all uppercase tracking-wider shadow-lg">
                        ANALİZ ET
                    </Link>
                </div>
            </div>
        </aside>

        {/* --- ORTA İÇERİK --- */}
        <article className="col-span-1 lg:col-span-9">
           
           {/* Mobil Geri Butonu */}
           <div className="lg:hidden mb-6">
                <Link href="/sozluk" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#fbbf24] text-sm">
                    <ArrowLeft className="w-4 h-4" /> Sözlüğe Dön
                </Link>
           </div>

           {/* 1. HERO BAŞLIK BÖLÜMÜ */}
           <header id="genel" className="relative p-8 md:p-12 rounded-[2rem] bg-[#0a0a0a] border border-white/5 overflow-hidden mb-12 shadow-2xl">
              {/* Arkaplan Glow Efekti */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#fbbf24]/10 rounded-full blur-[100px] pointer-events-none"></div>
              
              <div className="relative z-10">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#fbbf24]/10 text-[#fbbf24] text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                     RÜYA SÖZLÜĞÜ
                  </span>
                  
                  <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 leading-tight">
                     Rüyada <span className="text-[#fbbf24]">{cleanTitle}</span> Görmek
                  </h1>
                  
                  <div className="border-l-2 border-[#fbbf24]/50 pl-6 md:pl-8">
                      <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed">
                         {isUltimate ? ultimateData!.summary : item.description}
                      </p>
                  </div>
              </div>
           </header>

           {isUltimate && ultimateData ? (
              <div className="space-y-16">
                 
                 {/* 2. İSLAMİ VE PSİKOLOJİK YORUM (Revize: Kutusuz, Alt Alta) */}
                 <div className="space-y-12">
                    
                    {/* İslami Bölüm */}
                    <section id="islami">
                        <h2 className="text-2xl font-serif font-bold text-emerald-400 mb-6 flex items-center gap-3">
                           <BookOpen className="w-6 h-6"/> İslami Tabir (Dini Yorum)
                        </h2>
                        {/* Kutu (bg) kaldırıldı, sadece sol çizgi ile vurgu verildi */}
                        <div className="space-y-8 border-l-2 border-emerald-500/30 pl-6">
                           {ultimateData.islamic.map((src, i) => (
                              <div key={i}>
                                 <p className="text-gray-300 italic mb-2 leading-relaxed text-lg">"{src.text}"</p>
                                 <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider block">— {src.source}</span>
                              </div>
                           ))}
                        </div>
                    </section>

                    {/* Psikolojik Bölüm */}
                    <section id="psikolojik">
                        <h2 className="text-2xl font-serif font-bold text-purple-400 mb-6 flex items-center gap-3">
                           <Brain className="w-6 h-6"/> Psikolojik Analiz
                        </h2>
                        {/* Kutu (bg) kaldırıldı, sadece sol çizgi ile vurgu verildi */}
                        <div className="border-l-2 border-purple-500/30 pl-6">
                           <p className="text-gray-300 leading-relaxed mb-6 text-lg">
                               {ultimateData.psychological}
                           </p>
                           <div className="flex gap-2">
                               <span className="px-3 py-1 bg-purple-500/10 text-purple-300 rounded text-[10px] font-bold uppercase">BİLİNÇALTI</span>
                               <span className="px-3 py-1 bg-purple-500/10 text-purple-300 rounded text-[10px] font-bold uppercase">SEMBOLİZM</span>
                           </div>
                        </div>
                    </section>
                 </div>

                 {/* 3. SENARYOLAR VE ÖRÜMCEK AĞI LİNKLERİ */}
                 <section id="senaryolar" className="pt-8 border-t border-white/10">
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-10 flex items-center gap-3">
                       <Sparkles className="w-6 h-6 text-[#fbbf24]" />
                       Farklı Durumlara Göre Tabirler
                    </h2>
                    
                    <div className="space-y-6">
                       {ultimateData.scenarios.map((scene, i) => (
                          <div key={i} className="group relative bg-[#0f172a]/50 hover:bg-[#0f172a] border border-white/5 hover:border-[#fbbf24]/20 rounded-2xl p-6 transition-all duration-300">
                             
                             {/* Sol Renkli Çizgi (Pozitif/Negatif Durumuna Göre) */}
                             <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${scene.isPositive ? 'bg-emerald-500' : 'bg-[#fbbf24]'}`}></div>

                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pl-4">
                                <div className="flex-1 space-y-2">
                                   <div className="flex items-center gap-3">
                                      <h3 className="text-xl font-bold text-gray-100 group-hover:text-white transition-colors">
                                         {scene.title}
                                      </h3>
                                      {/* Küçük ikon: Pozitif mi Negatif mi? */}
                                      {scene.isPositive 
                                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500/50" /> 
                                        : <AlertTriangle className="w-4 h-4 text-[#fbbf24]/50" />
                                      }
                                   </div>
                                   
                                   {/* Kısa Açıklama Her Zaman Görünür */}
                                   <p className="text-gray-400 text-sm leading-relaxed">
                                      {scene.description}
                                   </p>
                                </div>

                                {/* Link Varsa "DETAYLI OKU" Butonu Çıkar */}
                                {scene.slug && (
                                   <Link 
                                     href={`/sozluk/${scene.slug}`}
                                     className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-[#fbbf24] hover:border-[#fbbf24] hover:text-black text-xs font-bold text-gray-400 transition-all uppercase tracking-wider"
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
        </article>
      </main>
    </div>
  );
}