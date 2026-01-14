"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { Search, Eye, Sparkles, BookOpen } from "lucide-react";

// Veri Tipi
interface DictionaryItem {
  term: string;
  slug: string;
  description: string;
}

export default function DictionaryPage() {
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
        .order('term', { ascending: true }); // A-Z sırala

      // Arama yapılıyorsa filtrele
      if (searchTerm) {
        query = query.ilike('term', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (!error && data) {
        setTerms(data);
      }
      setLoading(false);
    };

    // Arama yaparken çok istek gitmesin diye ufak gecikme (debounce)
    const timer = setTimeout(() => {
      fetchTerms();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, supabase]);

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans relative overflow-x-hidden selection:bg-purple-500/30">
      
      <div className="bg-noise"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#8b5cf6]/10 blur-[150px] rounded-full pointer-events-none"></div>

      {/* NAV */}
      <nav className="relative z-20 container mx-auto px-6 py-6 flex justify-between items-center">
         <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <BookOpen className="w-5 h-5" />
            <span className="font-serif font-bold">RüyaYorumcum</span>
         </Link>
         <Link href="/dashboard" className="px-4 py-2 rounded-full bg-white/10 text-xs font-bold hover:bg-white/20 transition-colors">Panele Dön</Link>
      </nav>

      {/* HERO & ARAMA */}
      <section className="relative z-10 pt-10 pb-12 text-center px-4">
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500 pb-2">
              Semboller Kütüphanesi
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Kadim işaretlerin dilini çöz. Rüyandaki sembolü arat ve anlamını keşfet.
            </p>
         </motion.div>

         <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-0 bg-[#8b5cf6] blur-xl opacity-20 group-focus-within:opacity-40 transition-opacity rounded-full"></div>
            <div className="relative flex items-center bg-white/5 backdrop-blur-xl border border-[#8b5cf6] rounded-full px-6 py-4 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
               <Eye className="w-6 h-6 text-[#8b5cf6] animate-pulse-slow mr-4" />
               <input 
                 type="text" 
                 placeholder="Rüyandaki işareti yaz... (Yılan, Diş, Uçmak)" 
                 className="w-full bg-transparent text-lg text-white placeholder-gray-500 focus:outline-none font-medium"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
               <Search className="w-5 h-5 text-gray-500" />
            </div>
         </div>
      </section>

      {/* TERİM LİSTESİ */}
      <section className="relative z-10 container mx-auto px-6 pb-24">
         {loading ? (
             <div className="text-center py-20 text-gray-500">Kütüphane taranıyor...</div>
         ) : terms.length === 0 ? (
             <div className="text-center py-20">
                 <p className="text-gray-400 text-lg">Aradığınız kelimeye uygun bir terim bulamadık.</p>
                 <Link href="/dashboard" className="inline-block mt-4 text-[#fbbf24] hover:underline">Yapay Zekaya Sor &rarr;</Link>
             </div>
         ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {terms.map((item, i) => (
                   <Link href={`/sozluk/${item.slug}`} key={i}>
                      <motion.div 
                          whileHover={{ y: -5 }}
                          className="group relative p-6 h-full rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
                      >
                          <div className="absolute top-0 right-0 w-20 h-20 bg-[#8b5cf6]/20 blur-2xl rounded-full group-hover:bg-[#8b5cf6]/40 transition-colors"></div>
                          
                          <div className="relative z-10 mb-4 w-10 h-10 rounded-lg bg-black/50 flex items-center justify-center border border-white/10 group-hover:border-[#8b5cf6] transition-colors">
                             <Sparkles className="w-5 h-5 text-gray-400 group-hover:text-[#fbbf24]" />
                          </div>
                          
                          <h3 className="relative z-10 font-serif text-xl font-bold text-white mb-2 group-hover:text-[#fbbf24] transition-colors">
                             {item.term}
                          </h3>
                          <p className="relative z-10 text-sm text-gray-400 leading-relaxed line-clamp-3 group-hover:text-gray-300">
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