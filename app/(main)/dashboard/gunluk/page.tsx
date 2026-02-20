"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Sparkles, Loader2, Calendar, Star, BookOpen, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";

interface Dream {
  id: string;
  dream_title: string;
  dream_text: string;
  created_at: string;
  ai_response: {
    mood: string;
    mood_score?: number;
  };
}

// Daha doygun, "Midnight Pro" stiline uygun duygu renkleri
const getMoodStyle = (mood: string) => {
  const m = mood?.toLowerCase() || "";
  if (m.includes("korku") || m.includes("endişe") || m.includes("kabus") || m.includes("öfke")) 
    return { border: "border-red-500/20 group-hover:border-red-500/40", bg: "from-red-500/5 to-transparent", text: "text-red-400" };
  
  if (m.includes("mutlu") || m.includes("huzur") || m.includes("neşe") || m.includes("umut")) 
    return { border: "border-emerald-500/20 group-hover:border-emerald-500/40", bg: "from-emerald-500/5 to-transparent", text: "text-emerald-400" };
  
  if (m.includes("gizem") || m.includes("karmaşık") || m.includes("belirsiz") || m.includes("yalnız")) 
    return { border: "border-indigo-500/20 group-hover:border-indigo-500/40", bg: "from-indigo-500/5 to-transparent", text: "text-indigo-400" };
  
  if (m.includes("heyecan") || m.includes("romantik")) 
    return { border: "border-pink-500/20 group-hover:border-pink-500/40", bg: "from-pink-500/5 to-transparent", text: "text-pink-400" };

  return { border: "border-amber-500/20 group-hover:border-amber-500/40", bg: "from-amber-500/5 to-transparent", text: "text-amber-400" };
};

