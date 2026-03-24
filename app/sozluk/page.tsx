"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { 
  Search, Sparkles, ArrowRight, Loader2, Moon
} from "lucide-react";
import { getMoonPhase, MoonPhase } from "@/utils/moon"; 

interface DictionaryItem {
  term: string;
  slug: string;
  description: string;
}

export default function DictionaryPage() {
  const router = useRouter();
  const supabase = createClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [terms, setTerms] = useState<DictionaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentMoon, setCurrentMoon] = useState<MoonPhase | null>(null);

  // Verileri Çek
  useEffect(() => {
    setCurrentMoon(getMoonPhase());

    const fetchData = async () => {
      setLoading(true);

      let query = supabase
        .from('dream_dictionary')
        .select('term, slug, description')
        .order('term', { ascending: true })
        .limit(60);

      if (searchTerm) {
        query = supabase
          .from('dream_dictionary')
          .select('term, slug, description')
          .ilike('term', `%${searchTerm}%`)
          .order('term', { ascending: true });
      }

      const { data, error } = await query;
      
      if (!error && data) {
        setTerms(data);
      }
      setLoading(false);
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, supabase]);

  return (
    // Ana arka plan ve dark mode transition
    <main className="min-h-screen bg-[#faf9f6] dark:bg-stone-950 text-stone-800 dark:text-stone-200 font-sans relative overflow-x-hidden selection:bg-stone-200 dark:selection:bg-stone-800 pb-16 md:pb-32 antialiased transition-colors duration-300">
      
      {/* --- ANA KONTEYNER (Mobilde paddingler azaltıldı) --- */}
      <div className="max-w-2xl mx-auto px-4 sm:px-5 pt-24 md:pt-40">
        
        {/* --- HERO / BAŞLIK ALANI --- */}
        <header className="text-center mb-10 md:mb-16">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-5 text-stone-900 dark:text-stone-50 tracking-tight">
              Rüya Sözlüğü
            </h1>
            
            <p className="text-stone-500 dark:text-stone-400 text-base md:text-lg lg:text-xl font-serif italic max-w-lg mx-auto leading-relaxed">
              Bilinçaltınızın sembollerini keşfedin. Ne görmüştünüz?
            </p>

          </motion.div>
        </header>

        {/* --- ARAMA ÇUBUĞU --- */}
        <div className="relative z-20 mb-10 md:mb-12">
           <div className="relative flex items-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full px-5 py-3 md:px-6 md:py-4 shadow-sm focus-within:border-stone-400 dark:focus-within:border-stone-600 focus-within:ring-1 focus-within:ring-stone-400 dark:focus-within:ring-stone-600 transition-all">
              <Search className={`w-5 h-5 mr-3 md:mr-4 transition-colors ${loading ? 'text-stone-400 dark:text-stone-500 animate-pulse' : 'text-stone-400 dark:text-stone-500'}`} />
              <input 
                type="text" 
                placeholder="Örn: Altın, Yılan, Uçmak..." 
                className="w-full bg-transparent text-base md:text-lg text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {loading && <Loader2 className="w-5 h-5 animate-spin text-stone-400 dark:text-stone-500 ml-2" />}
           </div>
           
           {/* Hızlı Etiketler - Kontrast sorunu çözüldü */}
           <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs md:text-sm text-stone-500 dark:text-stone-400">
             <span className="font-medium text-stone-500 dark:text-stone-400">Sık arananlar:</span>
             {['Yılan', 'Diş Kırılması', 'Kedi', 'Deniz'].map((term, i) => (
                <button key={i} onClick={() => setSearchTerm(term)} className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors underline decoration-stone-300 dark:decoration-stone-700 underline-offset-4 hover:decoration-stone-500 dark:hover:decoration-stone-400">
                  {term}
                </button>
             ))}
           </div>
        </div>

        {/* --- LİSTELEME ALANI --- */}
        <section className="min-h-[300px] md:min-h-[400px]">
           {loading && terms.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-16 md:py-20 text-stone-400 dark:text-stone-500">
                 <Loader2 className="w-8 h-8 animate-spin mb-4" />
                 <p className="font-serif italic text-sm md:text-base">Arşiv taranıyor...</p>
               </div>
           ) : terms.length === 0 ? (
               <div className="text-center py-16 md:py-20 border-t border-b border-stone-200 dark:border-stone-800">
                   <p className="text-stone-600 dark:text-stone-400 font-serif italic text-base md:text-lg mb-6">"{searchTerm}" için klasik sözlükte bir karşılık bulamadık.</p>
                   <button onClick={() => router.push('/dashboard')} className="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 rounded-full text-sm font-medium transition-colors w-full sm:w-auto">
                     <Sparkles className="w-4 h-4" /> Yapay Zekaya Yorumlat
                   </button>
               </div>
           ) : (
               <div className="flex flex-col">
                 {terms.map((item, i) => (
                   <Link key={i} href={`/sozluk/${item.slug}`} className="group block py-5 md:py-6 border-b border-stone-200 dark:border-stone-800 last:border-0">
                       <h3 className="font-serif text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1.5 md:mb-2 group-hover:text-stone-500 dark:group-hover:text-stone-400 transition-colors">
                         {item.term}
                       </h3>
                       <p className="text-stone-600 dark:text-stone-400 text-sm md:text-base leading-relaxed line-clamp-2 pr-2 md:pr-4">
                         {item.description}
                       </p>
                   </Link>
                 ))}
               </div>
           )}
        </section>

        {/* --- AY EVRESİ --- */}
        {currentMoon && (
          <div className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-stone-200 dark:border-stone-800 flex flex-col items-center text-center">
             <Moon className="w-5 h-5 text-stone-400 dark:text-stone-500 mb-2 md:mb-3" />
             <h4 className="font-serif text-base md:text-lg font-bold text-stone-900 dark:text-stone-100 mb-1">Günün Kozmik Enerjisi: {currentMoon.phase}</h4>
             <p className="text-stone-500 dark:text-stone-400 text-xs md:text-sm italic max-w-md leading-relaxed">
               {currentMoon.dreamEffect}
             </p>
             <Link href="/ay-takvimi" className="mt-3 text-[10px] md:text-xs font-bold text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 uppercase tracking-widest transition-colors flex items-center gap-1">
                Takvimi İncele <ArrowRight className="w-3 h-3" />
             </Link>
          </div>
        )}

        {/* --- DOĞAL CALL TO ACTION --- */}
        <div className="mt-12 md:mt-16 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 md:p-12 text-center shadow-sm">
            <h3 className="font-serif text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2 md:mb-3">Rüyanız Size Özeldir</h3>
            <p className="text-stone-600 dark:text-stone-400 mb-6 md:mb-8 max-w-md mx-auto leading-relaxed text-sm md:text-base">
              Sözlükteki tabirler sadece genel sembollerdir. Rüyadaki hisleriniz, renkler ve olay örgüsü sadece size aittir. Detayları anlatın, yapay zeka bilinçaltınızı analiz etsin.
            </p>
            <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 rounded-full text-sm font-medium transition-colors w-full sm:w-auto">
               <Sparkles className="w-4 h-4" /> Ücretsiz Analiz Yaptır
            </Link>
        </div>

      </div>
    </main>
  );
}