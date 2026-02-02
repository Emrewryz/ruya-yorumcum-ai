"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Eye, Moon } from "lucide-react";

// --- TİPLER VE DEMO VERİ ---
type TarotCard = {
  id: number;
  name: string;
  image: string; // Kartın ön yüzü
  meaning: string;
};

// Demo Tarot Kartları (Dijital Art Tarzı)
const TAROT_DECK: TarotCard[] = [
  { 
    id: 1, 
    name: "THE TOWER (KULE)", 
    image: "https://images.unsplash.com/photo-1519681393784-d8e5b5a4570e?q=80&w=1000&auto=format&fit=crop", // Yıkım/Fırtına görseli
    meaning: "Rüyandaki 'yüksekten düşme' teması, bu kartın getirdiği *yıkım enerjisiyle* doğrudan örtüşüyor. Kule kartı, hayatındaki o *kaçınılmaz değişimi* artık direnerek durduramayacağını söylüyor. Yıkılana tutunmayı bırak, temeli sağlam yeni bir yapı inşa etme zamanı."
  },
  { 
    id: 2, 
    name: "THE MOON (AY)", 
    image: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?q=80&w=1000&auto=format&fit=crop", // Mistik Ay
    meaning: "Bilinçaltın şu an *sisli bir yolda* yürüyor. Rüyandaki belirsiz figürler, Ay kartının temsil ettiği *yanılsamalarla* eşleşiyor. İçgüdülerine güvenmelisin, çünkü gözlerin seni yanıltabilir ama ruhun gerçeği biliyor."
  },
  { 
    id: 3, 
    name: "DEATH (ÖLÜM)", 
    image: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=1000&auto=format&fit=crop", // Yeniden Doğuş/Karanlık
    meaning: "Korkma, bu fiziksel bir son değil. Rüyandaki vedalaşma sahnesi, hayatında bir *dönemin kapanışını* müjdeliyor. Eski sen ölüyor, *daha güçlü bir versiyonun* doğmak üzere. Bu dönüşümü kucakla."
  }
];

interface TarotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TarotModal({ isOpen, onClose }: TarotModalProps) {
  const [step, setStep] = useState<'CHOICE' | 'REVEAL' | 'INTERPRETATION'>('CHOICE');
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [revealedCard, setRevealedCard] = useState<TarotCard | null>(null);
  const [streamedText, setStreamedText] = useState("");
  
  // Modal açıldığında state'leri sıfırla
  useEffect(() => {
    if (isOpen) {
      setStep('CHOICE');
      setSelectedCardId(null);
      setRevealedCard(null);
      setStreamedText("");
    }
  }, [isOpen]);

  // Kart Seçimi ve Ritüel Başlangıcı
  const handleCardSelect = (id: number) => {
    if (step !== 'CHOICE') return;
    
    setSelectedCardId(id);
    setStep('REVEAL');

    // Rastgele bir kart "belirle" (Simülasyon)
    const randomCard = TAROT_DECK[Math.floor(Math.random() * TAROT_DECK.length)];
    
    setTimeout(() => {
      setRevealedCard(randomCard);
      // Flashbang sonrası yorum aşamasına geç
      setTimeout(() => {
        setStep('INTERPRETATION');
      }, 1500);
    }, 1000); // Kart dönme süresi
  };

  // Daktilo Efekti (Streaming Text)
  useEffect(() => {
    if (step === 'INTERPRETATION' && revealedCard) {
      let index = 0;
      const text = revealedCard.meaning;
      const interval = setInterval(() => {
        setStreamedText(text.slice(0, index + 1));
        index++;
        if (index > text.length) clearInterval(interval);
      }, 30); // Yazma hızı
      return () => clearInterval(interval);
    }
  }, [step, revealedCard]);

