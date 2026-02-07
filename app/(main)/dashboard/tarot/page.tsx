"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, RefreshCcw, Layers, Star, Heart, Moon, Lock, Info, Zap } from "lucide-react";
import { TAROT_DECK } from "@/utils/tarot-deck";
import { readTarot } from "@/app/actions/read-tarot";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

// Build hatasını önlemek için dinamik render
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
      border: "group-hover:border-amber-400/50 border-purple-500/20",
      bg: "bg-gradient-to-br from-[#1a0b2e] to-[#0f0518]",
      iconBg: "bg-purple-900/30 text-amber-400",
      glow: "shadow-purple-900/20",
      accent: "text-amber-400",
      ambient: "from-purple-900/20 via-slate-950 to-slate-950"
    }
  },
  {
    id: 'three_card',
    name: "Geçmiş, Şimdi, Gelecek",
    desc: "Zaman çizgisinde ruhsal yolculuk.",
    icon: <Layers className="w-5 h-5 md:w-6 md:h-6" />,
    count: 3,
    theme: {
      border: "group-hover:border-indigo-400/50 border-indigo-500/20",
      bg: "bg-gradient-to-br from-[#0f172a] to-[#020617]",
      iconBg: "bg-indigo-900/30 text-indigo-300",
      glow: "shadow-indigo-900/20",
      accent: "text-indigo-400",
      ambient: "from-indigo-900/20 via-slate-950 to-slate-950"
    }
  },
  {
    id: 'single_card',
    name: "Tek Kart Rehberlik",
    desc: "Net bir soru için anlık ışık.",
    icon: <Star className="w-5 h-5 md:w-6 md:h-6" />,
    count: 1,
    theme: {
      border: "group-hover:border-cyan-400/50 border-cyan-500/20",
      bg: "bg-gradient-to-br from-[#082f49] to-[#020617]",
      iconBg: "bg-cyan-900/30 text-cyan-300",
      glow: "shadow-cyan-900/20",
      accent: "text-cyan-400",
      ambient: "from-cyan-900/20 via-slate-950 to-slate-950"
    }
  },
  {
    id: 'love',
    name: "Aşk ve Uyum",
    desc: "İlişkinin enerjisi ve kalbin yolu.",
    icon: <Heart className="w-5 h-5 md:w-6 md:h-6" />,
    count: 3,
    theme: {
      border: "group-hover:border-rose-500/50 border-rose-900/30",
      bg: "bg-gradient-to-br from-[#2c0b0e] to-[#0f0204]",
      iconBg: "bg-rose-900/40 text-rose-400",
      glow: "shadow-rose-900/40",
      accent: "text-rose-500",
      ambient: "from-rose-900/20 via-slate-950 to-slate-950"
    }
  }
];

