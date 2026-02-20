"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, RefreshCcw, Layers, Star, Heart, Moon, Lock, Info, Zap,Loader2 } from "lucide-react";
import { TAROT_DECK } from "@/utils/tarot-deck";
import { readTarot } from "@/app/actions/read-tarot";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

// --- TASARIM KONFİGÜRASYONU ---
const SPREAD_CONFIG = [
  {
    id: 'dream_special',
    name: "Rüya Analizi",
    desc: "Bilinçaltınızın gizli mesajlarını çözün.",
    icon: <Moon className="w-5 h-5 md:w-6 md:h-6" />,
    count: 3,
    theme: {
      border: "border-purple-500/30 group-hover:border-purple-400/60",
      bg: "bg-purple-950/20 group-hover:bg-purple-900/30",
      iconBg: "bg-purple-500/10 text-purple-400",
      glow: "shadow-[0_0_30px_rgba(168,85,247,0.15)] group-hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]",
      accent: "text-purple-400",
      ambient: "from-purple-900/10 via-[#0a0c10] to-[#0a0c10]"
    }
  },
  {
    id: 'three_card',
    name: "Zamanın Çizgisi",
    desc: "Geçmiş, şimdi ve gelecekteki ruhsal yolculuğunuz.",
    icon: <Layers className="w-5 h-5 md:w-6 md:h-6" />,
    count: 3,
    theme: {
      border: "border-indigo-500/30 group-hover:border-indigo-400/60",
      bg: "bg-indigo-950/20 group-hover:bg-indigo-900/30",
      iconBg: "bg-indigo-500/10 text-indigo-400",
      glow: "shadow-[0_0_30px_rgba(99,102,241,0.15)] group-hover:shadow-[0_0_40px_rgba(99,102,241,0.3)]",
      accent: "text-indigo-400",
      ambient: "from-indigo-900/10 via-[#0a0c10] to-[#0a0c10]"
    }
  },
  {
    id: 'single_card',
    name: "Tek Kart Rehber",
    desc: "Net ve spesifik bir soru için anlık kozmik ışık.",
    icon: <Star className="w-5 h-5 md:w-6 md:h-6" />,
    count: 1,
    theme: {
      border: "border-amber-500/30 group-hover:border-amber-400/60",
      bg: "bg-amber-950/20 group-hover:bg-amber-900/30",
      iconBg: "bg-amber-500/10 text-amber-400",
      glow: "shadow-[0_0_30px_rgba(245,158,11,0.15)] group-hover:shadow-[0_0_40px_rgba(245,158,11,0.3)]",
      accent: "text-amber-400",
      ambient: "from-amber-900/10 via-[#0a0c10] to-[#0a0c10]"
    }
  },
  {
    id: 'love',
    name: "Aşk ve Uyum",
    desc: "İlişkinizin enerjisi ve kalbinizin izleyeceği yol.",
    icon: <Heart className="w-5 h-5 md:w-6 md:h-6" />,
    count: 3,
    theme: {
      border: "border-rose-500/30 group-hover:border-rose-400/60",
      bg: "bg-rose-950/20 group-hover:bg-rose-900/30",
      iconBg: "bg-rose-500/10 text-rose-400",
      glow: "shadow-[0_0_30px_rgba(244,63,94,0.15)] group-hover:shadow-[0_0_40px_rgba(244,63,94,0.3)]",
      accent: "text-rose-500",
      ambient: "from-rose-900/10 via-[#0a0c10] to-[#0a0c10]"
    }
  }
];

function TarotPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [phase, setPhase] = useState<'type_select' | 'intention' | 'shuffle' | 'spread' | 'reading' | 'result'>('type_select');
  const [selectedSpread, setSelectedSpread] = useState<any>(SPREAD_CONFIG[1]); 
  const [intention, setIntention] = useState("");
  const [deckOrder, setDeckOrder] = useState<number[]>([]); 
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [readingResult, setReadingResult] = useState<any>(null);
  const [latestDream, setLatestDream] = useState<any>(null);

  useEffect(() => {
    const processGuestReading = async () => {
      const pendingData = localStorage.getItem('pending_tarot_reading');
      
      if (pendingData) {
        try {
          const parsedData = JSON.parse(pendingData);
          if (!parsedData.cards || !Array.isArray(parsedData.cards)) throw new Error("Geçersiz fal verisi");

          setPhase('reading');
          const targetSpread = SPREAD_CONFIG.find(s => s.id === 'three_card') || SPREAD_CONFIG[1];
          setSelectedSpread(targetSpread);
          setIntention(parsedData.question || "Genel Bakış");

          const guestCardNames = parsedData.cards.map((c: any) => c.name);
          const selectedCardsData = parsedData.cards.map((guestCard: any) => {
             return TAROT_DECK.find(master => 
                master.searchKey === guestCard.id || 
                master.name.toLowerCase() === guestCard.name.toLowerCase()
             ) || TAROT_DECK[0]; 
          });

          const result = await readTarot(parsedData.question, guestCardNames, 'three_card', undefined);

          if (result.success) {
            setReadingResult({ ...result.data, selectedCardsData });
            setPhase('result');
            toast.success("Misafir falınız tamamlandı! (Hesabınıza işlendi)");
            localStorage.removeItem('pending_tarot_reading');
          } else {
             handleApiError(result);
          }
        } catch (error) {
          setPhase('type_select');
          localStorage.removeItem('pending_tarot_reading'); 
        }
      }
    };
    processGuestReading();
  }, []);

  useEffect(() => {
    const checkLatestDream = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('dreams')
            .select('id, dream_title, dream_text, ai_response') 
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (data) {
             setLatestDream({ 
                 id: data.id,
                 title: data.dream_title || "Adsız Rüya", 
                 description: data.dream_text || data.ai_response?.summary 
             });
        }
      } catch (e) {}
    };
    checkLatestDream();
  }, []);

  const handleApiError = (result: any) => {
    const errCode = result.code || result.error;
    if (errCode === 'NO_CREDIT') {
        toast.error("Yetersiz Bakiye", {
            description: "Analiz için krediniz yetersiz.",
            action: { label: "Yükle", onClick: () => router.push("/dashboard/pricing") },
            duration: 5000
        });
        setPhase('type_select');
    } else {
        toast.error(result.message || "Bir hata oluştu.");
        setPhase('type_select');
    }
  };

  const shuffleDeck = () => {
    const array = Array.from({ length: TAROT_DECK.length }, (_, i) => i);
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    setDeckOrder(array);
    setSelectedIndices([]);
  };

  const handleBackNavigation = () => {
    if (phase === 'type_select') router.back();
    else if (phase === 'result') reset();
    else setPhase('type_select');
  };

  const handleSelectSpread = (spread: any) => {
    if (spread.id === 'dream_special' && !latestDream) return;
    setSelectedSpread(spread);
    shuffleDeck();

    if (spread.id === 'dream_special') {
        setIntention(`Son gördüğüm rüya (${latestDream.title || 'Adsız'}) bana ne anlatmak istiyor?`);
        setPhase('shuffle'); 
        setTimeout(() => setPhase('spread'), 2000);
    } else {
        setPhase('intention');
    }
  };

  const handleStartRitual = () => {
    if (!intention.trim()) return;
    setPhase('shuffle');
    setTimeout(() => setPhase('spread'), 2500); 
  };

  const handleCardClick = (deckIndex: number) => {
    if (selectedIndices.includes(deckIndex) || selectedIndices.length >= selectedSpread.count) return;
    if (navigator.vibrate) navigator.vibrate(40);
    
    const newSelection = [...selectedIndices, deckIndex];
    setSelectedIndices(newSelection);
    
    if (newSelection.length === selectedSpread.count) {
        setTimeout(() => getReading(newSelection), 1500);
    }
  };

  const getReading = async (indices: number[]) => {
    setPhase('reading');
    
    const selectedCardsData = indices.map(idx => TAROT_DECK[deckOrder[idx] % TAROT_DECK.length]);
    const cardNames = selectedCardsData.map(c => c.name);
    
    let finalQuestion = intention;
    if (selectedSpread.id === 'dream_special' && latestDream) {
        finalQuestion += ` (RÜYA İÇERİĞİ: ${latestDream.description})`;
    }

    try {
        const result = await readTarot(finalQuestion, cardNames, selectedSpread.id, latestDream?.id || undefined);
        
        if (result.success) {
            setReadingResult({ ...result.data, selectedCardsData });
            setPhase('result');
            toast.success("Kartlar yorumlandı! (2 Kredi düştü)");
        } else {
            handleApiError(result);
        }
    } catch (e) {
        toast.error("Bağlantı hatası.");
        setPhase('type_select');
    }
  };

  const reset = () => {
      setPhase('type_select');
      setIntention('');
      setSelectedIndices([]);
      setReadingResult(null);
  };

  return (
    // min-h-screen ve h-screen kombinasyonu ile taşmaları engelliyoruz (ilk aşamalar için)
    <div className={`min-h-[100dvh] bg-[#0a0c10] text-slate-200 relative flex flex-col font-sans selection:bg-white/20 transition-colors duration-1000 ${phase !== 'result' ? 'md:h-screen md:overflow-hidden' : 'pb-20'} z-10`}>
      
      {/* ARKAPLAN AURALARI */}
      <div className={`fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${selectedSpread.theme.ambient} -z-10 transition-colors duration-1000`} />
      <div className="fixed top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none -z-10 mix-blend-overlay"></div>

      {/* --- HEADER (Daha kompakt) --- */}
      <nav className="w-full px-4 md:px-6 py-4 md:py-5 flex items-center justify-between max-w-[1200px] mx-auto z-50 shrink-0">
        <button 
            onClick={handleBackNavigation} 
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-[10px] md:text-xs font-bold text-slate-300 hover:text-white uppercase tracking-widest backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{phase === 'type_select' ? 'Menü' : 'Geri'}</span>
        </button>
        
        <div className="flex items-center gap-2 md:gap-3 bg-[#131722]/80 backdrop-blur-md border border-white/5 px-4 py-2 md:px-5 md:py-2.5 rounded-xl shadow-sm">
            <Sparkles className={`w-3.5 h-3.5 md:w-4 md:h-4 ${selectedSpread.theme.accent}`} />
            <span className="font-serif text-xs md:text-sm text-white tracking-widest uppercase">Mistik Tarot</span>
        </div>
      </nav>

      {/* Ana kapsayıcı ortalama (justify-center) kullanılarak webde tam oturması sağlandı */}
      <main className="flex-1 flex flex-col items-center justify-center relative px-4 w-full max-w-[1200px] mx-auto overflow-x-hidden">
      
        {/* 1. AÇILIM TİPİ SEÇİMİ */}
        {phase === 'type_select' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                <div className="text-center mb-8 md:mb-10">
                    <h1 className="text-3xl md:text-5xl font-serif text-white mb-2 md:mb-3">Rehberinizi Seçin</h1>
                    <p className="text-slate-400 font-light text-xs md:text-sm max-w-md mx-auto leading-relaxed">
                        Niyetinize en uygun açılımı seçerek ruhsal yolculuğa başlayın.
                    </p>
                    <div className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                       <Zap className="w-3 h-3" /> Her açılım 2 Kredi
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 pb-8 md:pb-0">
                    {SPREAD_CONFIG.map((spread) => {
                          const isLocked = spread.id === 'dream_special' && !latestDream;
                          return (
                            <motion.div 
                                key={spread.id}
                                whileHover={!isLocked ? { y: -4 } : {}}
                                onClick={() => !isLocked && handleSelectSpread(spread)}
                                className={`
                                    relative group cursor-pointer rounded-2xl md:rounded-3xl p-6 flex flex-col items-start justify-between min-h-[220px] md:min-h-[260px]
                                    border backdrop-blur-xl transition-all duration-500 overflow-hidden
                                    ${spread.theme.bg} ${spread.theme.border} ${spread.theme.glow}
                                    ${isLocked ? 'opacity-40 grayscale-[50%] cursor-not-allowed border-white/5' : 'hover:bg-[#1a1f2e]/80'}
                                `}
                            >
                                <div className="relative z-10 w-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-3 md:p-3.5 rounded-xl md:rounded-2xl ${spread.theme.iconBg} border border-white/5 shadow-inner`}>
                                            {spread.id === 'dream_special' && isLocked ? <Lock className="w-5 h-5 md:w-6 md:h-6" /> : spread.icon}
                                        </div>
                                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                            {spread.count} Kart
                                        </span>
                                    </div>
                                    <h3 className={`text-xl md:text-2xl font-serif mb-2 ${isLocked ? 'text-slate-500' : 'text-slate-100 group-hover:text-white transition-colors'}`}>
                                        {spread.name}
                                    </h3>
                                    <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-light">
                                        {spread.desc}
                                    </p>
                                </div>
                                {spread.id === 'dream_special' && latestDream && (
                                     <div className="relative z-10 mt-4 w-full pt-3 border-t border-white/5">
                                          <p className="text-[10px] md:text-xs text-purple-400/80 truncate flex items-center gap-1.5">
                                               <Info className="w-3 h-3" /> Son Rüya: {latestDream.title}
                                          </p>
                                     </div>
                                )}
                            </motion.div>
                          )
                    })}
                </div>
            </motion.div>
        )}

        {/* 2. NİYET EKRANI (Daha Kompakt) */}
        {phase === 'intention' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl pb-10 md:pb-0">
                <div className={`relative bg-[#0a0c10]/60 border backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl ${selectedSpread.theme.border}`}>
                    
                    <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                       <div className={`absolute inset-0 rounded-full blur-[30px] opacity-40 animate-pulse ${selectedSpread.theme.iconBg.split(' ')[0]}`}></div>
                       <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center border border-white/10 ${selectedSpread.theme.iconBg}`}>
                          {selectedSpread.icon}
                       </div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-serif text-white mb-3">Niyetinize Odaklanın</h2>
                    <p className="text-slate-400 text-xs md:text-sm mb-6 font-light leading-relaxed">
                        Zihninizi boşaltın ve sorunuzu içtenlikle sorun.
                    </p>
                    
                    <div className="relative group">
                       <div className={`absolute inset-0 bg-gradient-to-b ${selectedSpread.theme.ambient} opacity-0 group-focus-within:opacity-20 rounded-2xl transition-opacity blur-xl`}></div>
                       <textarea
                           value={intention}
                           onChange={(e) => setIntention(e.target.value)}
                           placeholder="Örn: Kariyerimde önümüzdeki ay beni neler bekliyor?"
                           className="relative w-full bg-[#131722]/80 border border-white/10 rounded-2xl p-5 text-white placeholder-slate-600 focus:outline-none focus:border-white/30 resize-none h-28 md:h-32 transition-all text-base md:text-lg font-serif text-center scrollbar-hide shadow-inner"
                           autoFocus
                       />
                    </div>

                    <button 
                        onClick={handleStartRitual}
                        disabled={!intention.trim()}
                        className="mt-8 w-full md:w-auto px-10 py-3.5 rounded-full font-bold text-xs md:text-sm uppercase tracking-widest transition-all shadow-[0_10px_20px_rgba(255,255,255,0.1)] disabled:opacity-30 disabled:cursor-not-allowed bg-white text-black hover:bg-slate-200 hover:scale-105 active:scale-95"
                    >
                        Kartları Karıştır
                    </button>
                </div>
            </motion.div>
        )}

        {/* 3. KARIŞTIRMA */}
        {phase === 'shuffle' && (
            <div className="flex flex-col items-center justify-center">
                <div className="relative w-24 h-36 md:w-32 md:h-48 perspective-1000">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                x: [0, 30, -30, 0],
                                rotate: [0, 8, -8, 0],
                                scale: [1, 1.05, 1]
                            }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                            className={`absolute inset-0 rounded-2xl bg-[#111] border border-white/10 shadow-2xl ${selectedSpread.theme.glow}`}
                            style={{ zIndex: i }}
                        >
                            <div className="w-full h-full flex flex-col items-center justify-center border-[4px] border-black/20 rounded-xl opacity-30">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                        </motion.div>
                    ))}
                </div>
                <p className={`mt-12 text-xs md:text-sm font-bold uppercase tracking-[0.4em] animate-pulse ${selectedSpread.theme.accent}`}>
                  Evrensel Bağ Kuruluyor
                </p>
            </div>
        )}

        {/* 4. KART SEÇİMİ (Spread - Sığacak şekilde daraltıldı) */}
        {phase === 'spread' && (
            <div className="w-full flex flex-col items-center h-full pt-2 pb-10 md:pb-0">
                <div className="text-center mb-6 md:mb-8">
                      <h3 className="text-2xl md:text-3xl font-serif text-white mb-2">Kartlarınızı Seçin</h3>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                         <span className={`text-xs font-bold ${selectedSpread.theme.accent}`}>
                             {selectedIndices.length} / {selectedSpread.count}
                         </span>
                         <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Seçildi</span>
                      </div>
                </div>

                <div className="w-full max-w-5xl flex justify-center perspective-1000 px-2">
                    <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-11 gap-2 md:gap-3">
                        {deckOrder.map((deckIndex, i) => { 
                            const isSelected = selectedIndices.includes(i);
                            return (
                                <motion.div
                                    key={i}
                                    className="relative w-12 h-20 sm:w-16 sm:h-24 md:w-20 md:h-32 cursor-pointer"
                                    onClick={() => handleCardClick(i)}
                                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: i * 0.005 }}
                                >
                                    <motion.div
                                        className="w-full h-full relative preserve-3d transition-all duration-500"
                                        initial={false}
                                        animate={{ 
                                          rotateY: isSelected ? 180 : 0, 
                                          y: isSelected ? -15 : 0,
                                          scale: isSelected ? 1.05 : 1
                                        }}
                                        style={{ transformStyle: "preserve-3d" }}
                                    >
                                        <div className={`absolute inset-0 backface-hidden rounded-xl flex items-center justify-center shadow-lg bg-[#0a0c10] border border-white/10 hover:border-white/30 transition-colors ${isSelected ? `ring-2 ${selectedSpread.theme.accent.replace('text-', 'ring-')} shadow-[0_0_20px_rgba(255,255,255,0.2)]` : ''}`}>
                                            <div className={`w-full h-full absolute bg-gradient-to-br ${selectedSpread.theme.ambient} opacity-30 rounded-xl`}></div>
                                            <div className="absolute inset-1 border border-white/5 rounded-lg flex items-center justify-center">
                                              <Star className="w-3 h-3 text-white/10" />
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )}

        {/* 5. YÜKLENİYOR (Reading) */}
        {phase === 'reading' && (
            <div className="flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center w-20 h-20">
                   <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${selectedSpread.theme.iconBg.split(' ')[0]}`} style={{ animationDuration: '3s' }}></div>
                   <div className="relative bg-[#131722] p-4 rounded-full border border-white/10 shadow-2xl">
                      <Loader2 className={`w-6 h-6 animate-spin ${selectedSpread.theme.accent}`} />
                   </div>
                </div>
                <h2 className="text-xl md:text-2xl font-serif text-white mt-8 tracking-wide text-center">Rehberler Fısıldıyor...</h2>
                <p className="text-slate-500 text-xs mt-2 font-light">Kartların sembolizmi niyetinizle birleşiyor.</p>
            </div>
        )}

        {/* 6. SONUÇ EKRANI (Aynı bırakıldı çünkü okuma yapılması için kaydırma gerekir) */}
        {phase === 'result' && readingResult && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="w-full max-w-5xl mt-6 pb-24">
                
                {/* ANA MESAJ PARŞÖMENİ */}
                <div className={`mb-12 p-8 md:p-12 rounded-[2.5rem] text-center bg-[#131722]/80 backdrop-blur-2xl relative overflow-hidden border ${selectedSpread.theme.border} shadow-2xl`}>
                    <div className={`absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br ${selectedSpread.theme.ambient} blur-[100px] opacity-40 pointer-events-none`}></div>
                    
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-white/5 border border-white/10`}>
                       <Sparkles className={`w-6 h-6 ${selectedSpread.theme.accent}`} />
                    </div>
                    
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Kozmik Cevabınız</h3>
                    <p className="text-white italic text-xl md:text-3xl font-serif leading-[1.6] max-w-3xl mx-auto relative z-10">
                        "{readingResult.summary}"
                    </p>
                </div>

                {/* DETAYLI KART ANALİZLERİ */}
                <div className="space-y-8 mb-16">
                   <h3 className="text-xl font-serif text-white px-2 mb-2 border-b border-white/5 pb-4">Kartların Sırrı</h3>
                   
                   {readingResult.cards_analysis?.map((analysis: any, idx: number) => {
                      const cardData = readingResult.selectedCardsData ? readingResult.selectedCardsData[idx] : null;
                      
                      return (
                        <motion.div 
                           key={idx}
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: idx * 0.2 }}
                           className="group flex flex-col md:flex-row gap-8 bg-[#0a0c10] border border-white/5 p-8 rounded-[2rem] hover:border-white/10 transition-colors"
                        >
                           {/* Sol: Kart Görseli */}
                           <div className="w-full md:w-56 shrink-0 flex flex-col items-center">
                              <span className={`text-[10px] uppercase tracking-[0.2em] font-bold mb-5 bg-white/5 px-4 py-1.5 rounded-full ${selectedSpread.theme.accent}`}>
                                 {analysis.position}
                              </span>
                              <div className="w-40 md:w-full aspect-[2/3] rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl relative">
                                  {cardData ? (
                                    <img src={cardData.image} alt={cardData.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-[#111] flex items-center justify-center">?</div>
                                  )}
                              </div>
                           </div>

                           {/* Sağ: Kart Yorumu */}
                           <div className="flex-1 flex flex-col justify-center py-2">
                              <h4 className="text-3xl font-serif text-white mb-2 text-center md:text-left">{analysis.card_name}</h4>
                              <div className={`w-16 h-1 mb-6 mx-auto md:mx-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-50 ${selectedSpread.theme.accent.replace('text-', 'text-')}`}></div>
                              <p className="text-slate-300 text-base md:text-lg leading-relaxed font-light text-justify">
                                 {analysis.meaning}
                              </p>
                           </div>
                        </motion.div>
                      );
                   })}
                </div>

                {/* SENTEZ VE TAVSİYE */}
                <div className="bg-[#131722] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                    <h2 className="text-2xl font-serif text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                           <Layers className={`w-5 h-5 ${selectedSpread.theme.accent}`} />
                        </div>
                        Bütünsel Sentez
                    </h2>
                    
                    <div className="text-slate-300 leading-relaxed font-light text-base md:text-lg text-justify mb-10">
                        <p>{readingResult.synthesis}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-8 border-t border-white/5">
                        <div className="bg-[#0a0c10] p-6 md:p-8 rounded-3xl border border-white/5">
                            <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${selectedSpread.theme.accent}`}>
                                <Star className="w-4 h-4"/> Yol Gösterici Tavsiye
                            </h4>
                            <p className="text-white font-serif text-lg leading-relaxed">"{readingResult.advice}"</p>
                        </div>
                        
                        <div className="p-6 md:p-8">
                            <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">Enerji Sembolleri</h4>
                            <div className="flex flex-wrap gap-2">
                                {readingResult.keywords?.map((kw: string, i: number) => (
                                    <span key={i} className="px-4 py-2 rounded-xl bg-white/5 text-xs text-slate-300 font-medium tracking-wide border border-white/5">
                                        #{kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <button onClick={reset} className="w-full md:w-auto px-10 py-4 rounded-full bg-white text-black font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2 mx-auto text-xs">
                            <RefreshCcw className="w-4 h-4" /> Yeni Bir Soru Sor
                        </button>
                    </div>
                </div>

            </motion.div>
        )}

      </main>
    </div>
  );
}

export default function TarotPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0c10] flex items-center justify-center text-slate-400 font-serif">Kozmik bağ kuruluyor...</div>}>
       <TarotPageContent />
    </Suspense>
  );
}