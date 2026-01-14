import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowLeft, Sparkles, PenLine } from "lucide-react";
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
    title: `${item.term} Anlamı ve Tabiri - RüyaYorumcum`,
    description: item.description,
  };
}

export default async function DictionaryDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  
  // Veritabanından çek (Yeni tablo yapısına göre)
  const { data: item } = await supabase
    .from('dream_dictionary')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!item) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-serif text-[#fbbf24] mb-4">Henüz Bu Terimi Yazmadık...</h1>
        <p className="text-gray-400 mb-8">Ama yapay zekamız senin rüyanı yorumlayabilir!</p>
        <Link href="/dashboard" className="px-6 py-3 bg-purple-600 rounded-full font-bold">Rüya Yorumla</Link>
      </div>
    );
  }

  // search_count'u artır (Popülerlik için)
  await supabase.rpc('increment_search_count', { row_id: item.id });

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-purple-500/30">
      
      <nav className="fixed top-0 w-full bg-[#020617]/80 backdrop-blur-md border-b border-white/5 z-50">
         <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/sozluk" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
               <ArrowLeft className="w-5 h-5" /> <span className="text-sm font-bold">Sözlüğe Dön</span>
            </Link>
            <span className="font-serif font-bold text-[#fbbf24]">RüyaYorumcum</span>
         </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
         <article className="max-w-3xl mx-auto">
            
            <header className="text-center mb-12">
               <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6] text-xs font-bold tracking-widest uppercase mb-6">
                  <Sparkles className="w-3 h-3" /> Rüya Sözlüğü
               </div>
               <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
                  {item.term}
               </h1>
               <p className="text-xl text-gray-400 font-light leading-relaxed">
                  {item.description}
               </p>
            </header>

            {/* İçerik */}
            <div 
              className="prose prose-invert prose-lg max-w-none prose-headings:font-serif prose-headings:text-[#fbbf24] prose-p:text-gray-300 prose-p:leading-loose prose-strong:text-white"
              dangerouslySetInnerHTML={{ __html: item.content || "<p>İçerik hazırlanıyor...</p>" }} 
            />

            {/* CTA */}
            <div className="mt-20 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border border-[#fbbf24]/30 text-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
               
               <h3 className="relative z-10 text-2xl md:text-3xl font-serif font-bold text-white mb-4">
                  Bu Rüya Senin İçin Ne Anlama Geliyor?
               </h3>
               <p className="relative z-10 text-gray-400 mb-8 max-w-lg mx-auto">
                  Sözlükteki anlamlar geneldir. Senin rüyanın sana özel mesajını, kişisel durumuna göre yapay zeka ile analiz et.
               </p>
               
               <Link 
                 href="/dashboard"
                 className="relative z-10 inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#fbbf24] text-black font-bold text-sm tracking-widest uppercase hover:scale-105 transition-transform shadow-[0_0_30px_rgba(251,191,36,0.4)]"
               >
                  <PenLine className="w-5 h-5" /> Kendi Rüyanı Yorumla
               </Link>
            </div>

         </article>
      </main>

    </div>
  );
}