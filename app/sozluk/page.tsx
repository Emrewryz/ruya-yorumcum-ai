"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { 
  Search, Sparkles, BookOpen, ArrowRight, Loader2, Flame, BrainCircuit, Moon
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
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans relative overflow-x-hidden selection:bg-amber-500/20 pb-20 md:pb-32">
      
      {/* --- ATMOSFER (Işık) --- */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/5 dark:bg-amber-500/5 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      {/* --- HERO ALANI --- */}
      <section className="relative z-10 pt-32 md:pt-40 pb-12 px-6 text-center max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-amber-600 dark:text-amber-200/80 text-[10px] font-bold tracking-widest uppercase mb-6 cursor-default">
              <BookOpen className="w-3 h-3" /> Rüya Ansiklopedisi
            </div>

            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6 leading-[1.1] tracking-tight text-[var(--text-main)]">
              Bilinçaltı <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 dark:from-amber-200 dark:to-amber-500">Kütüphanesi</span>
            </h1>
            
            <p className="text-[var(--text-muted)] text-sm md:text-base max-w-2xl mx-auto mb-10 leading-relaxed font-light">
               Binlerce rüya sembolünün İslami ve psikolojik karşılıkları. Görmüş olduğunuz sembolü aşağıdan arayabilirsiniz.
            </p>

            {/* Arama Kutusu */}
            <div className="relative max-w-2xl mx-auto group mb-12">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-amber-500/0 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl px-6 py-4 shadow-xl transition-all group-focus-within:border-amber-500/50">
                    <Search className={`w-5 h-5 mr-4 transition-colors ${loading ? 'text-amber-500 animate-pulse' : 'text-slate-500 group-focus-within:text-amber-500'}`} />
                    <input 
                      type="text" 
                      placeholder="Sembol ara... (Örn: Altın, Yılan, Uçmak)" 
                      className="w-full bg-transparent text-base text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {loading && <Loader2 className="w-4 h-4 animate-spin text-amber-500 ml-2" />}
                </div>
            </div>

        </motion.div>
      </section>

      {/* --- ANA İÇERİK --- */}
      <section className="relative z-10 container mx-auto px-4 md:px-6">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* ================= SOL SÜTUN: RÜYA KARTLARI ================= */}
            <div className="lg:col-span-8 space-y-6">
               
                {loading && terms.length === 0 ? (
                    <div className="text-center py-20 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)]">
                      <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-4" />
                      <p className="text-[var(--text-muted)] text-xs uppercase tracking-widest">Arşiv Taranıyor...</p>
                    </div>
                ) : terms.length === 0 ? (
                    <div className="text-center py-16 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)]">
                        <p className="text-[var(--text-muted)] text-sm mb-6">"{searchTerm}" ile ilgili bir kayıt bulamadık.</p>
                        <button onClick={() => router.push('/dashboard')} className="inline-flex items-center gap-2 bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0B0F19] px-6 py-3 rounded-xl font-bold transition-all text-sm shadow-lg shadow-amber-500/20">
                          <Sparkles className="w-4 h-4" /> Yapay Zekaya Yorumlat
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {terms.map((item, i) => (
                        <Link key={i} href={`/sozluk/${item.slug}`} className="group block">
                            <article className="h-full bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-color)] hover:border-amber-500/30 transition-all duration-300 hover:bg-black/5 dark:hover:bg-[#1a1f2e] relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-[40px] group-hover:bg-amber-500/10 transition-all"></div>
                              <div className="relative z-10">
                                  <h3 className="font-serif text-lg font-bold text-[var(--text-main)] mb-2 group-hover:text-amber-500 transition-colors">
                                    {item.term}
                                  </h3>
                                  <p className="text-[var(--text-muted)] text-xs leading-relaxed line-clamp-2 mb-4">
                                    {item.description}
                                  </p>
                                  <div className="flex items-center text-amber-600 dark:text-amber-500/70 text-[10px] font-bold uppercase tracking-wider gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                                    Detaylı Oku <ArrowRight className="w-3 h-3" />
                                  </div>
                              </div>
                            </article>
                        </Link>
                      ))}
                    </div>
                )}
            </div>

            {/* ================= SAĞ SÜTUN: KÜTÜPHANE PANELİ ================= */}
            <aside className="hidden lg:block lg:col-span-4 space-y-6">
                <div className="sticky top-28 space-y-6">
                   
                   {/* 1. Sık Arananlar */}
                   <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6">
                      <div className="flex items-center gap-2 mb-6 border-b border-[var(--border-color)] pb-4">
                         <Flame className="w-4 h-4 text-orange-500" />
                         <h3 className="text-[var(--text-main)] font-serif font-bold text-lg">Sık Arananlar</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {['Yılan', 'Altın', 'Diş Kırılması', 'Kedi', 'Uçmak', 'Deniz', 'Bebek', 'Ağlamak'].map((term, i) => (
                           <button 
                              key={i} 
                              onClick={() => setSearchTerm(term)}
                              className="px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                           >
                              {term}
                           </button>
                         ))}
                      </div>
                   </div>

                   {/* 2. Premium CTA */}
                   <div className="bg-gradient-to-br from-amber-500/10 to-[var(--bg-card)] border border-amber-500/20 rounded-3xl p-6 relative overflow-hidden group">
                      <div className="absolute -top-6 -right-6 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                         <BrainCircuit className="w-32 h-32 text-amber-500" />
                      </div>
                      <div className="relative z-10 space-y-4">
                         <h3 className="text-amber-600 dark:text-amber-400 font-serif font-bold text-lg">Rüyanız Benzersizdir</h3>
                         <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            Sözlükteki genel tabirler yerine, rüyanızın detaylarını yapay zekaya anlatın. Size özel, 3 boyutlu psikolojik analizinizi anında alın.
                         </p>
                         <button onClick={() => router.push('/dashboard')} className="w-full py-3 bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0B0F19] rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 transition-colors flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4" /> Özel Analiz Yaptır
                         </button>
                      </div>
                   </div>

                   {/* 3. DİNAMİK KOZMİK ENERJİ (Ay Evresi Modülü) */}
                   {currentMoon && (
                     <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                           <div className="text-6xl filter blur-sm">{currentMoon.icon}</div>
                        </div>
                        <div className="flex items-center gap-2 mb-4 border-b border-[var(--border-color)] pb-4 relative z-10">
                           <Moon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                           <h3 className="text-[var(--text-main)] font-serif font-bold text-lg">Kozmik Enerji</h3>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                           <div className="text-4xl filter drop-shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                              {currentMoon.icon}
                           </div> 
                           <div>
                              <div className="text-sm font-bold text-[var(--text-main)]">{currentMoon.phase}</div>
                              <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold tracking-widest uppercase mt-0.5">Ayın {currentMoon.age}. Günü</div>
                           </div>
                        </div>
                        
                        {/* Rüyalara Etkisi */}
                        <div className="relative z-10 space-y-2">
                           <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Rüyalara Etkisi</span>
                           <p className="text-xs text-[var(--text-muted)] leading-relaxed italic">
                              {currentMoon.dreamEffect}
                           </p>
                        </div>
                        
                        {/* Sayfaya Yönlendirme */}
                        <Link href="/ay-takvimi" className="relative z-10 mt-4 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                           Detaylı Takvim <ArrowRight className="w-3 h-3" />
                        </Link>
                     </div>
                   )}

                </div>
            </aside>
         </div>
      </section>
    </main>
  );
}