"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, Sparkles, X, Eye, Moon, Star, Heart, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

// İkon Eşleştirme Yardımcısı
const getIcon = (type: string) => {
  if (type === 'dream_special') return <Moon className="w-4 h-4 text-amber-400" />;
  if (type === 'love') return <Heart className="w-4 h-4 text-rose-400" />;
  if (type === 'single_card') return <Star className="w-4 h-4 text-sky-400" />;
  return <Layers className="w-4 h-4 text-indigo-400" />;
};

// Başlık Eşleştirme
const getTitle = (type: string) => {
    if (type === 'dream_special') return "Rüya Analizi";
    if (type === 'love') return "Aşk ve Uyum";
    if (type === 'single_card') return "Tek Kart Rehberlik";
    return "Genel Açılım";
};

export default function TarotHistoryPage() {
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReading, setSelectedReading] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchReadings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tarot_readings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setReadings(data);
      setLoading(false);
    };

    fetchReadings();
  }, []);

  // Yorum metnini güvenli parse etme fonksiyonu
  const parseInterpretation = (data: any) => {
      if (typeof data === 'string') {
          try { return JSON.parse(data); } catch { return {}; }
      }
      return data || {};
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30 relative">
      {/* Arkaplan Efektleri */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 -z-10" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      {/* Header */}
      <nav className="p-6 max-w-6xl mx-auto flex items-center gap-4 relative z-20">
        <button onClick={() => router.back()} className="p-3 rounded-full bg-slate-800/50 hover:bg-slate-700 border border-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-serif text-white tracking-wide">Ruhsal Arşivim</h1>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pb-20 relative z-10">
        
        {loading ? (
            <div className="flex flex-col items-center justify-center mt-32">
                <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 text-sm">Kayıtlar getiriliyor...</p>
            </div>
        ) : readings.length === 0 ? (
            <div className="text-center mt-32 opacity-50">
                <Sparkles className="w-16 h-16 mx-auto mb-6 text-slate-700" />
                <h3 className="text-xl font-serif text-slate-400 mb-2">Henüz Yolculuk Başlamadı</h3>
                <p className="text-slate-600 text-sm">Hiç tarot açılımı yapmadınız.</p>
                <button onClick={() => router.push('/dashboard/tarot')} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-500 transition-colors">
                    İlk Falına Bak
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {readings.map((reading, idx) => {
                    const content = parseInterpretation(reading.interpretation);
                    
                    return (
                        <motion.div 
                            key={reading.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelectedReading({ ...reading, content })}
                            className="group cursor-pointer bg-[#0f172a]/60 border border-white/5 hover:border-indigo-500/30 hover:bg-[#1e293b]/60 rounded-3xl p-6 transition-all duration-300 relative overflow-hidden backdrop-blur-sm"
                        >
                             {/* Hover Glow */}
                             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-500"></div>

                             <div className="relative z-10">
                                 <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-2xl bg-slate-900 border border-white/5 group-hover:border-white/10 transition-colors">
                                            {getIcon(reading.spread_type)}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-200">{getTitle(reading.spread_type)}</h4>
                                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                                                {format(new Date(reading.created_at), 'd MMMM yyyy', { locale: tr })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-2 rounded-full hover:bg-white/5 transition-colors">
                                        <Eye className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                                    </div>
                                 </div>

                                 <div className="h-px w-full bg-white/5 mb-4"></div>

                                 <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed font-light italic">
                                    "{content.summary || "Detaylı yorum için tıklayınız..."}"
                                 </p>
                                 
                                 <div className="flex flex-wrap gap-2 mt-5">
                                    {content.keywords?.slice(0, 2).map((kw: string, i: number) => (
                                        <span key={i} className="text-[10px] px-3 py-1 rounded-full bg-white/5 border border-white/5 text-slate-400">
                                            #{kw}
                                        </span>
                                    ))}
                                    {content.keywords?.length > 2 && (
                                        <span className="text-[10px] px-2 py-1 text-slate-600">+{content.keywords.length - 2}</span>
                                    )}
                                 </div>
                             </div>
                        </motion.div>
                    )
                })}
            </div>
        )}

      </main>

      {/* --- DETAY MODALI --- */}
      <AnimatePresence>
        {selectedReading && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                onClick={() => setSelectedReading(null)}
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#0c0a09] border border-white/10 w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-[2rem] shadow-2xl scrollbar-hide relative"
                >
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-[#0c0a09]/90 backdrop-blur-xl border-b border-white/5 p-6 flex justify-between items-center z-10">
                        <div className="flex items-center gap-3">
                             <div className="p-2 rounded-lg bg-white/5 text-indigo-400">
                                {getIcon(selectedReading.spread_type)}
                             </div>
                             <div>
                                 <h3 className="text-lg font-serif text-white">{getTitle(selectedReading.spread_type)}</h3>
                                 <p className="text-xs text-slate-500">{format(new Date(selectedReading.created_at), 'd MMMM yyyy HH:mm', { locale: tr })}</p>
                             </div>
                        </div>
                        <button onClick={() => setSelectedReading(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-8">
                        {/* Kartlar */}
                        <div className="mb-8">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Seçilen Kartlar</h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedReading.card_name.split(',').map((card: string, i: number) => (
                                    <span key={i} className="px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-serif">
                                        {card.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Özet */}
                        {selectedReading.content.summary && (
                            <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl mb-8">
                                <h4 className="text-amber-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> Özet
                                </h4>
                                <p className="text-slate-300 italic leading-relaxed">
                                    "{selectedReading.content.summary}"
                                </p>
                            </div>
                        )}

                        {/* Yorum */}
                        <div className="prose prose-invert max-w-none">
                            <h4 className="text-xl font-serif text-white mb-4">Kozmik Yorum</h4>
                            <div className="text-slate-300 font-light leading-8 space-y-4 text-justify">
                                {selectedReading.content.interpretation?.split('\n').map((p: string, i: number) => (
                                    p.trim() && <p key={i}>{p}</p>
                                ))}
                            </div>
                        </div>

                        {/* Tavsiye */}
                        <div className="mt-10 pt-8 border-t border-white/10">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Rehber Tavsiyesi</h4>
                            <p className="text-white text-lg font-serif">
                                "{selectedReading.content.advice}"
                            </p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}