"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Lock, Loader2, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeDreamGuest } from "@/app/actions/analyze-dream-guest";

export default function HeroDreamInput() {
  const router = useRouter();
  const [dream, setDream] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!dream.trim() || dream.length < 5) return;
    setLoading(true);

    const res = await analyzeDreamGuest(dream);
    
    if (res.success && res.hook) {
      setResult(res.hook);
      if (typeof window !== 'undefined') {
          localStorage.setItem("pending_dream", dream);
      }
    }
    setLoading(false);
  };

  const handleRegisterRedirect = () => {
    router.push("/auth?redirect=dashboard");
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative z-20 mt-8 mb-12 px-4 md:px-0">
      <AnimatePresence mode="wait">
        
        {/* --- DURUM 1: GİRİŞ EKRANI (Aynı kalıyor) --- */}
        {!result ? (
          <motion.div 
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            {/* ... (Burası önceki kodundaki gibi, sadece buton input içinde) ... */}
            <div className="relative group rounded-[2rem] p-[2px] bg-gradient-to-br from-[#fbbf24] via-[#d97706] to-transparent shadow-[0_0_40px_-10px_rgba(251,191,36,0.2)]">
                <div className="relative bg-[#0f172a] rounded-[1.9rem] overflow-hidden">
                    <textarea 
                        value={dream}
                        onChange={(e) => setDream(e.target.value)}
                        disabled={loading}
                        placeholder="Dün gece rüyanda ne gördün? Detaylıca anlat..."
                        className="w-full min-h-[180px] bg-transparent text-lg md:text-xl text-white placeholder-gray-500 font-medium border-none outline-none resize-none p-6 pb-24 scrollbar-none selection:bg-[#fbbf24]/30"
                    />
                    <div className="absolute bottom-6 left-6 flex items-center gap-2 text-xs text-gray-500 font-medium">
                       <Lock className="w-3 h-3" /> Gizli & Anonim
                    </div>
                    <div className="absolute bottom-3 right-3">
                        <button
                            onClick={handleAnalyze}
                            disabled={loading || dream.length < 5}
                            className="bg-[#fbbf24] hover:bg-[#f59e0b] text-black font-extrabold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            {loading ? "Odaklanılıyor..." : "YORUMLA"}
                        </button>
                    </div>
                </div>
            </div>
          </motion.div>
        ) : (
          
          /* --- DURUM 2: YARI KESİLMİŞ SONUÇ KARTI --- */
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full relative"
          >
            <div className="bg-[#0f172a] border border-[#fbbf24]/30 rounded-[2rem] overflow-hidden shadow-2xl relative">
              
              <div className="p-8 md:p-10 relative">
                 
                 {/* Başlık */}
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#fbbf24]/20 flex items-center justify-center border border-[#fbbf24]/30">
                        <BookOpen className="w-5 h-5 text-[#fbbf24]" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg">Rüya Analiz Özeti</h3>
                        <p className="text-gray-400 text-xs">Yapay Zeka & İslami Kaynaklar</p>
                    </div>
                 </div>

                 {/* --- CAN ALICI NOKTA: YARI KESİLMİŞ METİN --- */}
                 <div className="relative">
                    <p className="text-xl md:text-2xl text-gray-200 font-serif leading-relaxed">
                        "{result}
                        <span className="opacity-50"> bu durumun hayatınıza etkisi ise tahmin ettiğinizden çok daha...</span>"
                    </p>
                    
                    {/* Bu gradient metnin sonunu silikleştirir */}
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#0f172a] to-transparent"></div>
                 </div>

                 {/* Bulanık Devam Kısmı (Görsel Doldurma) */}
                 <div className="mt-4 space-y-3 opacity-30 filter blur-sm select-none grayscale">
                    <p className="text-sm text-gray-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.</p>
                    <div className="w-3/4 h-3 bg-gray-600 rounded"></div>
                    <div className="w-1/2 h-3 bg-gray-600 rounded"></div>
                 </div>

                 {/* CTA BUTONU */}
                 <div className="mt-8 flex justify-center">
                    <button 
                        onClick={handleRegisterRedirect}
                        className="w-full md:w-auto bg-[#fbbf24] hover:bg-[#f59e0b] text-black font-bold text-base px-8 py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:scale-105 transition-all"
                    >
                        <span>Cümlenin Devamını Gör ve Analizi Tamamla</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                 </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}