"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lock, ArrowRight, RefreshCcw, Hand } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { TAROT_DECK } from "@/utils/tarot-deck"; // Senin kart datan

export default function TarotLandingClient() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // AŞAMALAR:
  // intention: Niyet Yazma
  // shuffle: Karıştırma (Görsel şov)
  // spread: Seçim Yapma
  // locked_result: Kartları gösterip kilidi açtırma
  const [phase, setPhase] = useState<'intention' | 'shuffle' | 'spread' | 'locked_result'>('intention');
  
  const [question, setQuestion] = useState("");
  const [selectedCards, setSelectedCards] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    };
    init();
  }, [supabase]);

  // 1. AŞAMA: NİYETİ ONAYLA VE KARIŞTIRMAYA GEÇ
  const handleIntentionSubmit = () => {
    if (!question.trim()) return;
    setPhase('shuffle');
    // 2.5 saniye karıştırma animasyonu
    setTimeout(() => {
      setPhase('spread');
    }, 2500);
  };

  // 2. AŞAMA: KART SEÇME
  const handleCardPick = (index: number) => {
    if (selectedCards.length >= 3) return;
    
    const randomCard = TAROT_DECK[Math.floor(Math.random() * TAROT_DECK.length)];
    // Kart çakışması kontrolü olmadan basit seçim (Demo için yeterli)
    const newSelection = [...selectedCards, { ...randomCard, tempId: index }];
    setSelectedCards(newSelection);

    if (navigator && navigator.vibrate) navigator.vibrate(40);

    // 3 Kart seçildi mi? Direkt Sonuca git (AI Beklemesi YOK)
    if (newSelection.length === 3) {
      setTimeout(() => setPhase('locked_result'), 1200); // Küçük bir es verip sonucu göster
    }
  };

  // 3. AŞAMA: KAYDET VE YÖNLENDİR
  const handleUnlockResult = (isLoggedIn: boolean) => {
    // Verileri paketle (Sadece kart ID'leri ve Soru yeterli)
    const readingData = {
        question: question,
        cards: selectedCards.map(c => ({ id: c.id, name: c.name, image: c.image })),
        date: new Date().toISOString()
    };
    
    // LocalStorage'a at
    localStorage.setItem('pending_tarot_reading', JSON.stringify(readingData));

    if (isLoggedIn) {
        // Zaten giriş yapmışsa direkt panele
        router.push('/dashboard/tarot?new=true'); 
    } else {
        // Giriş yapmamışsa Auth sayfasına
        router.push('/auth?view=signup&next=/dashboard/tarot');
    }
  };

  return (
    <div className="relative w-full min-h-[500px] md:min-h-[600px] bg-[#020617] rounded-[2rem] border border-[#fbbf24]/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col items-center justify-center p-4 transition-all duration-700">
      
      {/* Mistik Arkaplan */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
      <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>

      <AnimatePresence mode="wait">

        {/* --- PHASE 1: NİYET (INTENTION) --- */}
        {phase === 'intention' && (
           <motion.div 
             key="intention"
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
             className="relative z-10 w-full max-w-lg text-center"
           >
              <div className="w-20 h-20 mx-auto bg-[#fbbf24]/10 rounded-full flex items-center justify-center mb-6 border border-[#fbbf24]/30 shadow-[0_0_30px_rgba(251,191,36,0.1)]">
                 <Sparkles className="w-10 h-10 text-[#fbbf24]" />
              </div>

              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">Kartlara Ne Sormak İstersin?</h2>
              <p className="text-gray-400 mb-8 text-sm md:text-base">
                 Odaklan ve sorunu yaz. Kartlar senin enerjinle şekillenecek.
              </p>

              <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#fbbf24] to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <input 
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Örn: Kariyerimde yükseliş var mı?"
                    className="relative w-full bg-[#0f172a] text-white p-4 md:p-5 rounded-xl border border-white/10 outline-none focus:border-[#fbbf24] transition-colors text-center text-lg placeholder:text-gray-600"
                    onKeyDown={(e) => e.key === 'Enter' && handleIntentionSubmit()}
                  />
              </div>

              <button 
                 onClick={handleIntentionSubmit}
                 disabled={!question.trim()}
                 className="mt-8 px-10 py-4 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-xl flex items-center gap-2 mx-auto"
              >
                 Enerjini Gönder <ArrowRight className="w-5 h-5" />
              </button>
           </motion.div>
        )}

        {/* --- PHASE 2: KARIŞTIRMA (SHUFFLE) --- */}
        {phase === 'shuffle' && (
           <motion.div 
             key="shuffle"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="flex flex-col items-center justify-center z-10"
           >
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#fbbf24] font-serif text-xl md:text-2xl mb-12 text-center max-w-md italic"
              >
                "{question}"
              </motion.p>

              <div className="relative w-32 h-48">
                 {[...Array(5)].map((_, i) => (
                    <motion.div
                       key={i}
                       animate={{
                          x: [0, 60, -60, 0],
                          rotate: [0, 15, -15, 0],
                          scale: [1, 1.05, 1]
                       }}
                       transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                       className="absolute inset-0 bg-gradient-to-br from-[#2e1065] to-[#0f172a] rounded-xl border border-[#fbbf24]/30 shadow-2xl"
                       style={{ zIndex: i }}
                    >
                       <div className="w-full h-full flex items-center justify-center opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
                          <RefreshCcw className="w-8 h-8 text-[#fbbf24]" />
                       </div>
                    </motion.div>
                 ))}
              </div>
              <p className="mt-8 text-gray-400 text-sm tracking-widest animate-pulse uppercase">Kartlar Karılıyor...</p>
           </motion.div>
        )}

        {/* --- PHASE 3: SEÇİM (SPREAD) --- */}
        {phase === 'spread' && (
           <motion.div 
             key="spread"
             className="w-full h-full flex flex-col items-center justify-between py-4 z-10"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
           >
              <div className="text-center">
                 <h3 className="text-white font-serif text-xl mb-1">3 Kart Seç</h3>
                 <p className="text-gray-500 text-xs">Sorun: {question}</p>
              </div>

              {/* Yelpaze */}
              <div className="relative h-[200px] md:h-[240px] w-full flex justify-center items-end mt-4">
                 {[...Array(22)].map((_, i) => {
                    if (selectedCards.find(c => c.tempId === i)) return null; 
                    
                    const spread = isMobile ? 10 : 18;
                    const angle = (i - 11) * 3;
                    const x = (i - 11) * spread;
                    const y = Math.abs(i - 11) * 2;

                    return (
                       <motion.div
                          key={i}
                          initial={{ y: 500, opacity: 0 }}
                          animate={{ y: y, x: x, rotate: angle, opacity: 1 }}
                          transition={{ delay: i * 0.02, type: "spring" }}
                          whileHover={{ y: y - 40, scale: 1.1, zIndex: 50 }}
                          onClick={() => handleCardPick(i)}
                          className="absolute w-16 h-28 md:w-24 md:h-40 bg-gradient-to-br from-[#1e1b4b] to-[#020617] border border-white/20 rounded-lg cursor-pointer shadow-[-5px_0_15px_rgba(0,0,0,0.5)] hover:border-[#fbbf24] hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-colors origin-bottom"
                       >
                          <div className="w-full h-full flex items-center justify-center opacity-20 bg-[url('/tarot-back-pattern.png')] bg-cover"></div>
                       </motion.div>
                    )
                 })}
              </div>

              {/* Slotlar */}
              <div className="flex gap-4 mt-8">
                 {[0, 1, 2].map((slot) => (
                    <div key={slot} className="w-16 h-24 md:w-24 md:h-36 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center bg-white/5 relative">
                       {selectedCards[slot] ? (
                          <motion.div 
                            layoutId={`card-${selectedCards[slot].tempId}`}
                            className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] rounded-lg border border-[#fbbf24] flex items-center justify-center"
                          >
                             <Sparkles className="w-6 h-6 text-[#fbbf24]" />
                          </motion.div>
                       ) : (
                          <span className="text-white/20 font-serif">{slot + 1}</span>
                       )}
                    </div>
                 ))}
              </div>
           </motion.div>
        )}

        {/* --- PHASE 4: KİLİTLİ SONUÇ (AI'sız, Sadece Merak) --- */}
        {phase === 'locked_result' && (
           <motion.div 
             key="locked_result" 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="w-full max-w-4xl z-10 flex flex-col items-center justify-center px-4"
           >
              {/* Başlık */}
              <div className="mb-8 text-center">
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">Kartların Açıldı</h3>
                  <p className="text-gray-400 text-sm">Bu 3 kartın kombinasyonu kaderin hakkında ne söylüyor?</p>
              </div>

              {/* KARTLAR (Face Up) */}
              <div className="flex justify-center gap-3 md:gap-8 mb-8 w-full">
                 {selectedCards.map((card, i) => (
                    <motion.div 
                      key={i}
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      transition={{ delay: i * 0.3, type: "spring", stiffness: 100 }}
                      className="relative w-24 h-40 md:w-36 md:h-60 rounded-xl overflow-hidden shadow-2xl border border-[#fbbf24]/50 group transform hover:-translate-y-2 transition-transform duration-300"
                    >
                       {/* Kart Resmi */}
                       <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                       
                       {/* İsim Etiketi */}
                       <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2 pt-8 text-center">
                          <p className="text-[#fbbf24] text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-0.5">
                            {i === 0 ? "Geçmiş" : i === 1 ? "Şimdi" : "Gelecek"}
                          </p>
                          <p className="text-white font-serif text-xs md:text-sm font-bold truncate">
                            {card.name}
                          </p>
                       </div>
                    </motion.div>
                 ))}
              </div>

              {/* KİLİTLİ ANALİZ KUTUSU */}
              <div className="w-full max-w-2xl bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl">
                 
                 {/* Blurlu Arka Plan Metni (Merak Unsuru) */}
                 <div className="p-6 md:p-8 opacity-30 filter blur-[4px] grayscale select-none space-y-3 pointer-events-none">
                    <h4 className="text-xl font-serif text-[#fbbf24] mb-2">Gizli Anlam</h4>
                    <p className="text-sm">Seçtiğiniz kartlar arasındaki enerji akışı, özellikle {selectedCards[1]?.name} kartının etkisiyle...</p>
                    <div className="w-full h-3 bg-gray-500 rounded"></div>
                    <div className="w-2/3 h-3 bg-gray-500 rounded"></div>
                    <div className="w-3/4 h-3 bg-gray-500 rounded"></div>
                 </div>

                 {/* Üst Katman (Kilit ve Buton) */}
                 <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent p-6 text-center">
                    
                    <div className="w-14 h-14 bg-[#fbbf24]/20 rounded-full flex items-center justify-center mb-3 border border-[#fbbf24]/30 animate-pulse-slow">
                        <Lock className="w-6 h-6 text-[#fbbf24]" />
                    </div>
                    
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2">Detaylı Analiz Hazır</h3>
                    <p className="text-gray-400 text-xs md:text-sm mb-6 max-w-sm">
                       Bu kartların aşk, kariyer ve gelecek üzerindeki etkilerini öğrenmek için sonucunu kaydet.
                    </p>

                    {user ? (
                       <button 
                         onClick={() => handleUnlockResult(true)}
                         className="px-8 py-3 rounded-xl bg-white text-black font-bold text-sm md:text-base hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2"
                       >
                          Yorumu Görüntüle <ArrowRight className="w-4 h-4" />
                       </button>
                    ) : (
                       <button 
                         onClick={() => handleUnlockResult(false)}
                         className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black font-bold text-sm md:text-base hover:scale-105 transition-transform shadow-[0_0_20px_rgba(251,191,36,0.4)] flex items-center gap-2"
                       >
                          Ücretsiz Kilidi Aç ve Oku <ArrowRight className="w-4 h-4" />
                       </button>
                    )}
                 </div>
              </div>

           </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}