"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Sparkles, RefreshCcw, Layers, Star, 
  Heart, Moon, Lock, Info, Zap, Loader2, ArrowRight 
} from "lucide-react";
import { TAROT_DECK } from "@/utils/tarot-deck";
import { readTarot } from "@/app/actions/read-tarot";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

// --- YENİ ÇİFT TEMA KONFİGÜRASYONU ---
const SPREAD_CONFIG = [
  {
    id: 'dream_special',
    name: "Rüya Analizi",
    desc: "Bilinçaltınızın gizli mesajlarını çözün.",
    icon: <Moon className="w-5 h-5 md:w-6 md:h-6" />,
    count: 3,
    theme: {
      border: "border-stone-200 dark:border-white/5 group-hover:border-purple-300 dark:group-hover:border-purple-500/40",
      bg: "bg-white dark:bg-[#131722]/80 group-hover:bg-purple-50/50 dark:group-hover:bg-purple-500/10",
      iconBg: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/20",
      accent: "text-purple-600 dark:text-purple-400",
      ambient: "from-purple-100/50 dark:from-purple-900/10 via-transparent to-transparent"
    }
  },
  {
    id: 'three_card',
    name: "Zamanın Çizgisi",
    desc: "Geçmiş, şimdi ve gelecekteki ruhsal yolculuğunuz.",
    icon: <Layers className="w-5 h-5 md:w-6 md:h-6" />,
    count: 3,
    theme: {
      border: "border-stone-200 dark:border-white/5 group-hover:border-indigo-300 dark:group-hover:border-indigo-500/40",
      bg: "bg-white dark:bg-[#131722]/80 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-500/10",
      iconBg: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20",
      accent: "text-indigo-600 dark:text-indigo-400",
      ambient: "from-indigo-100/50 dark:from-indigo-900/10 via-transparent to-transparent"
    }
  },
  {
    id: 'single_card',
    name: "Tek Kart Rehber",
    desc: "Net ve spesifik bir soru için anlık kozmik ışık.",
    icon: <Star className="w-5 h-5 md:w-6 md:h-6" />,
    count: 1,
    theme: {
      border: "border-stone-200 dark:border-white/5 group-hover:border-amber-300 dark:group-hover:border-amber-500/40",
      bg: "bg-white dark:bg-[#131722]/80 group-hover:bg-amber-50/50 dark:group-hover:bg-amber-500/10",
      iconBg: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20",
      accent: "text-amber-600 dark:text-amber-400",
      ambient: "from-amber-100/50 dark:from-amber-900/10 via-transparent to-transparent"
    }
  },
  {
    id: 'love',
    name: "Aşk ve Uyum",
    desc: "İlişkinizin enerjisi ve kalbinizin izleyeceği yol.",
    icon: <Heart className="w-5 h-5 md:w-6 md:h-6" />,
    count: 3,
    theme: {
      border: "border-stone-200 dark:border-white/5 group-hover:border-rose-300 dark:group-hover:border-rose-500/40",
      bg: "bg-white dark:bg-[#131722]/80 group-hover:bg-rose-50/50 dark:group-hover:bg-rose-500/10",
      iconBg: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20",
      accent: "text-rose-600 dark:text-rose-400",
      ambient: "from-rose-100/50 dark:from-rose-900/10 via-transparent to-transparent"
    }
  }
];

function TarotPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [user, setUser] = useState<any>(null);
  const [phase, setPhase] = useState<'type_select' | 'intention' | 'shuffle' | 'spread' | 'reading' | 'result'>('type_select');
  const [selectedSpread, setSelectedSpread] = useState<any>(SPREAD_CONFIG[1]); 
  const [intention, setIntention] = useState("");
  const [deckOrder, setDeckOrder] = useState<number[]>([]); 
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [readingResult, setReadingResult] = useState<any>(null);
  const [latestDream, setLatestDream] = useState<any>(null);

  useEffect(() => {
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    initUser();
  }, [supabase]);

  const isGuest = !user;
  
  useEffect(() => {
    const checkLatestDream = async () => {
      try {
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
    if(user) checkLatestDream();
  }, [user]);

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
    if (spread.id === 'dream_special' && !latestDream && !isGuest) return;
    if (spread.id === 'dream_special' && isGuest) {
      toast.info("Rüya Analizi Tarot'u için giriş yapmalısınız.");
      return;
    }
    
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
            if(!isGuest) toast.success("Kartlar yorumlandı! (2 Kredi düştü)");
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

  const handleGuestSignup = () => {
    localStorage.setItem('pending_tarot_reading', JSON.stringify({ question: intention, cards: readingResult.selectedCardsData }));
    router.push('/auth?mode=signup&redirect=/dashboard/tarot');
  };

  return (
    // YENİ ÇİFT TEMA: dark:bg-transparent ile layout siyahını devralır.
    <div className={`min-h-[100dvh] bg-[#faf9f6] dark:bg-transparent text-stone-800 dark:text-slate-200 relative flex flex-col font-sans selection:bg-stone-200 dark:selection:bg-white/20 transition-colors duration-1000 ${phase !== 'result' ? 'md:h-screen md:overflow-hidden' : 'pb-20'} z-10 antialiased`}>
      
      {/* ÇOK HAFİF ARKAPLAN RENKLENDİRMESİ */}
      <div className={`fixed inset-0 bg-gradient-to-b ${selectedSpread.theme.ambient} -z-10 transition-colors duration-1000`} />

      {/* --- HEADER --- */}
      <nav className="w-full px-4 md:px-6 py-4 md:py-6 flex items-center justify-between max-w-[1200px] mx-auto z-50 shrink-0">
        <button 
            onClick={handleBackNavigation} 
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl bg-white dark:bg-[#131722]/80 dark:backdrop-blur-md border border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors text-[10px] md:text-xs font-bold text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white uppercase tracking-widest shadow-sm dark:shadow-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{phase === 'type_select' ? 'Menü' : 'Geri'}</span>
        </button>
        
        <div className="flex items-center gap-2 md:gap-3 bg-white dark:bg-[#131722]/80 dark:backdrop-blur-md border border-stone-200 dark:border-white/10 px-4 py-2 md:px-5 md:py-2.5 rounded-xl shadow-sm dark:shadow-none transition-colors">
            <Sparkles className={`w-3.5 h-3.5 md:w-4 md:h-4 ${selectedSpread.theme.accent}`} />
            <span className="font-serif text-xs md:text-sm text-stone-900 dark:text-slate-200 font-bold tracking-widest uppercase transition-colors">Mistik Tarot</span>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center relative px-4 w-full max-w-[1200px] mx-auto overflow-x-hidden">
      
        {/* 1. AÇILIM TİPİ SEÇİMİ */}
        {phase === 'type_select' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                <div className="text-center mb-8 md:mb-12">
                    <h1 className="text-3xl md:text-5xl font-serif text-stone-900 dark:text-white mb-3 font-bold tracking-tight transition-colors">Rehberinizi Seçin</h1>
                    <p className="text-stone-500 dark:text-slate-400 font-light text-sm md:text-base max-w-md mx-auto leading-relaxed transition-colors">
                        Niyetinize en uygun açılımı seçerek ruhsal yolculuğa başlayın.
                    </p>
                    <div className="inline-flex items-center gap-1.5 mt-6 px-4 py-2 rounded-full bg-stone-100 dark:bg-[#131722] border border-stone-200 dark:border-white/10 text-stone-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm dark:shadow-none">
                       <Zap className="w-3 h-3 text-amber-500" /> Her açılım 2 Kredi
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pb-8 md:pb-0">
                    {SPREAD_CONFIG.map((spread) => {
                          const isLocked = spread.id === 'dream_special' && (!latestDream || isGuest);
                          return (
                            <motion.div 
                                key={spread.id}
                                whileHover={!isLocked ? { y: -4 } : {}}
                                onClick={() => !isLocked && handleSelectSpread(spread)}
                                className={`
                                    relative group cursor-pointer rounded-3xl p-6 md:p-8 flex flex-col items-start justify-between min-h-[220px] md:min-h-[260px]
                                    border transition-all duration-300 shadow-sm hover:shadow-md dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] backdrop-blur-xl
                                    ${spread.theme.bg} ${spread.theme.border}
                                    ${isLocked ? 'opacity-60 dark:opacity-40 grayscale bg-stone-50 dark:bg-[#0a0c10]/50 cursor-not-allowed border-stone-200 dark:border-white/5' : ''}
                                `}
                            >
                                <div className="relative z-10 w-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-3 md:p-4 rounded-2xl border transition-colors ${spread.theme.iconBg}`}>
                                            {spread.id === 'dream_special' && isLocked ? <Lock className="w-5 h-5 md:w-6 md:h-6" /> : spread.icon}
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-slate-500 bg-white dark:bg-black/20 px-3 py-1 rounded-full border border-stone-200 dark:border-white/5 transition-colors">
                                            {spread.count} Kart
                                        </span>
                                    </div>
                                    <h3 className={`text-xl md:text-2xl font-serif font-bold mb-2 transition-colors ${isLocked ? 'text-stone-500 dark:text-slate-600' : 'text-stone-900 dark:text-slate-100 group-hover:text-stone-800 dark:group-hover:text-white'}`}>
                                        {spread.name}
                                    </h3>
                                    <p className="text-sm text-stone-500 dark:text-slate-400 leading-relaxed font-light transition-colors">
                                        {spread.desc}
                                    </p>
                                </div>
                                {spread.id === 'dream_special' && latestDream && !isGuest && (
                                     <div className="relative z-10 mt-4 w-full pt-4 border-t border-stone-200 dark:border-white/10 transition-colors">
                                          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium truncate flex items-center gap-1.5 transition-colors">
                                               <Info className="w-3.5 h-3.5" /> Son Rüya: {latestDream.title}
                                          </p>
                                     </div>
                                )}
                            </motion.div>
                          )
                    })}
                </div>
            </motion.div>
        )}

        {/* 2. NİYET EKRANI */}
        {phase === 'intention' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl pb-10 md:pb-0">
                <div className="relative bg-white dark:bg-[#131722]/80 dark:backdrop-blur-2xl border border-stone-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 text-center shadow-lg dark:shadow-2xl transition-colors">
                    
                    <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                       <div className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center border transition-colors ${selectedSpread.theme.iconBg}`}>
                          {selectedSpread.icon}
                       </div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 dark:text-white mb-3 transition-colors">Niyetinize Odaklanın</h2>
                    <p className="text-stone-500 dark:text-slate-400 text-sm mb-8 font-light leading-relaxed transition-colors">
                        Zihninizi boşaltın ve sorunuzu içtenlikle sorun.
                    </p>
                    
                    <div className="relative">
                       <textarea
                           value={intention}
                           onChange={(e) => setIntention(e.target.value)}
                           placeholder="Örn: Kariyerimde önümüzdeki ay beni neler bekliyor?"
                           className="relative w-full bg-stone-50 dark:bg-[#0a0c10]/50 border border-stone-200 dark:border-white/10 rounded-2xl p-6 text-stone-900 dark:text-slate-200 placeholder-stone-400 dark:placeholder-slate-600 focus:outline-none focus:border-stone-400 dark:focus:border-white/30 dark:focus:bg-white/5 resize-none h-32 md:h-36 transition-all text-base md:text-lg font-serif text-center shadow-inner dark:shadow-none"
                           autoFocus
                       />
                    </div>

                    <button 
                        onClick={handleStartRitual}
                        disabled={!intention.trim()}
                        className="mt-8 w-full md:w-auto px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed bg-stone-900 dark:bg-white text-white dark:text-[#0a0c10] hover:bg-stone-800 dark:hover:bg-slate-200 hover:shadow-lg dark:hover:scale-105"
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
                            className="absolute inset-0 rounded-2xl bg-stone-900 dark:bg-[#111] border border-stone-700 dark:border-white/10 shadow-xl dark:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-colors"
                            style={{ zIndex: i }}
                        >
                            <div className="w-full h-full flex flex-col items-center justify-center border-[4px] border-stone-800 dark:border-black/20 rounded-xl">
                                <Star className="w-6 h-6 text-stone-700 dark:text-white/20" />
                            </div>
                        </motion.div>
                    ))}
                </div>
                <p className={`mt-12 text-xs md:text-sm font-bold uppercase tracking-[0.3em] animate-pulse transition-colors ${selectedSpread.theme.accent}`}>
                  Evrensel Bağ Kuruluyor
                </p>
            </div>
        )}

        {/* 4. KART SEÇİMİ */}
        {phase === 'spread' && (
            <div className="w-full flex flex-col items-center h-full pt-2 pb-10 md:pb-0">
                <div className="text-center mb-8">
                      <h3 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 dark:text-white mb-3 transition-colors">Kartlarınızı Seçin</h3>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors">
                         <span className={`text-sm font-bold transition-colors ${selectedSpread.theme.accent}`}>
                             {selectedIndices.length} / {selectedSpread.count}
                         </span>
                         <span className="text-[10px] text-stone-400 dark:text-slate-400 font-bold tracking-widest uppercase transition-colors">Seçildi</span>
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
                                        <div className={`absolute inset-0 backface-hidden rounded-xl flex items-center justify-center shadow-md dark:shadow-lg bg-stone-900 dark:bg-[#0a0c10] border border-stone-700 dark:border-white/10 hover:border-stone-500 dark:hover:border-white/30 transition-colors ${isSelected ? `ring-2 ${selectedSpread.theme.accent.replace('text-', 'ring-')} dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]` : ''}`}>
                                            <div className="absolute inset-1 border border-stone-800 dark:border-white/5 rounded-lg flex items-center justify-center transition-colors">
                                              <Star className="w-3 h-3 text-stone-700 dark:text-white/10" />
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

        {/* 5. YÜKLENİYOR */}
        {phase === 'reading' && (
            <div className="flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center w-20 h-20">
                   <div className="relative bg-white dark:bg-[#131722] p-5 rounded-full border border-stone-200 dark:border-white/10 shadow-md dark:shadow-2xl transition-colors">
                      <Loader2 className={`w-8 h-8 animate-spin transition-colors ${selectedSpread.theme.accent}`} />
                   </div>
                </div>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-900 dark:text-white mt-8 tracking-wide text-center transition-colors">Rehberler Fısıldıyor...</h2>
                <p className="text-stone-500 dark:text-slate-400 text-sm mt-3 font-light transition-colors">Kartların sembolizmi niyetinizle birleşiyor.</p>
            </div>
        )}

        {/* 6. SONUÇ EKRANI */}
        {phase === 'result' && readingResult && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="w-full max-w-5xl mt-6 pb-24 relative">
                
                {/* ANA ÖZET */}
                <div className={`mb-12 p-8 md:p-12 rounded-3xl text-center bg-white dark:bg-[#131722]/80 dark:backdrop-blur-2xl border ${selectedSpread.theme.border} shadow-sm dark:shadow-2xl relative overflow-hidden transition-colors`}>
                    <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-stone-50 dark:bg-white/5 border border-stone-100 dark:border-white/10 transition-colors`}>
                       <Sparkles className={`w-6 h-6 transition-colors ${selectedSpread.theme.accent}`} />
                    </div>
                    
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 dark:text-slate-500 mb-6 transition-colors">Kozmik Cevabınız</h3>
                    <p className="text-stone-800 dark:text-white italic text-xl md:text-3xl font-serif leading-[1.8] max-w-3xl mx-auto transition-colors">
                        "{readingResult.summary}"
                    </p>
                </div>

                {/* KARTLARIN DETAYI */}
                <div className="relative">
                   <div className={`space-y-8 transition-all ${isGuest ? 'opacity-30 blur-[6px] pointer-events-none select-none' : ''}`}>
                      <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white px-2 mb-4 border-b border-stone-200 dark:border-white/10 pb-4 transition-colors">Kartların Sırrı</h3>
                      
                      {readingResult.cards_analysis?.map((analysis: any, idx: number) => {
                         const cardData = readingResult.selectedCardsData ? readingResult.selectedCardsData[idx] : null;
                         return (
                           <div key={idx} className="group flex flex-col md:flex-row gap-8 bg-white dark:bg-[#0a0c10] border border-stone-200 dark:border-white/5 p-8 rounded-3xl hover:shadow-md dark:hover:border-white/10 transition-all">
                              <div className="w-full md:w-56 shrink-0 flex flex-col items-center">
                                 <span className={`text-[10px] uppercase tracking-[0.2em] font-bold mb-5 bg-stone-50 dark:bg-white/5 px-4 py-2 rounded-full border border-stone-100 dark:border-white/5 transition-colors ${selectedSpread.theme.accent}`}>
                                    {analysis.position}
                                 </span>
                                 <div className="w-40 md:w-full aspect-[2/3] rounded-2xl overflow-hidden border border-stone-200 dark:border-white/10 shadow-md dark:shadow-2xl relative transition-colors">
                                    {cardData ? (
                                      <img src={cardData.image} alt={cardData.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full bg-stone-100 dark:bg-[#111] flex items-center justify-center text-stone-400 dark:text-slate-600 transition-colors">?</div>
                                    )}
                                 </div>
                              </div>
                              <div className="flex-1 flex flex-col justify-center py-2">
                                 <h4 className="text-3xl font-serif font-bold text-stone-900 dark:text-white mb-4 text-center md:text-left transition-colors">{analysis.card_name}</h4>
                                 <p className="text-stone-600 dark:text-slate-300 text-base md:text-lg leading-[1.8] font-light text-justify transition-colors">
                                    {analysis.meaning}
                                 </p>
                              </div>
                           </div>
                         );
                      })}

                      {/* Bütünsel Sentez & Tavsiye */}
                      <div className="bg-stone-50 dark:bg-[#131722] border border-stone-200 dark:border-white/5 rounded-3xl p-8 md:p-12 shadow-sm dark:shadow-2xl mt-12 transition-colors">
                          <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-6 flex items-center gap-3 transition-colors">
                              <div className="p-3 bg-white dark:bg-white/5 rounded-xl border border-stone-200 dark:border-white/10 shadow-sm transition-colors">
                                 <Layers className={`w-5 h-5 transition-colors ${selectedSpread.theme.accent}`} />
                              </div>
                              Bütünsel Sentez
                          </h2>
                          <div className="text-stone-700 dark:text-slate-300 leading-[1.8] font-light text-lg text-justify mb-10 transition-colors">
                              <p>{readingResult.synthesis}</p>
                          </div>
                          <div className="grid md:grid-cols-2 gap-6 pt-8 border-t border-stone-200 dark:border-white/5 transition-colors">
                              <div className="bg-white dark:bg-[#0a0c10] p-6 md:p-8 rounded-3xl border border-stone-200 dark:border-white/5 shadow-sm transition-colors">
                                  <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2 transition-colors ${selectedSpread.theme.accent}`}>
                                      <Star className="w-4 h-4"/> Yol Gösterici Tavsiye
                                  </h4>
                                  <p className="text-stone-800 dark:text-white font-serif text-lg leading-relaxed transition-colors">"{readingResult.advice}"</p>
                              </div>
                              <div className="p-6 md:p-8">
                                  <h4 className="text-stone-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4 transition-colors">Enerji Sembolleri</h4>
                                  <div className="flex flex-wrap gap-2">
                                      {readingResult.keywords?.map((kw: string, i: number) => (
                                          <span key={i} className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 text-xs text-stone-600 dark:text-slate-300 font-medium tracking-wide border border-stone-200 dark:border-white/5 shadow-sm transition-colors">
                                              #{kw}
                                          </span>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      </div>
                   </div>

                   {/* MİSAFİRE ÖZEL PAYWALL OVERLAY */}
                   {isGuest && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gradient-to-t from-[#faf9f6] via-[#faf9f6]/95 dark:from-[#0a0c10] dark:via-[#0a0c10]/95 to-transparent pb-12 pt-32 transition-colors">
                          <div className="w-16 h-16 bg-white dark:bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-stone-200 dark:border-amber-500/20 shadow-sm transition-colors">
                             <Lock className="w-6 h-6 text-stone-400 dark:text-amber-500" />
                          </div>
                          <h3 className="text-3xl font-serif font-bold text-stone-900 dark:text-white mb-4 transition-colors">Derin Analiz Kilitli</h3>
                          <p className="text-stone-500 dark:text-slate-400 max-w-md text-center mb-8 font-light text-lg transition-colors">
                              Kartların size özel derin anlamlarını, enerjik bağlarınızı ve gelecek tavsiyesini okumak için ücretsiz kayıt olun.
                          </p>
                          <button onClick={handleGuestSignup} className="px-10 py-4 bg-stone-900 dark:bg-white text-white dark:text-black font-bold rounded-full hover:bg-stone-800 dark:hover:scale-105 transition-all shadow-md dark:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center gap-2">
                              Ücretsiz Kayıt Ol ve Oku <ArrowRight className="w-4 h-4" />
                          </button>
                      </div>
                   )}
                </div>

                {/* YENİDEN BAŞLA */}
                {!isGuest && (
                  <div className="mt-16 text-center">
                      <button onClick={reset} className="w-full md:w-auto px-10 py-4 rounded-full bg-stone-900 dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest hover:bg-stone-800 dark:hover:bg-slate-200 transition-all shadow-md flex items-center justify-center gap-2 mx-auto text-xs">
                          <RefreshCcw className="w-4 h-4" /> Yeni Bir Soru Sor
                      </button>
                  </div>
                )}

            </motion.div>
        )}

      </main>
    </div>
  );
}

export default function TarotPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f6] dark:bg-transparent flex items-center justify-center text-stone-400 dark:text-slate-500 font-serif transition-colors duration-500">Kozmik bağ kuruluyor...</div>}>
       <TarotPageContent />
    </Suspense>
  );
}