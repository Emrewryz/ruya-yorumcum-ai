import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowLeft, Sparkles, PenLine, BookOpen, Search } from "lucide-react";
import type { Metadata } from 'next';

// SEO Metadata
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: item } = await supabase
    .from('dream_dictionary')
    .select('term, description')
    .eq('slug', params.slug)
    .single();

  if (!item) return { title: 'Terim Bulunamadı' };

  return {
    title: `${item.term} Rüyada Görmek - RüyaYorumcum`,
    description: item.description,
  };
}

export default async function DictionaryDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  
  // Veritabanından çek
  const { data: item } = await supabase
    .from('dream_dictionary')
    .select('*')
    .eq('slug', params.slug)
    .single();

  // TERİM BULUNAMAZSA
  if (!item) {
    return (
      <div className="min-h-[100dvh] bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="bg-noise fixed inset-0 opacity-20"></div>
        <div className="relative z-10 max-w-sm">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                <Search className="w-8 h-8 text-gray-500" />
            </div>
            <h1 className="text-2xl font-serif text-[#fbbf24] mb-2">Henüz Bu Terimi Yazmadık...</h1>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                Sözlüğümüz her gün genişliyor. Ancak yapay zeka kahinimiz bu sembolü senin için özel olarak yorumlayabilir.
            </p>
            <div className="flex flex-col gap-3">
                <Link href="/dashboard" className="w-full px-6 py-4 bg-[#fbbf24] text-black rounded-xl font-bold text-sm tracking-wide uppercase hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" /> Rüya Yorumla
                </Link>
                <Link href="/sozluk" className="w-full px-6 py-4 bg-white/5 text-white rounded-xl font-bold text-sm hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Sözlüğe Dön
                </Link>
            </div>
        </div>
      </div>
    );
  }

  // search_count'u artır (Popülerlik için - Hata verirse sayfayı bozmasın diye try-catch yok ama safe call)
  await supabase.rpc('increment_search_count', { row_id: item.id });

  return (
    // APP FIX: min-h-[100dvh] ve pb-32
    <div className="min-h-[100dvh] bg-[#020617] text-white font-sans relative overflow-x-hidden selection:bg-purple-500/30 pb-32">
      
      {/* Arkaplan */}
      <div className="bg-noise fixed inset-0 opacity-20 pointer-events-none"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#8b5cf6]/10 blur-[150px] rounded-full pointer-events-none"></div>

      {/* --- STICKY HEADER --- */}
      <nav className="sticky top-0 z-30 w-full bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 md:py-6 flex items-center justify-between">
         <Link href="/sozluk" className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-90 transition-all text-gray-400 group">
            <ArrowLeft className="w-6 h-6 group-hover:text-white" />
         </Link>
         
         <div className="flex flex-col items-center">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Rüya Tabiri</span>
            <span className="font-serif font-bold text-white text-base md:text-lg">{item.term}</span>
         </div>

         <div className="w-9"></div> {/* Dengeleyici */}
      </nav>

      {/* --- İÇERİK --- */}
      <main className="w-full max-w-3xl mx-auto px-4 md:px-6 pt-8 md:pt-12 relative z-10">
         
         <article>
            <header className="text-center mb-8 md:mb-12">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6] text-[10px] md:text-xs font-bold tracking-widest uppercase mb-4 md:mb-6">
                  <BookOpen className="w-3 h-3" /> Sözlük Kaydı
               </div>
               <h1 className="text-3xl md:text-6xl font-serif font-bold text-white mb-4 md:mb-6 leading-tight">
                  {item.term}
               </h1>
               <p className="text-base md:text-xl text-gray-400 font-light leading-relaxed max-w-2xl mx-auto">
                  {item.description}
               </p>
            </header>

            {/* İçerik Metni (Prose) */}
            {/* APP FIX: prose-sm mobilde daha okunaklıdır */}
            <div 
               className="prose prose-invert prose-sm md:prose-lg max-w-none prose-headings:font-serif prose-headings:text-[#fbbf24] prose-p:text-gray-300 prose-p:leading-loose prose-strong:text-white prose-li:text-gray-300"
               dangerouslySetInnerHTML={{ __html: item.content || "<p>İçerik hazırlanıyor...</p>" }} 
            />

            {/* --- CTA KARTI (Alt Kısım) --- */}
            <div className="mt-12 md:mt-20 p-6 md:p-12 rounded-3xl bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border border-[#fbbf24]/30 text-center relative overflow-hidden group shadow-2xl">
               {/* Arkaplan Deseni */}
               <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px]"></div>
               
               <div className="relative z-10">
                   <h3 className="text-xl md:text-3xl font-serif font-bold text-white mb-3 md:mb-4">
                      Bu Senin Rüyanda Ne Anlama Geliyor?
                   </h3>
                   <p className="text-sm md:text-base text-gray-400 mb-6 md:mb-8 max-w-lg mx-auto leading-relaxed">
                      Sözlükteki anlamlar geneldir. Senin rüyanın sana özel mesajını, kişisel durumuna göre yapay zeka ile analiz et.
                   </p>
                   
                   <Link 
                      href="/dashboard"
                      className="inline-flex items-center gap-3 px-6 py-3 md:px-8 md:py-4 rounded-full bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black font-bold text-xs md:text-sm tracking-widest uppercase hover:scale-105 active:scale-95 transition-transform shadow-[0_0_30px_rgba(251,191,36,0.3)]"
                   >
                      <PenLine className="w-4 h-4 md:w-5 md:h-5" /> Rüyanı Yorumla
                   </Link>
               </div>
            </div>

         </article>
      </main>

    </div>
  );
}