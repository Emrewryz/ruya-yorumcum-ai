import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import type { Metadata } from 'next';
import { cache } from 'react';
import Script from 'next/script';

// --- TİPLEMELER ---
type DreamScenario = {
  title: string;
  description: string;
  slug: string;
  isPositive: boolean;
};

type DreamIslamic = {
  source: string;
  text: string;
};

type TraditionalWisdom = {
  introduction: string;
  pillars: {
    title: string;
    description: string;
  }[];
};

type DreamFAQ = {
  question: string;
  answer: string;
};

type DreamContent = {
  type: string;
  summary: string;
  islamic?: DreamIslamic[];
  traditional_wisdom?: TraditionalWisdom;
  psychological: string;
  scenarios: DreamScenario[];
  faq?: DreamFAQ[];
};

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

const getLatestDreams = cache(async () => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('dream_dictionary')
    .select('slug, term, description')
    .order('created_at', { ascending: false })
    .limit(3); 
  return data || [];
});

// JSON PARSE FONKSİYONU
const parseContent = (rawContent: any): DreamContent | null => {
  if (!rawContent) return null;
  
  try {
    const parsed = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent;
    if (parsed && parsed.type === 'ultimate') {
      return parsed as DreamContent;
    }
    return null;
  } catch (e) {
    console.error("JSON Parse Hatası:", e);
    return null;
  }
};

// --- METADATA (SEO) ---
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = await getDreamData(params.slug);
  if (!item) return { title: 'Rüya Tabiri Bulunamadı' };

  return {
    title: `${item.term} Ne Anlama Gelir? | Psikolojik ve İslami Yorumu`,
    description: item.description.substring(0, 160),
  };
}

