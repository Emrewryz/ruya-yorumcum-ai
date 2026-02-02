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

const getMoodStyle = (mood: string) => {
  const m = mood?.toLowerCase() || "";
  if (m.includes("korku") || m.includes("endişe") || m.includes("kabus")) 
    return { border: "border-red-500/30", bg: "bg-red-950/10", text: "text-red-400" };
  
  if (m.includes("mutlu") || m.includes("huzur") || m.includes("neşe")) 
    return { border: "border-emerald-500/30", bg: "bg-emerald-950/10", text: "text-emerald-400" };
  
  if (m.includes("gizem") || m.includes("karmaşık") || m.includes("belirsiz")) 
    return { border: "border-purple-500/30", bg: "bg-purple-950/10", text: "text-purple-400" };
  
  if (m.includes("heyecan")) 
    return { border: "border-pink-500/30", bg: "bg-pink-950/10", text: "text-pink-400" };

  return { border: "border-[#fbbf24]/30", bg: "bg-amber-950/10", text: "text-[#fbbf24]" };
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
    // APP FIX: min-h-[100dvh] ve pb-24 (mobilde alt bar için boşluk)
    <div className="min-h-[100dvh] bg-[#020617] text-white relative overflow-x-hidden selection:bg-purple-500/30 pb-24 md:pb-32">
      
      {/* Atmosfer */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#4c1d95]/10 to-transparent"></div>
         <div className="bg-noise opacity-20"></div>
      </div>
      
      {/* HEADER (Sticky) */}
      <nav className="sticky top-0 z-30 w-full bg-[#020617]/80 backdrop-blur-md border-b border-white/5 px-4 py-3 md:py-6 mb-6 md:mb-8 flex items-center justify-between">
        <button onClick={() => router.push('/dashboard')} className="p-2 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-all border border-white/5">
          <ArrowLeft className="w-5 h-5 text-gray-300" />
        </button>
        <h1 className="font-serif text-sm md:text-xl tracking-[0.2em] text-[#fbbf24] flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> RÜYA GÜNLÜĞÜ
        </h1>
        <div className="w-9"></div> {/* Dengeleyici */}
      </nav>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Üst Kısım: Tarot Butonu ve Arama */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-12">
            
            {/* Tarot Geçmişi Butonu (Mobilde Tam Genişlik) */}
            <button 
                onClick={() => router.push('/dashboard/tarot/gecmis')} 
                className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest hover:bg-indigo-500/20 transition-all active:scale-95"
            >
                <Layers className="w-4 h-4" /> 
                <span>Tarot Geçmişi</span>
            </button>

            {/* Arama Alanı */}
            <div className="relative w-full md:max-w-md group">
              <div className="absolute inset-0 bg-white/5 blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity rounded-full"></div>
              <div className="relative flex items-center bg-[#0f172a] border border-white/10 rounded-full px-4 py-2.5 md:px-5 md:py-3 transition-colors group-focus-within:border-[#fbbf24]/50">
                  <Search className="w-4 h-4 text-gray-500 mr-3" />
                  <input 
                    type="text" 
                    placeholder="Hangi rüyayı arıyorsun?" 
                    className="w-full bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
            </div>
        </div>
        
        {/* --- GRID ALANI (KARTLAR) --- */}
        {loading ? (
           <div className="flex flex-col items-center justify-center py-20 text-purple-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="text-xs md:text-sm tracking-widest uppercase opacity-70">Sayfalar Çevriliyor...</p>
           </div>
        ) : filteredDreams.length === 0 ? (
           <div className="text-center py-20 px-6 border border-dashed border-white/10 rounded-3xl bg-white/5 mx-auto max-w-sm">
              <Sparkles className="w-10 h-10 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg text-gray-300 font-serif mb-2">Kayıt Bulunamadı</h3>
              {dreams.length === 0 && (
                 <button onClick={() => router.push('/dashboard')} className="mt-4 px-6 py-2 bg-[#fbbf24] rounded-full text-black font-bold text-xs uppercase tracking-wide hover:scale-105 transition-transform active:scale-95">
                    İlk Rüyayı Yaz
                 </button>
              )}
           </div>
        ) : (
           // MOBİLDE TEK KOLON, TABLETTE 2, PCDE 3
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredDreams.map((dream, index) => {
                 const moodStyle = getMoodStyle(dream.ai_response?.mood);
                 
                 return (
                    <motion.div
                       key={dream.id}
                       initial={{ opacity: 0, y: 20 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true, margin: "-20px" }}
                       transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                       <Link href={`/dashboard/gunluk/${dream.id}`} className="block h-full">
                           <div className={`relative h-full p-5 md:p-6 rounded-2xl bg-[#0f172a] border ${moodStyle.border} transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] cursor-pointer group overflow-hidden flex flex-col shadow-lg active:scale-[0.98]`}>
                              
                              {/* Arkaplan Glow */}
                              <div className={`absolute inset-0 ${moodStyle.bg} opacity-50 group-hover:opacity-70 transition-opacity`}></div>

                              {/* Tarih & Mood */}
                              <div className="relative z-10 flex justify-between items-center mb-3 md:mb-4">
                                  <span className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                                     <Calendar className="w-3 h-3" /> {formatDate(dream.created_at)}
                                  </span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/20 border border-white/5 ${moodStyle.text}`}>
                                     {dream.ai_response?.mood || "Analiz"}
                                  </span>
                              </div>

                              {/* Başlık & Metin */}
                              <div className="relative z-10 flex-1">
                                  <h2 className="text-base md:text-lg font-serif font-bold text-white mb-2 line-clamp-1 leading-tight group-hover:text-[#fbbf24] transition-colors">
                                     {dream.dream_title || "İsimsiz Rüya"}
                                  </h2>
                                  <p className="text-gray-400 text-xs md:text-sm font-light leading-relaxed line-clamp-3">
                                     "{dream.dream_text}"
                                  </p>
                              </div>

                              {/* Alt Süsleme */}
                              <div className="relative z-10 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/5 flex justify-between items-center opacity-60">
                                  <div className="flex gap-1">
                                     <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                                     <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                                     <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                                  </div>
                                  <Star className={`w-3 h-3 ${moodStyle.text}`} />
                              </div>

                           </div>
                       </Link>
                    </motion.div>
                 );
              })}
           </div>
        )}

      </div>
    </div>
  );
}