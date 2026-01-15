"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { Search, Eye, Sparkles, BookOpen, ArrowLeft, Loader2 } from "lucide-react";

// Veri Tipi
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

  // Verileri Çek
  useEffect(() => {
    const fetchTerms = async () => {
      setLoading(true);
      
      let query = supabase
        .from('dream_dictionary')
        .select('term, slug, description')
        .order('term', { ascending: true })
        .limit(50); // Mobilde performans için ilk 50 kayıt

      // Arama yapılıyorsa filtrele
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

    // Debounce (Arama gecikmesi)
    const timer = setTimeout(() => {
      fetchTerms();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, supabase]);

  return (
    // APP FIX: min-h-[100dvh] ve pb-32 (Mobil menü payı)
    <div className="min-h-[100dvh] bg-[#020617] text-white font-sans relative overflow-x-hidden selection:bg-purple-500/30 pb-32">
      
      {/* Atmosfer */}
      <div className="bg-noise fixed inset-0 opacity-20 pointer-events-none"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#8b5cf6]/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* --- STICKY HEADER & ARAMA --- */}
      <nav className="sticky top-0 z-30 w-full bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 px-4 py-4 md:py-6 transition-all">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4">
            
            {/* Üst Satır: Geri Dön ve Başlık */}
            <div className="w-full flex justify-between items-center md:hidden">
                <button onClick={() => router.push('/dashboard')} className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-90 transition-all text-gray-400">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="font-serif font-bold text-lg text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#8b5cf6]" /> Sözlük
                </span>
                <div className="w-9"></div> {/* Dengeleyici */}
            </div>

            {/* Masaüstü Logo */}
            <Link href="/" className="hidden md:flex items-center gap-2 text-white hover:text-[#8b5cf6] transition-colors mr-8">
               <BookOpen className="w-6 h-6" />
               <span className="font-serif font-bold text-xl">RüyaYorumcum</span>
            </Link>

            {/* Arama Barı (Hem Mobil Hem Masaüstü İçin Ortak) */}
            <div className="relative w-full max-w-2xl group">
               <div className="absolute inset-0 bg-[#8b5cf6] blur-xl opacity-10 group-focus-within:opacity-30 transition-opacity rounded-full"></div>
               <div className="relative flex items-center bg-[#0f172a] border border-white/10 rounded-full px-5 py-3 transition-colors group-focus-within:border-[#8b5cf6]/50 shadow-lg">
                  <Search className="w-5 h-5 text-gray-500 mr-3 shrink-0" />
                  {/* APP FIX: text-base (iPhone Zoom Engelleme) */}
                  <input 
                    type="text" 
                    placeholder="Sembol ara... (Yılan, Diş, Uçmak)" 
                    className="w-full bg-transparent text-base text-white placeholder-gray-500 focus:outline-none font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {loading && <Loader2 className="w-4 h-4 animate-spin text-[#8b5cf6] ml-2" />}
               </div>
            </div>

         </div>
      </nav>

      {/* --- HERO (Sadece Masaüstünde veya Arama Yoksa Görünür) --- */}
      {!searchTerm && (
          <section className="relative z-10 pt-8 pb-4 text-center px-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="font-serif text-3xl md:text-5xl font-bold mb-2 md:mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500">
                  Semboller Kütüphanesi
                </h1>
                <p className="text-gray-400 text-xs md:text-base max-w-lg mx-auto">
                  Kadim işaretlerin dilini çöz. Rüyandaki sembolü arat ve anlamını keşfet.
                </p>
            </motion.div>
          </section>
      )}

      {/* --- LİSTE ALANI --- */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 pt-6">
         {loading && terms.length === 0 ? (
             <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#8b5cf6]" />
                <span className="text-xs uppercase tracking-widest">Kütüphane taranıyor...</span>
             </div>
         ) : terms.length === 0 ? (
             <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 mx-4">
                 <p className="text-gray-400 text-lg">"{searchTerm}" hakkında bir şey bulamadık.</p>
                 <Link href="/dashboard" className="inline-flex items-center gap-2 mt-4 text-[#fbbf24] hover:underline font-bold text-sm bg-[#fbbf24]/10 px-4 py-2 rounded-full border border-[#fbbf24]/20">
                    <Sparkles className="w-4 h-4" /> Yapay Zekaya Sor
                 </Link>
             </div>
         ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {terms.map((item, i) => (
                   <Link href={`/sozluk/${item.slug}`} key={i} className="block h-full">
                      <motion.div 
                         initial={{ opacity: 0, y: 10 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: true }}
                         transition={{ delay: i * 0.05 }}
                         className="group relative p-6 h-full rounded-2xl bg-[#0f172a] border border-white/5 hover:border-[#8b5cf6]/50 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col active:scale-95 shadow-lg"
                      >
                         <div className="absolute top-0 right-0 w-20 h-20 bg-[#8b5cf6]/10 blur-2xl rounded-full group-hover:bg-[#8b5cf6]/30 transition-colors"></div>
                         
                         <div className="relative z-10 mb-4 w-10 h-10 rounded-lg bg-black/50 flex items-center justify-center border border-white/10 group-hover:border-[#8b5cf6] transition-colors">
                            <Sparkles className="w-5 h-5 text-gray-400 group-hover:text-[#fbbf24]" />
                         </div>
                         
                         <h3 className="relative z-10 font-serif text-lg md:text-xl font-bold text-white mb-2 group-hover:text-[#fbbf24] transition-colors">
                            {item.term}
                         </h3>
                         <p className="relative z-10 text-xs md:text-sm text-gray-400 leading-relaxed line-clamp-3 group-hover:text-gray-300">
                            {item.description}
                         </p>
                      </motion.div>
                   </Link>
                ))}
             </div>
         )}
      </section>
    </div>
  );
}