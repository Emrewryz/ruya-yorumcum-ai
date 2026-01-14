"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Sparkles, Loader2, Calendar, Star } from "lucide-react";
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

// Mood'a göre Arkaplan Işığı (Glow) ve Kenarlık Rengi
const getMoodStyle = (mood: string) => {
  const m = mood?.toLowerCase() || "";
  if (m.includes("korku") || m.includes("endişe") || m.includes("kabus")) 
    return { border: "group-hover:border-red-500/50", glow: "from-red-900/20", text: "text-red-400" };
  
  if (m.includes("mutlu") || m.includes("huzur") || m.includes("neşe")) 
    return { border: "group-hover:border-emerald-500/50", glow: "from-emerald-900/20", text: "text-emerald-400" };
  
  if (m.includes("gizem") || m.includes("karmaşık") || m.includes("belirsiz")) 
    return { border: "group-hover:border-purple-500/50", glow: "from-purple-900/20", text: "text-purple-400" };
  
  if (m.includes("heyecan")) 
    return { border: "group-hover:border-pink-500/50", glow: "from-pink-900/20", text: "text-pink-400" };

  return { border: "group-hover:border-[#fbbf24]/50", glow: "from-[#fbbf24]/10", text: "text-[#fbbf24]" };
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
    return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-x-hidden selection:bg-purple-500/30">
      
      {/* Atmosfer */}
      <div className="bg-noise"></div>
      
      {/* --- GERİ DÖN BUTONU (SOL ÜST - SABİT) --- */}
      <div className="fixed top-6 left-6 z-50">
         <button 
            onClick={() => router.push('/dashboard')} 
            className="p-3 rounded-full bg-[#0f172a]/80 backdrop-blur-md border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all shadow-lg group"
         >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
         </button>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-24">
        
        {/* --- BAŞLIK & ARAMA --- */}
        <div className="flex flex-col items-center text-center gap-6 mb-20">
           <h1 className="text-5xl md:text-6xl font-serif font-bold text-white tracking-tight">
              Rüya Grimoire'ı
           </h1>
           <p className="text-gray-400 max-w-md mx-auto">
              Bilinçaltının derinliklerine yaptığın yolculukların kaydı.
           </p>

           {/* Arama Barı */}
           <div className="relative w-full max-w-md mt-4 group">
              <div className="absolute inset-0 bg-white/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-full"></div>
              <div className="relative flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 transition-colors group-focus-within:bg-black/40 group-focus-within:border-white/20">
                 <Search className="w-5 h-5 text-gray-500 mr-3" />
                 <input 
                   type="text" 
                   placeholder="Hangi rüyayı arıyorsun?" 
                   className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
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
              <p className="text-sm tracking-widest uppercase opacity-70">Sayfalar Çevriliyor...</p>
           </div>
        ) : filteredDreams.length === 0 ? (
           <div className="text-center py-32 border border-dashed border-white/10 rounded-3xl bg-white/5">
              <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl text-gray-300 font-serif mb-2">Kayıt Bulunamadı</h3>
              {dreams.length === 0 && (
                 <button onClick={() => router.push('/dashboard')} className="mt-4 px-8 py-3 bg-[#fbbf24] rounded-full text-black font-bold text-sm hover:scale-105 transition-transform">
                    İlk Rüyayı Yaz
                 </button>
              )}
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDreams.map((dream, index) => {
                 const moodStyle = getMoodStyle(dream.ai_response?.mood);
                 
                 return (
                    <motion.div
                       key={dream.id}
                       initial={{ opacity: 0, scale: 0.9 }}
                       whileInView={{ opacity: 1, scale: 1 }}
                       viewport={{ once: true, margin: "-50px" }}
                       transition={{ delay: index * 0.05, duration: 0.4 }}
                    >
                       <Link href={`/dashboard/gunluk/${dream.id}`} className="block h-full">
                          
                          {/* KART */}
                          <div className={`relative h-full p-8 rounded-3xl bg-[#0f172a] border border-white/5 ${moodStyle.border} transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group overflow-hidden flex flex-col`}>
                             
                             {/* Mood Gradient (Arka Plan Işığı) */}
                             <div className={`absolute inset-0 bg-gradient-to-br ${moodStyle.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>

                             {/* Tarih & Mood */}
                             <div className="relative z-10 flex justify-between items-center mb-6">
                                <span className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                   <Calendar className="w-3 h-3" /> {formatDate(dream.created_at)}
                                </span>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 ${moodStyle.text}`}>
                                   {dream.ai_response?.mood || "Analiz"}
                                </span>
                             </div>

                             {/* Başlık & Metin */}
                             <div className="relative z-10 flex-1">
                                <h2 className="text-xl font-serif font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-[#fbbf24] transition-colors">
                                   {dream.dream_title || "İsimsiz Rüya"}
                                </h2>
                                <p className="text-gray-400 text-sm font-light leading-relaxed line-clamp-3">
                                   "{dream.dream_text}"
                                </p>
                             </div>

                             {/* Alt İkon (Süsleme) */}
                             <div className="relative z-10 mt-6 pt-6 border-t border-white/5 flex justify-between items-center opacity-50 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-1">
                                   <div className="w-1 h-1 rounded-full bg-gray-500"></div>
                                   <div className="w-1 h-1 rounded-full bg-gray-500"></div>
                                   <div className="w-1 h-1 rounded-full bg-gray-500"></div>
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

      </div>
    </div>
  );
}