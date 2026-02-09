"use client";

import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { 
  Search, Sparkles, BookOpen, ArrowRight, Loader2 
} from "lucide-react";
import AdUnit from "@/components/AdUnit"; // <--- 1. IMPORT

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
  const [user, setUser] = useState<any>(null);

  // 1. Kullanıcıyı ve Verileri Çek
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      let query = supabase
        .from('dream_dictionary')
        .select('term, slug, description')
        .order('term', { ascending: true })
        .limit(100);

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
    <main className="min-h-screen bg-[#020617] text-white font-sans relative overflow-x-hidden selection:bg-[#fbbf24]/30 pb-20 md:pb-32">
      
      {/* --- ATMOSFER --- */}
      <div className="bg-noise fixed inset-0 opacity-[0.04] pointer-events-none z-50"></div>
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#fbbf24]/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      {/* --- HERO & ARAMA ALANI --- */}
      <section className="relative z-10 pt-32 md:pt-40 pb-12 px-4 text-center max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#fbbf24] text-xs font-bold tracking-widest uppercase mb-6 cursor-default">
              <BookOpen className="w-3 h-3" /> Rüya Ansiklopedisi
            </div>

            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6 leading-tight">
              A'dan Z'ye <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] to-[#d97706]">Rüya Sembolleri</span>
            </h1>
            
            {/* Arama Kutusu */}
            <div className="relative max-w-xl mx-auto group mb-12">
                <div className="absolute inset-0 bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
                <div className="relative flex items-center bg-[#0f172a] border border-white/10 rounded-2xl px-6 py-4 shadow-2xl transition-all group-focus-within:border-[#fbbf24]/50">
                    <Search className={`w-6 h-6 mr-4 transition-colors ${loading ? 'text-[#fbbf24] animate-pulse' : 'text-gray-500 group-focus-within:text-[#fbbf24]'}`} />
                    <input 
                      type="text" 
                      placeholder="Ne gördüğünü yaz... (Örn: Yılan)" 
                      className="w-full bg-transparent text-lg text-white placeholder-gray-500 focus:outline-none font-medium"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {loading && <Loader2 className="w-5 h-5 animate-spin text-[#fbbf24] ml-2" />}
                </div>
            </div>

            {/* --- REKLAM 1: ARAMA ALTI (Görüntülü Reklam) --- */}
            <div className="mb-12">
               <AdUnit slot="8565155493" format="auto" />
            </div>

        </motion.div>
      </section>

      {/* --- SÖZLÜK LİSTESİ (SMART GRID) --- */}
      <section className="relative z-10 container mx-auto px-4 md:px-6">
         
         {loading && terms.length === 0 ? (
             <div className="text-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-[#fbbf24] mx-auto mb-4" />
                <p className="text-gray-500 text-sm uppercase tracking-widest">Kütüphane Taranıyor...</p>
             </div>
         ) : terms.length === 0 ? (
             <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10 max-w-2xl mx-auto w-full">
                 <p className="text-gray-400 text-lg mb-4">"{searchTerm}" ile ilgili bir kayıt bulamadık.</p>
                 <Link href="/dashboard" className="inline-flex items-center gap-2 bg-[#fbbf24] text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
                    <Sparkles className="w-4 h-4" /> Yapay Zekaya Sor
                 </Link>
             </div>
         ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                
                {terms.map((item, i) => (
                   <Fragment key={i}>
                      {/* Rüya Kartı */}
                      <Link href={`/sozluk/${item.slug}`} className="group block h-full">
                         <motion.article 
                             initial={{ opacity: 0, y: 20 }}
                             whileInView={{ opacity: 1, y: 0 }}
                             viewport={{ once: true }}
                             className="h-full bg-[#0f172a] rounded-2xl p-6 border border-white/5 hover:border-[#fbbf24]/50 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden shadow-lg"
                          >
                             <div className="absolute top-0 right-0 w-32 h-32 bg-[#fbbf24]/5 rounded-full blur-[60px] group-hover:bg-[#fbbf24]/10 transition-all"></div>
                             <div className="relative z-10">
                                <h3 className="font-serif text-xl font-bold text-white mb-3 group-hover:text-[#fbbf24] transition-colors">
                                   {item.term}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4">
                                   {item.description}
                                </p>
                                <div className="flex items-center text-[#fbbf24] text-xs font-bold uppercase tracking-wider gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                   Tabiri Oku <ArrowRight className="w-3 h-3" />
                                </div>
                             </div>
                          </motion.article>
                      </Link>

                      {/* --- REKLAM 2: AKILLI DÖNGÜ (Her 8 Kartta Bir) --- */}
                      {/* Buraya da Display (Görüntülü) reklam koyuyoruz ki tam otursun */}
                      {(i + 1) % 8 === 0 && (
                         <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 py-8 flex justify-center items-center bg-[#0a0a0a]/50 border-y border-white/5 my-4">
                            <div className="w-full max-w-[970px]">
                                <p className="text-center text-[10px] text-gray-600 mb-2 uppercase tracking-widest">- Sponsorlu -</p>
                                <AdUnit slot="8565155493" format="auto" />
                            </div>
                         </div>
                      )}
                   </Fragment>
                ))}

             </div>
         )}

         {/* --- REKLAM 3: SAYFA SONU (MULTIPLEX) --- */}
         <div className="mt-16 w-full">
             <p className="text-center text-[10px] text-gray-600 mb-2 uppercase tracking-widest">- İlginizi Çekebilir -</p>
             <AdUnit slot="6481917633" format="autorelaxed" />
         </div>

         {/* Liste Sonu Bilgilendirme */}
         {!searchTerm && terms.length > 0 && (
            <div className="text-center mt-8 pb-12">
               <p className="text-gray-500 text-sm">
                  Toplam {terms.length}+ rüya tabiri listeleniyor.
               </p>
            </div>
         )}

      </section>

    </main>
  );
}