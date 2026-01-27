import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowLeft, Sparkles, PenLine, BookOpen, Quote, ChevronRight } from "lucide-react";
import type { Metadata } from 'next';
import { cache } from 'react';
import Script from 'next/script';

// --- TİP TANIMLAMALARI ---
type ContentBlock = 
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; title?: string; text: string }
  | { type: 'list'; items: string[] };

// --- VERİ ÇEKME (CACHE MEKANİZMASI) ---
// Bu fonksiyon veriyi sadece 1 kere çeker, hem SEO hem Sayfa kullanır.
const getDreamData = cache(async (slug: string) => {
  const supabase = createClient();
  const { data: item } = await supabase
    .from('dream_dictionary')
    .select('*')
    .eq('slug', slug)
    .single();
  return item;
});

// --- YARDIMCI FONKSİYONLAR ---
const parseContent = (content: any): ContentBlock[] => {
  try {
    if (typeof content === 'string' && content.startsWith('[')) {
      return JSON.parse(content);
    }
    return [{ type: 'paragraph', text: typeof content === 'string' ? content : 'İçerik hazırlanıyor...' }];
  } catch (e) {
    return [{ type: 'paragraph', text: 'İçerik formatı güncelleniyor.' }];
  }
};

// --- SEO METADATA (DİYANET & İSLAMİ TAKTİĞİ BURADA) ---
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = await getDreamData(params.slug);

  if (!item) return { title: 'Rüya Tabiri Bulunamadı - RüyaYorumcum' };

  // İnsanların en çok arattığı kelimeleri başlığa ekliyoruz
  const seoTitle = `Rüyada ${item.term} Ne Anlama Gelir? Diyanet ve İslami Tabiri`;

  return {
    title: seoTitle,
    description: item.description.substring(0, 160),
    keywords: [`rüyada ${item.term}`, `${item.term} anlamı`, `islami rüya tabiri ${item.term}`, 'diyanet rüya', ...(item.keywords || [])],
    openGraph: {
      title: seoTitle,
      description: item.description,
      type: 'article',
      siteName: 'RüyaYorumcum AI',
      locale: 'tr_TR',
    },
    alternates: {
      canonical: `https://www.ruyayorumcum.com.tr/sozluk/${params.slug}`
    }
  };
}

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