  // Kelimeleri Highlight Etme (Örn: *kelime* -> Altın Renk)
  const renderStyledText = (text: string) => {
    const parts = text.split('*');
    return parts.map((part, i) => 
      i % 2 === 1 ? <span key={i} className="text-[#fbbf24] font-bold glow-gold">{part}</span> : part
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          
          {/* 1. ARKA PLAN KARARTMA (OVERLAY) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl transition-all"
          />

          {/* KAPAT BUTONU */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 md:top-8 md:right-8 text-gray-500 hover:text-white transition-colors z-[110]"
          >
            <X className="w-6 h-6 md:w-8 md:h-8" />
          </button>

          {/* ANA MODAL ALANI */}
          <div className="relative z-[105] w-full max-w-5xl flex flex-col items-center justify-center min-h-[500px] md:min-h-[600px]">
            
            {/* BAŞLIK (Sadece Seçim Anında) */}
            {step === 'CHOICE' && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8 md:mb-12"
              >
                <h2 className="font-serif text-2xl md:text-3xl text-white tracking-widest">
                  KADERİNİ SEÇ
                </h2>
                <span className="block text-[10px] md:text-xs text-[#8b5cf6] mt-2 font-sans tracking-[0.5em]">ENERJİ HİZALANDI</span>
              </motion.div>
            )}

            {/* KARTLAR ALANI - MOBİL UYUMLU BOYUTLAR */}
            <div className="flex items-center justify-center gap-3 md:gap-12 h-[300px] md:h-[400px] perspective-1000 w-full">
              {[1, 2, 3].map((cardId) => {
                // Seçilmeyen kartlar yok olsun
                if (step !== 'CHOICE' && selectedCardId !== cardId) return null;

                const isSelected = selectedCardId === cardId;

                return (
                  <motion.div
                    key={cardId}
                    layoutId={isSelected ? "selected-card" : undefined}
                    onClick={() => handleCardSelect(cardId)}
                    initial={{ opacity: 0, y: 50 }}
                    animate={
                      isSelected 
                      ? { 
                          x: 0, y: 0, scale: 1.1, rotateY: 180, zIndex: 50,
                          transition: { duration: 1, ease: "easeInOut" }
                        }
                      : { 
                          opacity: 1, y: 0, 
                          // Süzülme Animasyonu (Idle)
                          translateY: [0, -10, 0],
                          rotateZ: [-1, 1, -1],
                          transition: { 
                            y: { duration: 0.5 },
                            translateY: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: cardId * 0.2 },
                            rotateZ: { repeat: Infinity, duration: 6, ease: "easeInOut" }
                          }
                        }
                    }
                    exit={{ opacity: 0, scale: 0, filter: "blur(10px)" }}
                    whileHover={step === 'CHOICE' ? { 
                      scale: 1.05, 
                      y: -20,
                      boxShadow: "0 0 30px rgba(251, 191, 36, 0.6)",
                    } : {}}
                    // MOBİL İÇİN w-28 h-44, MASAÜSTÜ İÇİN w-48 h-80
                    className={`relative w-28 h-44 md:w-48 md:h-80 rounded-xl md:rounded-2xl cursor-pointer preserve-3d transition-shadow duration-500 group ${step === 'CHOICE' ? 'shadow-[0_0_15px_rgba(139,92,246,0.2)]' : ''}`}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* --- KARTIN ARKASI (Mistik Desen) --- */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rounded-xl md:rounded-2xl overflow-hidden bg-[#0f172a] border border-[#fbbf24]/30">
                        {/* Gold Foil Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a]"></div>
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        
                        {/* Ortadaki Logo */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="w-12 h-12 md:w-20 md:h-20 rounded-full border border-[#fbbf24]/50 flex items-center justify-center mb-2 group-hover:border-[#fbbf24] group-hover:shadow-[0_0_20px_#fbbf24] transition-all">
                             <Moon className="w-6 h-6 md:w-10 md:h-10 text-[#fbbf24]" />
                          </div>
                          <div className="h-[1px] w-8 md:w-12 bg-[#fbbf24]/50"></div>
                        </div>
                        
                        {/* Kenar Dumanı (Glow) */}
                        <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(139,92,246,0.2)] group-hover:shadow-[inset_0_0_40px_rgba(251,191,36,0.2)] transition-shadow duration-500"></div>
                    </div>

                    {/* --- KARTIN ÖNÜ (Reveal Sonrası) --- */}
                    <div 
                      className="absolute inset-0 w-full h-full backface-hidden rounded-xl md:rounded-2xl overflow-hidden bg-black border-2 border-white/10"
                      style={{ transform: "rotateY(180deg)" }}
                    >
                        {revealedCard && (
                          <>
                            <img src={revealedCard.image} alt="Tarot" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                            <div className="absolute bottom-3 md:bottom-4 left-0 right-0 text-center px-1">
                              <h3 className="font-serif text-sm md:text-xl font-bold text-white tracking-widest uppercase truncate px-2">{revealedCard.name}</h3>
                            </div>
                            
                            {/* Işık Patlaması (Flashbang Efekti) */}
                            <motion.div 
                              initial={{ opacity: 1 }}
                              animate={{ opacity: 0 }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                              className="absolute inset-0 bg-white z-50 pointer-events-none"
                            />
                          </>
                        )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* AŞAMA 3: KEHANETİN OKUNMASI (CAM PANEL) */}
            {step === 'INTERPRETATION' && revealedCard && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 md:mt-12 w-full max-w-2xl bg-black/40 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl relative overflow-hidden"
              >
                 {/* Başlık */}
                 <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 text-[#fbbf24]">
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                    <h3 className="font-serif text-xs md:text-sm tracking-widest uppercase">Rüya ve Kartın Sentezi</h3>
                 </div>

                 {/* Daktilo Metni */}
                 <p className="text-sm md:text-lg text-gray-300 leading-relaxed font-light min-h-[100px]">
                    {renderStyledText(streamedText)}
                    <span className="inline-block w-1.5 h-4 md:h-5 bg-[#fbbf24] ml-1 animate-pulse align-middle"></span>
                 </p>

                 {/* Alt Dekor */}
                 <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent opacity-50"></div>
              </motion.div>
            )}

          </div>
        </div>
      )}
    </AnimatePresence>
  );
}