// --- ASIL İÇERİK BİLEŞENİ ---
function TarotPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  // --- STATE ---
  const [phase, setPhase] = useState<'type_select' | 'intention' | 'shuffle' | 'spread' | 'reading' | 'result'>('type_select');
  const [selectedSpread, setSelectedSpread] = useState<any>(SPREAD_CONFIG[1]); 
  const [intention, setIntention] = useState("");
  const [deckOrder, setDeckOrder] = useState<number[]>([]); 
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [readingResult, setReadingResult] = useState<any>(null);
  const [latestDream, setLatestDream] = useState<any>(null);

  // --- 1. MİSAFİR FALINI YAKALAMA ---
  useEffect(() => {
    const processGuestReading = async () => {
      const pendingData = localStorage.getItem('pending_tarot_reading');
      
      if (pendingData) {
        try {
          const parsedData = JSON.parse(pendingData);
          setPhase('reading');
          
          const targetSpread = SPREAD_CONFIG.find(s => s.id === 'three_card') || SPREAD_CONFIG[1];
          setSelectedSpread(targetSpread);
          setIntention(parsedData.question);

          // İsimden kart objesini bul (Resim için)
          const guestCardNames = parsedData.cards.map((c: any) => c.name);
          const selectedCardsData = parsedData.cards.map((guestCard: any) => 
            TAROT_DECK.find(master => master.searchKey === guestCard.id || master.name.includes(guestCard.name)) || TAROT_DECK[0]
          );

          // --- API ÇAĞRISI ---
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
          console.error("Misafir falı hatası", error);
          setPhase('type_select');
        }
      }
    };

    processGuestReading();
  }, []);

  // --- RÜYA KONTROLÜ ---
 // --- RÜYA KONTROLÜ (DÜZELTİLMİŞ VERSİYON) ---
  useEffect(() => {
    const checkLatestDream = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // DÜZELTME: Sütun isimleri veritabanı şemasına göre güncellendi
        // Eski: .select('id, title, description, ai_response') -> HATALIYDI
        // Yeni: .select('id, dream_title, dream_text, ai_response') -> DOĞRU
        const { data, error } = await supabase
            .from('dreams')
            .select('id, dream_title, dream_text, ai_response') 
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(); // .single() yerine .maybeSingle() daha güvenlidir (hata fırlatmaz)

        if (error) {
            console.error("Rüya çekme hatası:", error);
            return;
        }

        if (data) {
             // UI'ın beklediği formata (title, description) dönüştürüyoruz
             setLatestDream({ 
                 id: data.id,
                 title: data.dream_title || "Adsız Rüya", // DB'den gelen dream_title
                 description: data.dream_text || data.ai_response?.summary // DB'den gelen dream_text
             });
        }
      } catch (e) {
        console.error("Beklenmeyen hata:", e);
      }
    };
    checkLatestDream();
  }, []);

  // --- YARDIMCI FONKSİYONLAR ---
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
    // 78 Kartlık desteyi karıştır
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
    
    // Seçilen kartların datalarını al (Resimler için)
    const selectedCardsData = indices.map(idx => TAROT_DECK[deckOrder[idx] % TAROT_DECK.length]);
    // AI'a sadece isimlerini gönderiyoruz
    const cardNames = selectedCardsData.map(c => c.name);
    
    let finalQuestion = intention;
    if (selectedSpread.id === 'dream_special' && latestDream) {
        finalQuestion += ` (RÜYA İÇERİĞİ: ${latestDream.description})`;
    }

    try {
        const result = await readTarot(finalQuestion, cardNames, selectedSpread.id, latestDream?.id || undefined);
        
        if (result.success) {
            // AI sonucuna, seçtiğimiz kartların resimlerini de ekliyoruz ki ekranda gösterebilelim
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

  // --- UI RENDER ---
  return (
    <div className={`min-h-screen bg-slate-950 text-slate-200 relative flex flex-col font-sans selection:bg-white/20 transition-colors duration-1000 pb-20 md:pb-0`}>
      
      {/* ARKAPLAN */}
      <div className={`fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${selectedSpread.theme.ambient} -z-10 transition-all duration-1000`} />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-black/50 to-transparent pointer-events-none -z-10" />

      {/* --- HEADER --- */}
      <nav className="w-full px-4 md:px-6 py-4 md:py-6 flex items-center justify-between max-w-7xl mx-auto z-50">
        <button 
            onClick={handleBackNavigation} 
            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-black/20 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all text-xs md:text-sm font-medium text-slate-400 hover:text-white backdrop-blur-sm"
        >
          <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
          <span>{phase === 'type_select' ? 'Dashboard' : 'Geri'}</span>
        </button>
        
        <div className="flex items-center gap-2 md:gap-3">
            <Sparkles className={`w-4 h-4 md:w-5 md:h-5 ${selectedSpread.theme.accent}`} />
            <span className="font-serif text-sm md:text-lg text-white tracking-widest uppercase">Mistik Tarot</span>
        </div>
        
        <div className="w-16 md:w-20"></div> 
      </nav>

      <main className="flex-1 flex flex-col items-center relative px-4 w-full max-w-7xl mx-auto mt-4 md:mt-8 overflow-x-hidden">
      
        {/* 1. AÇILIM TİPİ SEÇİMİ */}
        {phase === 'type_select' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                <div className="text-center mb-8 md:mb-12">
                    <h1 className="text-3xl md:text-5xl font-serif text-white mb-2 md:mb-4 drop-shadow-2xl">Rehberini Seç</h1>
                    <p className="text-slate-400 font-light text-sm md:text-lg flex items-center justify-center gap-2">
                        <Zap className="w-4 h-4 text-purple-400" /> Her açılım 2 Kredi değerindedir.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {SPREAD_CONFIG.map((spread) => {
                          const isLocked = spread.id === 'dream_special' && !latestDream;
                          return (
                            <motion.div 
                                key={spread.id}
                                whileHover={!isLocked ? { y: -8, scale: 1.02 } : {}}
                                onClick={() => !isLocked && handleSelectSpread(spread)}
                                className={`
                                    relative group cursor-pointer rounded-2xl md:rounded-3xl p-5 md:p-6 flex flex-col items-start justify-between min-h-[220px] md:min-h-[280px]
                                    border backdrop-blur-md transition-all duration-500 overflow-hidden
                                    ${spread.theme.bg} ${spread.theme.border} ${spread.theme.glow} hover:shadow-2xl
                                    ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                                `}
                            >
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay"></div>
                                <div className="relative z-10 w-full">
                                    <div className="flex justify-between items-start mb-4 md:mb-6">
                                        <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${spread.theme.iconBg} shadow-inner`}>
                                            {spread.id === 'dream_special' && isLocked ? <Lock className="w-5 h-5 md:w-6 md:h-6" /> : spread.icon}
                                        </div>
                                        <span className="text-[9px] md:text-[10px] font-mono tracking-widest text-slate-400 border border-white/5 px-2 py-1 rounded bg-black/20">
                                            {spread.count} KART
                                        </span>
                                    </div>
                                    <h3 className={`text-xl md:text-2xl font-serif text-white mb-1 md:mb-2 ${isLocked ? 'text-slate-400' : ''}`}>
                                        {spread.name}
                                    </h3>
                                    <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-light">
                                        {spread.desc}
                                    </p>
                                </div>
                                {spread.id === 'dream_special' && latestDream && (
                                     <div className="relative z-10 mt-3 md:mt-4 w-full pt-3 md:pt-4 border-t border-white/5">
                                          <p className="text-[10px] md:text-xs text-amber-500/80 truncate flex items-center gap-2">
                                               <Info className="w-3 h-3" /> Son: {latestDream.title}
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl mt-4 md:mt-8">
                <div className={`relative bg-black/40 border backdrop-blur-xl rounded-[2rem] p-6 md:p-10 text-center shadow-2xl ${selectedSpread.theme.border}`}>
                    <div className={`w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full flex items-center justify-center ${selectedSpread.theme.iconBg} animate-pulse`}>
                        {selectedSpread.icon}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-serif text-white mb-2 md:mb-3">Niyetine Odaklan</h2>
                    <p className="text-slate-400 text-xs md:text-sm mb-6 md:mb-8 font-light">
                        Zihnini boşalt ve sorunu evrene fısılda. Kartlar enerjine cevap verecek.
                    </p>
                    <textarea
                        value={intention}
                        onChange={(e) => setIntention(e.target.value)}
                        placeholder="Örn: Bu ilişkide beni neler bekliyor?"
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 md:p-5 text-white placeholder-slate-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 resize-none h-28 md:h-36 transition-all text-base md:text-lg font-light"
                        autoFocus
                    />
                    <button 
                        onClick={handleStartRitual}
                        disabled={!intention.trim()}
                        className="mt-6 md:mt-8 w-full py-3 md:py-4 rounded-xl font-bold text-base md:text-lg tracking-wide transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-white text-black hover:bg-slate-200 hover:scale-[1.02]"
                    >
                        Kartları Karıştır
                    </button>
                </div>
            </motion.div>
        )}

        {/* 3. KARIŞTIRMA */}
        {phase === 'shuffle' && (
            <div className="flex flex-col items-center justify-center h-[400px] md:h-[500px]">
                <div className="relative w-24 h-36 md:w-32 md:h-48">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                x: [0, 30, -30, 0],
                                rotate: [0, 5, -5, 0],
                                scale: [1, 1.05, 1]
                            }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                            className={`absolute inset-0 rounded-xl bg-slate-900 border border-white/10 shadow-2xl ${selectedSpread.theme.glow}`}
                            style={{ zIndex: i }}
                        >
                            <div className="w-full h-full flex items-center justify-center opacity-20">
                                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
                            </div>
                        </motion.div>
                    ))}
                </div>
                <p className="mt-8 md:mt-10 text-slate-300 text-xs md:text-sm font-mono tracking-[0.3em] animate-pulse">ENERJİ YÜKLENİYOR</p>
            </div>
        )}

        {/* 4. KART SEÇİMİ (Grid) */}
        {phase === 'spread' && (
            <div className="w-full flex flex-col items-center h-full">
                <div className="text-center py-4 md:py-6">
                      <h3 className="text-xl md:text-2xl font-serif text-white">Kartlarını Seç</h3>
                      <p className={`text-xs md:text-sm mt-1 md:mt-2 font-mono ${selectedSpread.theme.accent}`}>
                          {selectedIndices.length} / {selectedSpread.count} SEÇİLDİ
                      </p>
                </div>

                <div className="w-full max-w-6xl flex justify-center perspective-1000">
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 md:gap-3">
                        {deckOrder.map((deckIndex, i) => { 
                            const isSelected = selectedIndices.includes(i);
                            // Sadece Arka Yüzü Gösteriyoruz
                            const cardBack = TAROT_DECK[deckIndex % TAROT_DECK.length]; // Random data just for key

                            return (
                                <motion.div
                                    key={i}
                                    className="relative w-10 h-16 sm:w-14 sm:h-20 md:w-20 md:h-32 cursor-pointer"
                                    onClick={() => handleCardClick(i)}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.002 }}
                                >
                                    <motion.div
                                        className="w-full h-full relative preserve-3d transition-all duration-500"
                                        initial={false}
                                        animate={{ rotateY: isSelected ? 180 : 0, y: isSelected ? -20 : 0 }}
                                        style={{ transformStyle: "preserve-3d" }}
                                    >
                                        {/* ARKA YÜZ */}
                                        <div className={`absolute inset-0 backface-hidden rounded md:rounded-lg flex items-center justify-center shadow-md bg-slate-900 border border-white/10 ${isSelected ? 'ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' : ''}`}>
                                            <div className={`w-full h-full absolute bg-gradient-to-tr ${selectedSpread.theme.ambient} opacity-40`}></div>
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
            <div className="flex flex-col items-center justify-center mt-20 md:mt-32">
                <div className={`w-12 h-12 md:w-16 md:h-16 border-4 border-t-transparent rounded-full animate-spin ${selectedSpread.theme.accent.replace('text-', 'border-')}`}></div>
                <h2 className="text-lg md:text-2xl font-serif text-white mt-6 md:mt-8 animate-pulse text-center px-4">Kozmik Bağlantı Kuruluyor...</h2>
            </div>
        )}

        {/* 6. SONUÇ EKRANI (YENİLENMİŞ ARAYÜZ) */}
        {phase === 'result' && readingResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl mt-4 md:mt-6 pb-24 md:pb-20">
                
                {/* KEHANET ÖZETİ (BANNER) */}
                <div className={`mb-10 p-6 md:p-10 border rounded-[2.5rem] text-center bg-black/40 backdrop-blur-xl relative overflow-hidden ${selectedSpread.theme.border} shadow-2xl`}>
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent`}></div>
                    <Sparkles className={`w-8 h-8 mx-auto mb-4 ${selectedSpread.theme.accent}`} />
                    <p className="text-white italic text-lg md:text-2xl font-serif leading-relaxed px-4">
                       "{readingResult.summary}"
                    </p>
                </div>

                {/* DETAYLI KART ANALİZLERİ (LİSTE) */}
                <div className="grid grid-cols-1 gap-6 mb-12">
                   {readingResult.cards_analysis?.map((analysis: any, idx: number) => {
                      // Kart datası ile AI yorumunu eşleştir
                      const cardData = readingResult.selectedCardsData[idx];
                      
                      return (
                        <motion.div 
                           key={idx}
                           initial={{ opacity: 0, x: -30 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: idx * 0.2 }}
                           className="group flex flex-col md:flex-row gap-8 bg-[#0f172a]/40 border border-white/5 p-6 md:p-8 rounded-[2rem] hover:bg-[#1e293b]/50 transition-all duration-500 hover:border-white/10"
                        >
                           {/* Sol: Kart Görseli */}
                           <div className="w-full md:w-48 shrink-0 flex flex-col items-center">
                              <span className={`text-[10px] uppercase tracking-[0.2em] font-bold mb-4 bg-white/5 px-3 py-1 rounded-full ${selectedSpread.theme.accent}`}>
                                 {analysis.position}
                              </span>
                              <div className="w-32 md:w-full aspect-[2/3] rounded-xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] transform group-hover:scale-105 transition-transform duration-500 relative">
                                  {cardData ? (
                                    <img src={cardData.image} alt={cardData.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">?</div>
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <span className="text-white font-serif text-xs text-center px-2">{cardData?.name}</span>
                                  </div>
                              </div>
                           </div>

                           {/* Sağ: Kart Yorumu */}
                           <div className="flex-1 flex flex-col justify-center">
                              <h4 className="text-2xl font-serif text-white mb-3 text-center md:text-left">{analysis.card_name}</h4>
                              <div className={`w-12 h-1 mb-4 mx-auto md:mx-0 bg-gradient-to-r from-transparent via-current to-transparent ${selectedSpread.theme.accent.replace('text-', 'text-')}`}></div>
                              <p className="text-slate-300 text-sm md:text-lg leading-relaxed font-light text-justify italic">
                                 {analysis.meaning}
                              </p>
                           </div>
                        </motion.div>
                      );
                   })}
                </div>

                {/* GENEL SENTEZ VE TAVSİYE */}
                <div className="bg-[#020617]/80 border border-white/10 rounded-[2.5rem] p-8 md:p-14 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                    {/* Arkaplan Efekti */}
                    <div className={`absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br ${selectedSpread.theme.ambient} blur-[100px] opacity-30 pointer-events-none`}></div>

                    <h2 className="text-3xl font-serif text-white mb-8 border-b border-white/5 pb-6 flex items-center gap-4 relative z-10">
                        <Layers className={`w-7 h-7 ${selectedSpread.theme.accent}`} />
                        Kozmik Sentez
                    </h2>
                    
                    <div className="prose prose-invert max-w-none text-slate-300 leading-8 md:leading-10 font-light text-base md:text-xl text-justify mb-10 relative z-10">
                        <p>{readingResult.synthesis}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-white/5 relative z-10">
                        <div className="bg-white/5 p-6 md:p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                            <h4 className={`text-xs font-bold uppercase mb-4 flex items-center gap-2 ${selectedSpread.theme.accent}`}>
                                <Star className="w-4 h-4"/> Yol Gösterici Tavsiye
                            </h4>
                            <p className="text-slate-200 italic text-sm md:text-lg">"{readingResult.advice}"</p>
                        </div>
                        
                        <div>
                            <h4 className="text-slate-500 text-xs font-bold uppercase mb-4">Semboller</h4>
                            <div className="flex flex-wrap gap-3">
                                {readingResult.keywords?.map((kw: string, i: number) => (
                                    <span key={i} className="px-4 py-2 rounded-xl bg-white/5 text-xs text-slate-300 border border-white/5 font-medium tracking-wide">
                                        #{kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center relative z-10">
                        <button onClick={reset} className="w-full md:w-auto px-12 py-4 rounded-full bg-white text-black font-bold uppercase tracking-widest hover:scale-[1.02] hover:bg-slate-200 transition-all shadow-xl flex items-center justify-center gap-3 mx-auto">
                            <RefreshCcw className="w-4 h-4" /> Yeni Bir Yolculuk
                        </button>
                    </div>
                </div>

            </motion.div>
        )}

      </main>
    </div>
  );
}

// --- ANA EXPORT (SUSPENSE WRAPPER) ---
export default function TarotPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-serif">Kozmik veri yükleniyor...</div>}>
       <TarotPageContent />
    </Suspense>
  );
}