// --- ANA SAYFA (Page Component) ---
export default async function Page({ params }: { params: { slug: string } }) {
  const item = await getDreamData(params.slug);
  const supabase = createClient();

  // TERİM BULUNAMAZSA GÖSTERİLECEK EKRAN
  if (!item) {
    return (
      <div className="min-h-[100dvh] bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans">
        <div className="relative z-10 max-w-sm p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
            <h1 className="text-xl font-serif font-bold text-[#fbbf24] mb-3">Henüz Bu Terimi Yazmadık</h1>
            <p className="text-gray-400 text-sm mb-6">Yapay zeka kahinimiz bu sembolü senin için yorumlayabilir.</p>
            <Link href="/dashboard" className="w-full px-6 py-3 bg-[#fbbf24] text-black rounded-xl font-bold text-sm hover:scale-105 transition-transform flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" /> Rüya Yorumla
            </Link>
        </div>
      </div>
    );
  }

  // Arama sayısını artır (Hata yönetimi ile)
  supabase.rpc('increment_search_count', { row_id: item.id }).then(({ error }) => {
    if(error) console.error("Sayaç hatası:", error);
  });

  // BENZER RÜYALARI ÇEK (İÇ LİNKLEME İÇİN)
  const { data: relatedDreams } = await supabase
    .from('dream_dictionary')
    .select('term, slug')
    .neq('id', item.id) // Kendisi hariç
    .limit(3); // 3 tane getir

  const contentBlocks = parseContent(item.content);

  // JSON-LD (Google için Yapısal Veri)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Rüyada ${item.term} Görmek Ne Anlama Gelir?`,
    description: item.description,
    datePublished: item.created_at,
    author: {
      '@type': 'Organization',
      name: 'RüyaYorumcum AI'
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#020617] text-white font-sans relative overflow-x-hidden selection:bg-[#fbbf24]/30 selection:text-[#fbbf24] pb-32">
      
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ATMOSFER */}
      <div className="bg-noise fixed inset-0 opacity-20 pointer-events-none"></div>
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#4c1d95]/20 blur-[150px] rounded-full pointer-events-none"></div>

      {/* HEADER */}
      <nav className="sticky top-0 z-40 w-full bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-4 flex items-center justify-between transition-all">
         <Link href="/sozluk" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group px-3 py-1.5 rounded-full hover:bg-white/5 active:scale-95 border border-transparent hover:border-white/10">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider hidden md:inline">Sözlüğe Dön</span>
         </Link>
         <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#fbbf24]" />
            <span className="text-xs md:text-sm text-gray-300 font-serif italic">Rüya Sembolleri</span>
         </div>
         <div className="w-10"></div>
      </nav>

      {/* ANA İÇERİK */}
      <main className="w-full max-w-3xl mx-auto px-6 py-12 md:py-20 relative z-10">
         <article>
            {/* 1. HERO BÖLÜMÜ */}
            <header className="mb-16 border-b border-white/5 pb-10">
               <div className="mb-6 flex items-center gap-3">
                  <span className="w-12 h-12 rounded-xl bg-[#fbbf24]/10 border border-[#fbbf24]/20 flex items-center justify-center text-[#fbbf24] font-serif font-bold text-2xl shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                     {item.term.charAt(0)}
                  </span>
                  <span className="text-sm text-[#fbbf24] font-bold tracking-[0.2em] uppercase opacity-80">İslami Tabiri</span>
               </div>

               <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 leading-[1.1] tracking-tight">
                  {item.term}
               </h1>
               
               <div className="pl-6 border-l-4 border-[#fbbf24] py-1">
                  <p className="text-xl text-gray-300 font-light leading-relaxed italic">
                     {item.description}
                  </p>
               </div>
            </header>

            {/* 2. DİNAMİK İÇERİK BLOKLARI */}
            <div className="space-y-10">
                {contentBlocks.map((block, index) => (
                   <BlockRenderer key={index} block={block} />
                ))}
            </div>

            {/* 3. CTA KARTI */}
            <div className="mt-20 relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f172a] shadow-2xl">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
               <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[#fbbf24]/10 to-transparent"></div>

               <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                   <div className="max-w-md">
                       <h3 className="text-2xl font-serif font-bold text-white mb-3">
                         Bu rüya size özel bir mesaj taşıyor olabilir
                       </h3>
                       <p className="text-base text-gray-400 font-light leading-relaxed">
                         Sözlük anlamları geneldir. Yapay zeka ile rüyanızın size özel gizli mesajını hemen çözün.
                       </p>
                   </div>
                   
                   <Link 
                     href="/dashboard"
                     className="whitespace-nowrap px-8 py-4 rounded-xl bg-[#fbbf24] text-black font-bold text-sm tracking-widest uppercase hover:bg-[#f59e0b] hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-3"
                   >
                      <PenLine className="w-5 h-5" /> Rüyamı Yorumla
                   </Link>
               </div>
            </div>

            {/* 4. SIKÇA SORULAN SORULAR (FAQ) - YENİ ÖZELLİK */}
            <div className="mt-20 border-t border-white/10 pt-12">
              <h3 className="text-2xl font-serif font-bold text-[#fbbf24] mb-8 flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                Rüyada {item.term} Görmek Hakkında SSS
              </h3>
              
              <div className="grid gap-4">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <h4 className="font-bold text-white mb-2 text-lg">Rüyada {item.term.toLowerCase()} görmek iyiye mi işarettir?</h4>
                  <p className="text-gray-400 font-light leading-relaxed">
                    İslami kaynaklara ve rüya tabirlerine göre {item.term.toLowerCase()}, genellikle rüyayı gören kişinin niyetine ve rüyanın içeriğine göre değişir. Detaylı analiz için sayfamızdaki İslami yorumları inceleyebilirsiniz.
                  </p>
                </div>

                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <h4 className="font-bold text-white mb-2 text-lg">Bu rüyanın psikolojik anlamı nedir?</h4>
                  <p className="text-gray-400 font-light leading-relaxed">
                    Modern psikolojide {item.term.toLowerCase()}, bilinçaltınızdaki bastırılmış duyguların, korkuların veya günlük hayattaki arzuların bir yansıması olarak kabul edilir.
                  </p>
                </div>
              </div>
            </div>

            {/* 5. DİĞER POPÜLER RÜYALAR (İÇ LİNKLEME) - YENİ ÖZELLİK */}
            {relatedDreams && relatedDreams.length > 0 && (
              <div className="mt-20">
                <h3 className="text-xl font-bold text-gray-200 mb-6 uppercase tracking-widest text-sm">Bunları da Gördünüz mü?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedDreams.map((dream) => (
                    <Link 
                      key={dream.slug} 
                      href={`/sozluk/${dream.slug}`}
                      className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#fbbf24]/50 transition-all flex flex-col justify-between h-32"
                    >
                      <span className="text-[#fbbf24] font-serif font-bold text-lg group-hover:translate-x-1 transition-transform">
                        {dream.term}
                      </span>
                      <div className="flex items-center text-xs text-gray-500 group-hover:text-gray-300">
                        Tabiri Oku <ChevronRight className="w-3 h-3 ml-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

         </article>
      </main>
    </div>
  );
}