// --- ANA COMPONENT ---
export default async function Page({ params }: { params: { slug: string } }) {
  const item = await getDreamData(params.slug);
  const supabase = createClient();

  // Dark mode fallback tasarımı
  if (!item) return <div className="min-h-screen flex items-center justify-center text-stone-500 bg-[#faf9f6] dark:bg-stone-950 dark:text-stone-400">Sayfa bulunamadı.</div>;

  const [latestDreams] = await Promise.all([
    getLatestDreams(),
    // Not: Bu rpc çağrısını ileride bir API route'una veya useEffect'e taşımak performansı artırır.
    supabase.rpc('increment_search_count', { row_id: item.id })
  ]);

  const structuredContent = parseContent(item.content);
  const psychologicalText = structuredContent?.psychological;

  // SEO Schema Üretimi
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: item.term,
    description: structuredContent ? structuredContent.summary : item.description,
    author: { '@type': 'Organization', name: 'RüyaYorumcum' },
  };

  let schemaEntities: { '@type': string; name: string; acceptedAnswer: { '@type': string; text: string } }[] = [];
  if (structuredContent?.faq?.length) {
      schemaEntities = structuredContent.faq.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } }));
  } else if (structuredContent?.scenarios?.length) {
      schemaEntities = structuredContent.scenarios.map(s => ({ '@type': 'Question', name: s.title, acceptedAnswer: { '@type': 'Answer', text: s.description } }));
  }
  const faqSchema = schemaEntities.length > 0 ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: schemaEntities } : null;

  return (
    // Ana kapsayıcı dark mode ayarları (bg-stone-950)
    <div className="min-h-screen bg-[#faf9f6] dark:bg-stone-950 text-stone-800 dark:text-stone-200 font-sans pb-16 md:pb-24 selection:bg-emerald-200 dark:selection:bg-emerald-900 antialiased transition-colors duration-300">
      <Script id="article-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      {/* Mobil için padding-top azaltıldı, yatay padding px-4 yapıldı */}
      <main className="max-w-2xl mx-auto px-4 sm:px-5 pt-20 md:pt-32">
        
        <article className="space-y-8 md:space-y-12">
            
            <header className="space-y-4 md:space-y-6">
                {/* Breadcrumb - Mobil uyumlu sarma (flex-wrap) */}
                <nav className="flex flex-wrap items-center text-stone-500 dark:text-stone-400 text-xs md:text-sm font-medium">
                  <Link href="/" className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">Ana Sayfa</Link>
                  <ChevronRight className="w-3.5 h-3.5 mx-1.5 md:mx-2 opacity-50" />
                  <Link href="/sozluk" className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">Sözlük</Link>
                  <ChevronRight className="w-3.5 h-3.5 mx-1.5 md:mx-2 opacity-50" />
                  <span className="text-stone-400 dark:text-stone-500 truncate max-w-[120px] md:max-w-none">{item.term}</span>
                </nav>

                {/* Başlık - Mobilde daha küçük font */}
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 dark:text-stone-50 leading-tight tracking-tight">
                  {item.term}
                </h1>

                {/* Özet metin */}
                <div className="text-lg md:text-xl lg:text-2xl text-stone-600 dark:text-stone-300 font-serif italic leading-relaxed pt-1 md:pt-2">
                  {structuredContent ? (
                    <div dangerouslySetInnerHTML={{ __html: structuredContent.summary }} />
                  ) : (
                    <p>{item.description}</p>
                  )}
                </div>
            </header>

            <hr className="border-stone-200 dark:border-stone-800" />

            {/* Metin İçeriği Ana Gövdesi - Prose dark mode ayarları */}
            <div className="prose prose-stone dark:prose-invert prose-base md:prose-lg lg:prose-xl max-w-none text-stone-700 dark:text-stone-300 leading-relaxed 
                            [&>p]:mb-5 md:[&>p]:mb-6 
                            [&>h2]:font-serif [&>h2]:text-2xl md:[&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-stone-900 dark:[&>h2]:text-stone-100 [&>h2]:mt-10 md:[&>h2]:mt-12 [&>h2]:mb-4 md:[&>h2]:mb-6
                            [&>h3]:font-serif [&>h3]:text-xl md:[&>h3]:text-2xl [&>h3]:font-semibold [&>h3]:text-stone-900 dark:[&>h3]:text-stone-100 [&>h3]:mt-6 md:[&>h3]:mt-8 [&>h3]:mb-2 md:[&>h3]:mb-3
                            [&>strong]:text-stone-900 dark:[&>strong]:text-stone-100 [&>strong]:font-semibold">
                
                {/* KADİM BİLGELİK */}
                {structuredContent?.traditional_wisdom && (
                  <div>
                    <h2>Kadim Bilgelik ve Dini Yorumlar</h2>
                    <p>{structuredContent.traditional_wisdom.introduction}</p>
                    {structuredContent.traditional_wisdom.pillars.map((pillar, idx) => (
                      <div key={idx} className="my-5 md:my-6 pl-4 md:pl-6 border-l-4 border-stone-300 dark:border-stone-700">
                        <strong className="block text-lg md:text-xl mb-1 md:mb-2">{pillar.title}</strong>
                        <p className="m-0 text-stone-600 dark:text-stone-400">{pillar.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* PSİKOLOJİK YORUM */}
                {psychologicalText && (
                  <div>
                    <h2>Psikolojik ve Bilinçaltı Analizi</h2>
                    <div dangerouslySetInnerHTML={{ __html: psychologicalText }} />
                  </div>
                )}

                {/* SENARYOLAR */}
                {structuredContent?.scenarios && structuredContent.scenarios.length > 0 && (
                  <div>
                    <h2>Farklı Senaryolar ve Durumlar</h2>
                    <div className="space-y-6 md:space-y-8">
                        {structuredContent.scenarios.map((scenario, index) => (
                          <div key={index}>
                            <h3>{scenario.title}</h3>
                            <p>{scenario.description}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* SIKÇA SORULAN SORULAR */}
                {structuredContent?.faq && structuredContent.faq.length > 0 && (
                  <div className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-stone-200 dark:border-stone-800">
                    <h2>Sıkça Sorulan Sorular</h2>
                    <div className="space-y-5 md:space-y-6">
                        {structuredContent.faq.map((faq, index) => (
                          <div key={index}>
                            <strong className="block text-base md:text-lg mb-1">{faq.question}</strong>
                            <p className="m-0 text-stone-600 dark:text-stone-400 text-sm md:text-base">{faq.answer}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
        </article>

        {/* CTA KUTUSU - Dark Mode */}
        <div className="my-12 md:my-16 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 md:p-12 text-center shadow-sm">
            <h3 className="font-serif text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2 md:mb-3">Rüyanız Benzersizdir</h3>
            <p className="text-stone-600 dark:text-stone-400 mb-6 md:mb-8 max-w-md mx-auto leading-relaxed text-sm md:text-base">
              Yukarıdaki tabirler genel sembollerdir. Rüyadaki hisleriniz, renkler ve olay örgüsü sadece size aittir. Detayları anlatın, yapay zeka bilinçaltınızı analiz etsin.
            </p>
            <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 rounded-full text-sm font-medium transition-colors w-full sm:w-auto">
               <Sparkles className="w-4 h-4" /> Ücretsiz Analiz Yaptır
            </Link>
        </div>

        {/* LATEST DREAMS - Dark Mode */}
        {latestDreams.length > 0 && (
          <div className="pt-8 md:pt-12 border-t border-stone-200 dark:border-stone-800">
            <h4 className="font-serif text-lg md:text-xl font-bold text-stone-900 dark:text-stone-100 mb-4 md:mb-6">Sözlükte Okumaya Devam Et</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
               {latestDreams.map((latest) => (
                  <Link key={latest.slug} href={`/sozluk/${latest.slug}`} className="group p-4 md:p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl hover:border-stone-400 dark:hover:border-stone-600 transition-colors">
                      <h5 className="font-semibold text-stone-900 dark:text-stone-100 mb-1.5 md:mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {latest.term}
                      </h5>
                      <p className="text-xs md:text-sm text-stone-500 dark:text-stone-400 line-clamp-2">
                        {latest.description}
                      </p>
                  </Link>
               ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}