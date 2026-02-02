"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lock, Gift, ArrowRight, RefreshCcw } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { TAROT_DECK } from "@/utils/tarot-deck";

export default function TarotLandingClient() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  
  // YENİ: Ekran genişliğine göre hesaplama yapmak için state
  const [isMobile, setIsMobile] = useState(false);

  // Aşamalar
  const [phase, setPhase] = useState<'intro' | 'shuffle' | 'spread' | 'reading' | 'locked_result'>('intro');
  const [selectedCards, setSelectedCards] = useState<any[]>([]);
  
  // Kullanıcı kontrolü ve Ekran Boyutu İzleme
  useEffect(() => {
    const init = async () => {
      // 1. Kullanıcıyı çek
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // 2. Mobil kontrolü yap
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile(); // İlk açılışta kontrol et
      window.addEventListener('resize', checkMobile); // Ekran değişirse kontrol et
      return () => window.removeEventListener('resize', checkMobile);
    };
    init();
  }, [supabase]);

  // 1. KARIŞTIRMA BAŞLAT
  const handleStart = () => {
    setPhase('shuffle');
    setTimeout(() => {
      setPhase('spread');
    }, 2500);
  };

  // 2. KART SEÇME
  const handleCardPick = (index: number) => {
    if (selectedCards.length >= 3) return;
    
    const randomCard = TAROT_DECK[Math.floor(Math.random() * TAROT_DECK.length)];
    const newSelection = [...selectedCards, { ...randomCard, tempId: index }];
    setSelectedCards(newSelection);

    if (navigator && navigator.vibrate) navigator.vibrate(40);

    if (newSelection.length === 3) {
      setTimeout(() => setPhase('reading'), 800);
      setTimeout(() => setPhase('locked_result'), 3500);
    }
  };

  // 3. SONUCU KİLİTLEME
  const handleUnlockResult = (isLoggedIn: boolean) => {
    const cardsToTransfer = selectedCards.map(c => ({ 
        id: c.id, 
        name: c.name, 
        image: c.image 
    }));
    
    localStorage.setItem('pending_tarot_reading', JSON.stringify(cardsToTransfer));

    if (isLoggedIn) {
        router.push('/dashboard/tarot');
    } else {
        router.push('/auth?view=signup&next=/dashboard/tarot');
    }
  };

  return (
    <div className="relative w-full aspect-[4/3] md:aspect-video min-h-[450px] md:min-h-[550px] bg-[#020617] rounded-[1.5rem] md:rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col items-center justify-center p-2 md:p-4">
      
      {/* --- ARKA PLAN --- */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
      <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-purple-900/20 rounded-full blur-[80px] pointer-events-none"></div>
      
      {/* --- 1. AŞAMA: GİRİŞ (INTRO) --- */}
      {phase === 'intro' && (
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="relative z-10 text-center max-w-lg px-4">
           <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-gradient-to-tr from-[#fbbf24] to-amber-700 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(251,191,36,0.3)] animate-pulse-slow">
              <Sparkles className="w-8 h-8 text-white" />
           </div>
           <h2 className="text-2xl md:text-4xl font-serif font-bold text-white mb-4">Kartlar Seni Bekliyor</h2>
           <p className="text-gray-400 mb-8 text-sm md:text-base leading-relaxed max-w-sm mx-auto">
              Bilinçaltındaki soruyu odakla. Enerjini topla ve desteyi karıştırmaya başla.
           </p>
           <button 
             onClick={handleStart}
             className="group relative px-8 py-3 md:px-10 md:py-4 rounded-xl bg-white text-black font-bold text-base md:text-lg tracking-wide hover:scale-105 transition-all shadow-xl"
           >
              <span className="relative z-10 flex items-center gap-2">
                  Desteyi Karıştır <RefreshCcw className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-180 transition-transform duration-500" />
              </span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] blur opacity-50 group-hover:opacity-100 transition-opacity -z-10"></div>
           </button>
        </motion.div>
      )}

      {/* --- 2. AŞAMA: KARIŞTIRMA (SHUFFLE) --- */}
      {phase === 'shuffle' && (
        <div className="relative z-10 flex flex-col items-center">
           <div className="relative w-28 h-44 md:w-40 md:h-60"> {/* Mobilde biraz daha küçük */}
              {[...Array(5)].map((_, i) => (
                 <motion.div
                   key={i}
                   animate={{
                       x: [0, 40, -40, 0],
                       y: [0, -15, 15, 0],
                       rotate: [0, 10, -10, 0],
                       scale: [1, 1.05, 1]
                   }}
                   transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.05 }}
                   className="absolute inset-0 rounded-lg border border-[#fbbf24]/40 bg-gradient-to-br from-[#1e1b4b] to-[#020617] shadow-xl"
                   style={{ 
                       backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')",
                       zIndex: i 
                   }}
                 >
                     <div className="w-full h-full flex items-center justify-center opacity-30">
                        <Sparkles className="w-8 h-8 text-[#fbbf24]" />
                     </div>
                 </motion.div>
              ))}
           </div>
           <p className="mt-8 text-[#fbbf24] font-serif text-sm md:text-base tracking-widest animate-pulse">
              ENERJİ YÜKLENİYOR...
           </p>
        </div>
      )}

      {/* --- 3. AŞAMA: YELPAZE SEÇİMİ (SPREAD) - DÜZELTİLDİ --- */}
      {phase === 'spread' && (
         <div className="w-full h-full flex flex-col items-center justify-center py-2 relative">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center mb-2 absolute top-2 md:top-8 z-20">
               <h3 className="text-lg md:text-xl font-serif text-white">3 Kart Seç</h3>
               <p className="text-gray-500 text-xs">({selectedCards.length}/3)</p>
            </motion.div>

            {/* YELPAZE ALANI */}
            <div className="relative h-[160px] md:h-[220px] w-full max-w-3xl flex justify-center items-end perspective-1000 mt-8 md:mt-10">
               {[...Array(22)].map((_, i) => {
                  const isSelected = selectedCards.find(c => c.tempId === i);
                  
                  // MOBİL UYUMLU MATEMATİK
                  // Mobilde aralık (spread) daha dar (8px), Masaüstünde daha geniş (15px)
                  const spreadFactor = isMobile ? 8 : 15; 
                  
                  // Mobilde açı daha geniş olsun ki kartlar üst üste binse bile ayrışsın
                  const angleFactor = isMobile ? 3.5 : 3;

                  const angle = (i - 11) * angleFactor;
                  const yOffset = Math.abs(i - 11) * (isMobile ? 1.5 : 2);
                  
                  // Kart genişlikleri
                  const cardWidth = isMobile ? 64 : 96; // 64px (w-16) vs 96px (w-24)

                  if (isSelected) return null;

                  return (
                     <motion.div
                        key={i}
                        initial={{ y: 500, opacity: 0 }}
                        animate={{ y: yOffset, rotate: angle, opacity: 1 }}
                        transition={{ delay: i * 0.03, type: "spring" }}
                        whileHover={{ y: yOffset - 30, scale: 1.1, zIndex: 100 }}
                        onClick={() => handleCardPick(i)}
                        className="absolute w-16 h-28 md:w-24 md:h-40 bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border border-[#fbbf24]/30 rounded-lg shadow-[-2px_0_10px_rgba(0,0,0,0.5)] cursor-pointer origin-bottom transform-gpu hover:border-[#fbbf24] hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-colors"
                        style={{ 
                           // Burada dinamik hesaplama yapıyoruz
                           left: `calc(50% + ${(i - 11) * spreadFactor}px - ${cardWidth / 2}px)`, 
                           transformOrigin: "bottom center"
                        }}
                     >
                        <div className="w-full h-full flex items-center justify-center opacity-20">
                           <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-white" />
                        </div>
                     </motion.div>
                  )
               })}
            </div>

            {/* SEÇİLEN KARTLAR SLOTU */}
            <div className="flex gap-3 md:gap-6 mt-6 md:mt-12 z-20">
               {[0, 1, 2].map((slot) => {
                  const card = selectedCards[slot];
                  return (
                     <div key={slot} className="relative w-16 h-28 md:w-24 md:h-40 rounded-lg border border-dashed border-white/10 flex items-center justify-center bg-white/5">
                        {!card && <span className="text-white/20 text-lg md:text-xl font-serif">{slot + 1}</span>}
                        {card && (
                           <motion.div 
                              layoutId={`card-${card.tempId}`} 
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] rounded-lg border border-[#fbbf24] shadow-lg flex items-center justify-center"
                           >
                              <Sparkles className="w-6 h-6 text-[#fbbf24]" />
                           </motion.div>
                        )}
                     </div>
                  )
               })}
            </div>
         </div>
      )}

      {/* --- 4. AŞAMA: OKUMA (READING) --- */}
      {phase === 'reading' && (
         <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
               <div className="absolute inset-0 rounded-full border-t-2 border-[#fbbf24] animate-spin"></div>
               <div className="absolute inset-3 rounded-full border-t-2 border-purple-500 animate-spin-slow"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white animate-pulse" />
               </div>
            </div>
            <h3 className="mt-6 text-xl font-serif text-white">Yorumlanıyor...</h3>
         </div>
      )}

      {/* --- 5. AŞAMA: KİLİTLİ SONUÇ (LOCKED RESULT) --- */}
      {phase === 'locked_result' && (
         <motion.div initial={{opacity:0}} animate={{opacity:1}} className="w-full max-w-3xl z-10 flex flex-col items-center">
            
            {/* AÇILAN KARTLAR */}
            <div className="grid grid-cols-3 gap-2 md:gap-6 mb-4 md:mb-6 w-full px-2 md:px-4">
               {selectedCards.map((card, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ rotateY: 90 }}
                    animate={{ rotateY: 0 }}
                    transition={{ delay: idx * 0.2, duration: 0.5 }}
                    className="flex flex-col items-center"
                  >
                     <p className="text-[#fbbf24] text-[9px] md:text-[10px] font-bold tracking-widest uppercase mb-2">
                        {idx === 0 ? "Geçmiş" : idx === 1 ? "Şimdi" : "Gelecek"}
                     </p>
                     <div className="relative w-full aspect-[2/3] max-w-[100px] md:max-w-[120px] rounded-lg overflow-hidden shadow-lg border border-[#fbbf24]/40">
                        <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black to-transparent p-1 md:p-2 pt-6 text-center">
                           <span className="text-white font-serif text-[10px] md:text-sm">{card.name}</span>
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>

            {/* KİLİT KUTUSU VE CTA */}
            <div className="w-full bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden relative mx-2 md:mx-4 max-w-[90%]">
               
               <div className="p-4 md:p-8 filter blur-[5px] opacity-30 select-none pointer-events-none h-24 md:h-32 overflow-hidden">
                  <h3 className="text-xl md:text-2xl font-serif text-[#fbbf24] mb-2">Gizli Mesaj</h3>
                  <p className="text-gray-300 text-xs md:text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod...</p>
               </div>

               <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 text-center">
                  <h3 className="text-lg md:text-2xl font-serif font-bold text-white mb-1 md:mb-2">
                     Yorum Hazır
                  </h3>
                  <p className="text-gray-400 mb-3 md:mb-4 text-xs md:text-sm max-w-xs">
                     <span className="text-[#fbbf24] font-bold">1 Ücretsiz Hak</span> ile hemen oku.
                  </p>

                  {user ? (
                      <button 
                        onClick={() => handleUnlockResult(true)}
                        className="px-6 py-2 md:px-8 md:py-3 rounded-lg bg-white text-black font-bold text-xs md:text-sm hover:bg-gray-200 transition-colors shadow-lg flex items-center gap-2"
                      >
                         Sonucu Göster <ArrowRight className="w-4 h-4" />
                      </button>
                  ) : (
                      <button 
                        onClick={() => handleUnlockResult(false)}
                        className="px-6 py-2 md:px-8 md:py-3 rounded-lg bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black font-bold text-xs md:text-sm hover:scale-105 transition-transform shadow-lg flex items-center gap-2"
                      >
                         <Gift className="w-4 h-4" /> Kilidi Aç (Ücretsiz)
                      </button>
                  )}
               </div>
            </div>

         </motion.div>
      )}

    </div>
  );
}