export default function JournalPage() {
  const router = useRouter();
  const supabase = createClient();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDreams = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth'); return; }

      const { data, error } = await supabase
        .from('dreams')
        .select('id, dream_title, dream_text, created_at, ai_response')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error) setDreams(data || []);
      setLoading(false);
    };

    fetchDreams();
  }, [router, supabase]);

  const filteredDreams = dreams.filter(dream => 
    dream.dream_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dream.dream_text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
  };

  return (
    // İÇ İÇE GEÇMEYİ ENGELLEYEN YENİ LAYOUT (Sidebar'sız, relative yapı)
    <div className="relative w-full flex flex-col items-center min-h-[calc(100vh-6rem)] z-10 pb-20 font-sans selection:bg-purple-500/30">
      
      {/* LOKAL ARKAPLAN EFEKTLERİ */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent pointer-events-none -z-10 transform-gpu"></div>
      
      {/* HEADER VE GERİ DÖN BUTONU */}
      <div className="w-full max-w-[1200px] px-4 md:px-0 py-6 flex flex-col items-start mt-2 md:mt-4">
        <button 
           onClick={() => router.back()} 
           className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-bold text-slate-300 hover:text-white uppercase tracking-widest backdrop-blur-md mb-8 transform-gpu"
        >
          <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">Geri Dön</span>
        </button>

        <div className="text-center md:text-left w-full max-w-4xl">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] md:text-xs font-bold uppercase tracking-widest text-amber-400 mb-5 shadow-inner">
              <BookOpen className="w-3.5 h-3.5" /> Bilinçaltı Arşivi
           </div>
           <h1 className="text-4xl md:text-6xl font-serif text-white mb-4 leading-tight">
              Rüya Günlüğü
           </h1>
           <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed font-light mx-auto md:mx-0">
              Gördüğün rüyalar, kaydedilen anılar ve yapay zeka analizlerin. Hepsi bu kadim kütüphanede korunuyor.
           </p>
        </div>
      </div>

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-0 pt-6 relative z-10 flex flex-col">
        
        {/* ÜST KISIM: ARAMA & DİĞER GEÇMİŞ BUTONLARI */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-10 md:mb-14">
            
            {/* Arama Alanı (Premium) */}
            <div className="relative w-full md:max-w-md group">
              <div className="absolute inset-0 bg-white/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
              <div className="relative flex items-center bg-[#0a0c10] border border-white/10 rounded-2xl px-5 py-3 md:py-4 transition-colors group-focus-within:border-amber-500/50 shadow-inner">
                  <Search className="w-5 h-5 text-slate-500 mr-3 group-focus-within:text-amber-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Hangi rüyayı arıyorsun?" 
                    className="w-full bg-transparent text-sm md:text-base text-white placeholder-slate-600 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
            </div>

            {/* Tarot Geçmişi Butonu */}
            <button 
                onClick={() => router.push('/dashboard/tarot/gecmis')} 
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 md:py-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest hover:bg-indigo-500/20 transition-all active:scale-95 shadow-inner"
            >
                <Layers className="w-4 h-4" /> 
                <span>Tarot Geçmişi</span>
            </button>
        </div>
        
        {/* --- GRID ALANI (KARTLAR) --- */}
        {loading ? (
           <div className="flex flex-col items-center justify-center py-20 text-amber-500/70 w-full">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="text-xs md:text-sm tracking-widest uppercase font-mono">Sayfalar Çevriliyor...</p>
           </div>
        ) : filteredDreams.length === 0 ? (
           <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
             className="text-center py-24 px-8 border border-white/5 rounded-[2.5rem] bg-[#131722]/60 backdrop-blur-md mx-auto max-w-lg w-full shadow-2xl"
           >
              <div className="w-20 h-20 bg-[#0a0c10] border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner rotate-3">
                 <Sparkles className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-2xl text-white font-serif mb-3">Kayıt Bulunamadı</h3>
              <p className="text-slate-400 text-sm font-light mb-8">Henüz analiz edilmiş bir rüyanız yok veya aramanızla eşleşen sonuç bulunamadı.</p>
              
              {dreams.length === 0 && (
                 <button onClick={() => router.push('/dashboard/ruya-analizi')} className="px-8 py-4 bg-white text-[#0a0c10] rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all shadow-[0_10px_20px_rgba(255,255,255,0.1)] active:scale-95 mx-auto flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> İlk Rüyayı Yorumla
                 </button>
              )}
           </motion.div>
        ) : (
           // KARTLAR DİZİLİMİ (Bento Mantığı)
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {filteredDreams.map((dream, index) => {
                 const moodStyle = getMoodStyle(dream.ai_response?.mood);
                 
                 return (
                    <motion.div
                       key={dream.id}
                       initial={{ opacity: 0, y: 20 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true, margin: "-20px" }}
                       transition={{ delay: index * 0.05, duration: 0.4 }}
                       className="h-full transform-gpu"
                    >
                       <Link href={`/dashboard/gunluk/${dream.id}`} className="block h-full">
                           <div className={`relative h-full p-6 md:p-8 rounded-[2rem] bg-[#131722]/80 backdrop-blur-xl border ${moodStyle.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer group overflow-hidden flex flex-col`}>
                              
                              {/* Arkaplan Glow Gradient */}
                              <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${moodStyle.bg} opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>

                              {/* Tarih & Mood Tag */}
                              <div className="relative z-10 flex justify-between items-start mb-6">
                                  <span className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest bg-[#0a0c10] px-3 py-1.5 rounded-lg border border-white/5">
                                     <Calendar className="w-3.5 h-3.5" /> {formatDate(dream.created_at)}
                                  </span>
                                  <span className={`text-[9px] md:text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest border border-white/5 bg-black/40 backdrop-blur-md ${moodStyle.text}`}>
                                     {dream.ai_response?.mood || "Analiz"}
                                  </span>
                              </div>

                              {/* Başlık & Metin */}
                              <div className="relative z-10 flex-1 flex flex-col">
                                  <h2 className="text-xl md:text-2xl font-serif font-bold text-white mb-3 line-clamp-1 leading-tight group-hover:text-amber-400 transition-colors">
                                     {dream.dream_title || "İsimsiz Rüya"}
                                  </h2>
                                  <p className="text-slate-400 text-xs md:text-sm font-light leading-relaxed line-clamp-3 italic mb-6">
                                     "{dream.dream_text}"
                                  </p>
                              </div>

                              {/* Alt İkon (Süsleme) */}
                              <div className="relative z-10 mt-auto pt-5 border-t border-white/5 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
                                  <div className="flex gap-1.5">
                                     <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                                     <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                                 </div>
                                 <Star className={`w-4 h-4 ${moodStyle.text}`} />
                              </div>

                           </div>
                       </Link>
                    </motion.div>
                 );
              })}
           </div>
        )}

      </main>
    </div>
  );
}