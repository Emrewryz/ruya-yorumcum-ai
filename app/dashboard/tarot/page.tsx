"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, RefreshCcw, Moon, MessageCircle, Layers } from "lucide-react";
import { TAROT_DECK } from "@/utils/tarot-deck";
import { readTarot } from "@/app/actions/read-tarot";
import { createClient } from "@/utils/supabase/client";

interface TarotCard {
  id: number;
  name: string;
  image: string;
}

export default function TarotPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [phase, setPhase] = useState<'selection' | 'question' | 'shuffle' | 'pick' | 'reading' | 'result'>('selection');
  const [mode, setMode] = useState<'dream' | 'question'>('question');
  const [question, setQuestion] = useState("");
  const [lastDream, setLastDream] = useState<any>(null);
  
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [revealedGrid, setRevealedGrid] = useState<{[key: number]: TarotCard}>({}); 
  const [readingResult, setReadingResult] = useState<any>(null);

  // Sayfa açılınca son rüyayı kontrol et
  useEffect(() => {
    const fetchLastDream = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('dreams')
                .select('id, dream_title')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            if (data) setLastDream(data);
        }
    };
    fetchLastDream();
  }, []);

  const selectMode = (selectedMode: 'dream' | 'question') => {
      setMode(selectedMode);
      if (selectedMode === 'dream') {
          if (!lastDream) return;
          setQuestion(`Rüya Analizi: ${lastDream.dream_title}`);
          setPhase('shuffle');
          setTimeout(() => setPhase('pick'), 3000);
      } else {
          setPhase('question');
      }
  };

  const startRitual = () => {
    if (!question.trim()) return;
    setPhase('shuffle');
    setTimeout(() => setPhase('pick'), 3000);
  };

  const handleCardPick = (gridIndex: number) => {
    if (selectedCards.length >= 3 || revealedGrid[gridIndex]) return;

    // Haptik titreşim (Mobil cihaz destekliyorsa)
    if (navigator.vibrate) navigator.vibrate(50);

    let randomCard: TarotCard;
    do {
      randomCard = TAROT_DECK[Math.floor(Math.random() * TAROT_DECK.length)];
    } while (selectedCards.find(c => c.id === randomCard.id));

    setRevealedGrid(prev => ({ ...prev, [gridIndex]: randomCard }));
    const newSelection = [...selectedCards, randomCard];
    setSelectedCards(newSelection);

    if (newSelection.length === 3) {
      setTimeout(() => {
        setPhase('reading');
        getReading(newSelection);
      }, 1500);
    }
  };

  const getReading = async (cards: TarotCard[]) => {
    const cardNames = cards.map(c => c.name);
    const dreamId = mode === 'dream' ? lastDream?.id : undefined;
    
    try {
        const result = await readTarot(question, cardNames, dreamId);
        if (result.success) {
            setReadingResult(result.data);
            setPhase('result');
        } else {
            alert("Hata: " + result.error);
            reset();
        }
    } catch (e) {
        alert("Bağlantı hatası.");
        reset();
    }
  };

  const reset = () => {
      setPhase('selection');
      setQuestion('');
      setSelectedCards([]);
      setRevealedGrid({});
      setReadingResult(null);
  };

  return (
    // APP FIX: min-h-[100dvh] ve pb-24 (Mobil menü payı)
    <div className="min-h-[100dvh] bg-[#020617] text-white relative overflow-x-hidden flex flex-col items-center pb-24">
      
      {/* Arka Plan Efekti */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-900/20 rounded-full blur-[80px] md:blur-[120px]" />
         <div className="bg-noise"></div>
      </div>

      {/* APP FIX: Sticky Header (Mobilde kaybolmasın) */}
      <nav className="sticky top-0 w-full z-40 bg-[#020617]/80 backdrop-blur-md border-b border-white/5 px-4 py-3 md:py-6 mb-8 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-serif text-lg md:text-xl tracking-[0.2em] text-[#fbbf24] flex items-center gap-2">
            <Layers className="w-5 h-5" /> TAROT ODASI
        </h1>
        <div className="w-9"></div> {/* Dengeleyici boşluk */}
      </nav>

      {/* --- SAHNE 1: SEÇİM EKRANI (İKİ KAPI) --- */}
      {phase === 'selection' && (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 px-4 relative z-10">
              
              {/* SOL KAPI: RÜYA TAROTU */}
              <motion.div 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  onClick={() => lastDream ? selectMode('dream') : null}
                  className={`p-6 md:p-8 rounded-3xl border transition-all duration-300 group relative overflow-hidden active:scale-95 ${
                      lastDream 
                      ? "bg-[#0f172a] border-purple-500/30 cursor-pointer shadow-lg" 
                      : "bg-gray-900/50 border-gray-800 opacity-50 cursor-not-allowed"
                  }`}
              >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center flex flex-col items-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 md:mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                          <Moon className="w-8 h-8 md:w-10 md:h-10" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-2">Rüyanı Tamamla</h3>
                      <p className="text-gray-400 text-sm mb-4 md:mb-6 leading-relaxed">
                          {lastDream 
                            ? "Son rüyanın gizli mesajlarını kartlarla derinleştir." 
                            : "Önce bir rüya analiz etmelisin."}
                      </p>
                      {lastDream && (
                          <div className="text-[10px] md:text-xs text-purple-300 bg-purple-500/10 py-1.5 px-3 rounded-full inline-block border border-purple-500/20 truncate max-w-full">
                              Son: {lastDream.dream_title}
                          </div>
                      )}
                  </div>
              </motion.div>

              {/* SAĞ KAPI: SORU TAROTU */}
              <motion.div 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  onClick={() => selectMode('question')}
                  className="p-6 md:p-8 rounded-3xl bg-[#0f172a] border border-[#fbbf24]/30 cursor-pointer transition-all duration-300 group relative overflow-hidden active:scale-95"
              >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#fbbf24]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 text-center flex flex-col items-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#fbbf24]/20 flex items-center justify-center mb-4 md:mb-6 text-[#fbbf24] group-hover:scale-110 transition-transform">
                          <MessageCircle className="w-8 h-8 md:w-10 md:h-10" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-2">Kozmik Soru</h3>
                      <p className="text-gray-400 text-sm mb-4 md:mb-6 leading-relaxed">
                          Aşk, kariyer veya gelecek... Aklındaki soruya odaklan.
                      </p>
                      <div className="text-[10px] md:text-xs text-[#fbbf24] bg-[#fbbf24]/10 py-1.5 px-3 rounded-full inline-block border border-[#fbbf24]/20">
                          Niyetini Belirle
                      </div>
                  </div>
              </motion.div>

          </div>
      )}

      {/* --- SAHNE 1.5: SORU GİRİŞİ --- */}
      {phase === 'question' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full px-4 text-center relative z-10 mt-4 md:mt-10"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-gradient-to-tr from-[#fbbf24] to-orange-600 rounded-full flex items-center justify-center mb-6 md:mb-8 shadow-[0_0_50px_rgba(251,191,36,0.4)]">
             <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif mb-4">Niyetini Belirle</h2>
          <p className="text-gray-400 mb-6 md:mb-8 text-sm leading-relaxed">
            Sorunu yaz ve enerjini gönder. Kartlar seni duyacak.
          </p>
          {/* APP FIX: text-base (Zoom engelleme) */}
          <input 
            type="text" 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Örn: Beni neler bekliyor?" 
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-center text-base text-white placeholder-gray-600 focus:border-[#fbbf24]/50 focus:outline-none transition-all mb-8 shadow-inner"
          />
          <button 
            onClick={startRitual}
            disabled={!question}
            className="w-full md:w-auto px-10 py-4 rounded-full bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black font-bold tracking-widest uppercase active:scale-95 transition-transform disabled:opacity-50 disabled:grayscale shadow-lg shadow-amber-500/20"
          >
            Ritüeli Başlat
          </button>
        </motion.div>
      )}

      {/* --- SAHNE 2: KARIŞTIRMA --- */}
      {phase === 'shuffle' && (
        <div className="flex flex-col items-center justify-center mt-10 md:mt-20 relative z-10">
           <div className="relative w-32 h-48 md:w-40 md:h-64">
              {[...Array(5)].map((_, i) => (
                 <motion.div
                    key={i}
                    animate={{ 
                       rotate: [0, 10, -10, 0], 
                       x: [0, 20, -20, 0],
                       scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.05 }}
                    className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border border-[#fbbf24]/30 rounded-xl shadow-2xl"
                    style={{ zIndex: i, backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')" }}
                 />
              ))}
           </div>
           <p className="mt-8 md:mt-12 text-[#fbbf24] font-serif text-base md:text-lg animate-pulse">
               Enerji Karıştırılıyor...
           </p>
        </div>
      )}

      {/* --- SAHNE 3: KART SEÇİMİ (MOBİL GRİD) --- */}
      {phase === 'pick' && (
        <div className="w-full max-w-5xl mt-4 relative z-10 text-center px-2">
           <h3 className="text-lg md:text-xl font-serif text-gray-300 mb-6">
              3 Kart Seç ({selectedCards.length}/3)
           </h3>
           {/* APP FIX: Grid Cols 4 (Mobilde 4'lü sıra, rahat dokunma) */}
           <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-4 perspective-1000 justify-items-center">
              {[...Array(22)].map((_, index) => {
                 const isRevealed = !!revealedGrid[index];
                 const cardData = revealedGrid[index];
                 return (
                   <div key={index} className="w-full aspect-[2/3] max-w-[80px] md:max-w-[100px] relative cursor-pointer group perspective-1000 active:scale-90 transition-transform" onClick={() => handleCardPick(index)}>
                      <motion.div className="w-full h-full relative preserve-3d" initial={{ rotateY: 0 }} animate={{ rotateY: isRevealed ? 180 : 0 }} transition={{ duration: 0.6 }} style={{ transformStyle: "preserve-3d" }}>
                         {/* ARKA YÜZ */}
                         <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border border-[#fbbf24]/30 rounded-lg shadow-md flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-[#fbbf24]/30" />
                         </div>
                         {/* ÖN YÜZ */}
                         <div className="absolute inset-0 w-full h-full backface-hidden rounded-lg overflow-hidden border border-[#fbbf24]/50 bg-black" style={{ transform: "rotateY(180deg)" }}>
                            {cardData && <img src={cardData.image} alt={cardData.name} className="w-full h-full object-cover" />}
                         </div>
                      </motion.div>
                   </div>
                 );
              })}
           </div>
        </div>
      )}

      {/* --- SAHNE 4: YORUMLANIYOR --- */}
      {phase === 'reading' && (
         <div className="flex flex-col items-center justify-center mt-20 md:mt-32 text-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-16 h-16 md:w-20 md:h-20 border-t-2 border-[#fbbf24] rounded-full mb-6 md:mb-8" />
            <h3 className="text-xl md:text-2xl font-serif text-white mb-2">Kartlar Okunuyor...</h3>
            <p className="text-xs md:text-sm text-gray-500">Yapay zeka sembolleri birleştiriyor.</p>
         </div>
      )}

      {/* --- SAHNE 5: SONUÇ --- */}
      {phase === 'result' && readingResult && (
         <div className="w-full max-w-6xl mt-4 relative z-10">
            {/* SEÇİLEN KARTLAR (Mobilde Yatay Scroll) */}
            <div className="flex overflow-x-auto gap-4 px-4 pb-8 snap-x snap-mandatory md:grid md:grid-cols-3 md:justify-items-center md:gap-8 no-scrollbar">
               {selectedCards.map((card, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.2 }} className="flex-shrink-0 w-[60vw] md:w-auto flex flex-col items-center snap-center">
                     <p className="text-[#fbbf24] text-[10px] md:text-xs font-bold tracking-widest uppercase mb-3">{idx === 0 ? "GEÇMİŞ" : idx === 1 ? "ŞİMDİ" : "GELECEK"}</p>
                     <div className="relative w-full aspect-[2/3] max-w-[200px] rounded-2xl overflow-hidden border-2 border-[#fbbf24]/30 shadow-2xl">
                        <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-8 text-center">
                           <span className="text-white font-serif text-sm">{card.name}</span>
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>

            {/* YORUM KARTI */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-12 relative overflow-hidden mx-4 mb-20">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#fbbf24] to-transparent"></div>
               <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                  <div className="flex-1">
                     <div className="flex items-center gap-3 mb-4 md:mb-6">
                        <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-[#fbbf24]" />
                        <h2 className="text-xl md:text-2xl font-serif text-white">Kozmik Yorum</h2>
                     </div>
                     <p className="text-gray-300 leading-relaxed text-sm md:text-lg font-light text-justify">{readingResult.interpretation}</p>
                  </div>
                  <div className="md:w-1/3 space-y-6">
                     <div className="bg-[#fbbf24]/10 rounded-xl p-4 md:p-6 border border-[#fbbf24]/20">
                        <h4 className="text-[#fbbf24] font-bold text-xs uppercase tracking-widest mb-2 md:mb-3">Tavsiye</h4>
                        <p className="text-white text-xs md:text-sm">{readingResult.advice}</p>
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {readingResult.keywords?.map((kw: string, i: number) => (
                           <span key={i} className="px-2 py-1 md:px-3 md:py-1 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-xs text-gray-400">#{kw}</span>
                        ))}
                     </div>
                  </div>
               </div>
               <div className="mt-8 md:mt-12 flex justify-center">
                  <button onClick={reset} className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs md:text-sm font-bold">
                     <RefreshCcw className="w-4 h-4" /> Yeni Açılım Yap
                  </button>
               </div>
            </motion.div>
         </div>
      )}
    </div>
  );
}