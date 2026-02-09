"use client";

import { useState, useEffect, useRef } from "react";
import { X, Play, Loader2, Gift, CheckCircle2, Lock, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addRewardCredit, getAdStatus } from "@/app/actions/ad-actions";
import AdUnit from "@/components/AdUnit";
import { toast } from "sonner";

export default function RewardAdModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15); // 15 Saniye Sabit
  const [canClaim, setCanClaim] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTabActive, setIsTabActive] = useState(true);
  
  // Limit State'leri
  const [adStatus, setAdStatus] = useState({ count: 0, remaining: 0, canWatch: true });
  const [checkingLimit, setCheckingLimit] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    refreshStatus();

    // Sekme Görünürlüğünü Takip Et (Anti-Cheat)
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const refreshStatus = async () => {
    const status = await getAdStatus();
    setAdStatus(status);
    setCheckingLimit(false);
  };

  // SAYAÇ MANTIĞI
  useEffect(() => {
    if (isOpen && timeLeft > 0 && isTabActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    if (timeLeft === 0) {
      setCanClaim(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, timeLeft, isTabActive]);

  const handleOpen = () => {
    if (!adStatus.canWatch) {
        toast.info("Günlük limitin doldu. Yarın tekrar gel! 👋");
        return;
    }
    setIsOpen(true);
    setTimeLeft(15);
    setCanClaim(false);
  };

  const handleClose = () => {
    if (!canClaim && timeLeft > 0) {
      if (!confirm("Reklamı kapatırsan ödül kazanamazsın. Emin misin?")) return;
    }
    setIsOpen(false);
  };

  const handleClaim = async () => {
    setLoading(true);
    
    const result = await addRewardCredit();
    
    if (result.success) {
      toast.success("Tebrikler! +1 Kredi Hesabına Eklendi 🎁");
      setIsOpen(false);
      refreshStatus(); 
    } else {
      toast.error(result.message || "Bir hata oluştu.");
    }
    setLoading(false);
  };

  if (checkingLimit) return null;

  return (
    <>
      {/* TETİKLEYİCİ BUTON */}
      <button 
        onClick={handleOpen}
        disabled={!adStatus.canWatch}
        className={`group relative w-full overflow-hidden rounded-xl p-4 text-left shadow-lg border transition-all
            ${adStatus.canWatch 
                ? 'bg-gradient-to-r from-indigo-900 to-purple-900 border-white/10 hover:border-[#fbbf24]/50 cursor-pointer' 
                : 'bg-gray-900/50 border-white/5 grayscale cursor-not-allowed opacity-70'}
        `}
      >
         <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Gift className="w-16 h-16 text-[#fbbf24]" />
         </div>
         <div className="relative z-10 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${adStatus.canWatch ? 'bg-[#fbbf24]/20 text-[#fbbf24]' : 'bg-gray-800 text-gray-500'}`}>
                {adStatus.canWatch ? <Play className="w-6 h-6 fill-current" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
                <h3 className="font-bold text-white text-lg">
                    {adStatus.canWatch ? "Ücretsiz Kredi Kazan" : "Günlük Limit Doldu"}
                </h3>
                <p className="text-xs text-gray-300 flex items-center gap-2">
                    {adStatus.canWatch 
                        ? `Kısa bir reklam izle, +1 kredi kap.` 
                        : `Yarın tekrar gelip kredi kazanabilirsin.`}
                    
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${adStatus.canWatch ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {adStatus.remaining} Hakkın Kaldı
                    </span>
                </p>
            </div>
         </div>
      </button>

      {/* MODAL PENCERESİ */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
            {/* Arka Plan */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl z-10 flex flex-col max-h-[85vh]" // Yükseklik sınırlaması eklendi
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#0a0a0a] shrink-0">
                 <span className="text-sm font-bold text-white flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#fbbf24]" /> Sponsorlu İçerik
                 </span>
                 <button onClick={handleClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                 </button>
              </div>

              {/* Reklam Alanı (Scroll Edilebilir) */}
              <div className="p-6 bg-black flex-1 overflow-y-auto flex flex-col items-center relative min-h-[300px]">
                 
                 {/* REKLAM BİRİMİ - ESNEK (AUTO) */}
                 {/* ID: 1616603760 */}
                 <div className="w-full min-h-[250px] bg-white/5 flex items-center justify-center rounded-lg relative">
                    <AdUnit slot="1616603760" format="auto" />
                    
                    {/* SEKME PASİF UYARISI (Reklamın üzerine biner) */}
                    {!isTabActive && !canClaim && (
                        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center p-4 z-50 backdrop-blur-sm rounded-lg border border-red-500/30">
                            <EyeOff className="w-10 h-10 text-[#fbbf24] mb-3 animate-bounce" />
                            <p className="text-white font-bold text-base">Süre Duraklatıldı ⏸️</p>
                            <p className="text-gray-400 text-xs mt-1">Ödülü kazanmak için bu pencereden ayrılma.</p>
                        </div>
                    )}
                 </div>

                 {/* Süre Sayacı */}
                 {!canClaim && (
                    <div className="mt-6 flex flex-col items-center gap-2 w-full max-w-[300px] shrink-0">
                        <div className="flex justify-between w-full text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                            <span>{isTabActive ? "Ödül Yükleniyor" : "Bekleniyor..."}</span>
                            <span className={!isTabActive ? "text-red-500" : "text-white"}>{timeLeft}sn</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden relative">
                            <motion.div 
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 15, ease: "linear" }}
                                key={isTabActive ? "active" : "paused"}
                                className={`h-full ${isTabActive ? 'bg-[#fbbf24]' : 'bg-red-500'}`}
                                style={{ animationPlayState: isTabActive ? 'running' : 'paused' }}
                            />
                        </div>
                        {!isTabActive && (
                            <p className="text-[10px] text-red-400 font-bold animate-pulse">Lütfen sekmeyi terk etmeyin!</p>
                        )}
                    </div>
                 )}
              </div>

              {/* Footer (Sabit) */}
              <div className="p-4 border-t border-white/5 bg-[#0a0a0a] shrink-0">
                 <button
                    onClick={handleClaim}
                    disabled={!canClaim || loading}
                    className={`
                        w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                        ${canClaim 
                            ? 'bg-[#fbbf24] hover:bg-[#f59e0b] text-black cursor-pointer shadow-[0_0_20px_rgba(251,191,36,0.4)]' 
                            : 'bg-white/5 text-gray-500 cursor-not-allowed'}
                    `}
                 >
                    {loading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Yükleniyor...</>
                    ) : canClaim ? (
                        <><CheckCircle2 className="w-5 h-5" /> Ödülü Al (+1 Kredi)</>
                    ) : (
                        <><Play className="w-5 h-5" /> Lütfen Bekleyin ({timeLeft})</>
                    )}
                 </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}