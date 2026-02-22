"use client";

import { useState, useEffect, useRef } from "react";
import { X, Play, Loader2, Gift, CheckCircle2, Lock, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addRewardCredit, getAdStatus } from "@/app/actions/ad-actions";
import { toast } from "sonner";
import AdcashBanner from "@/components/AdcashBanner";

export default function RewardAdModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [canClaim, setCanClaim] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTabActive, setIsTabActive] = useState(true);
  
  const [adStatus, setAdStatus] = useState({ count: 0, remaining: 0, canWatch: true });
  const [checkingLimit, setCheckingLimit] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    refreshStatus();
    const handleVisibilityChange = () => setIsTabActive(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const refreshStatus = async () => {
    const status = await getAdStatus();
    setAdStatus(status);
    setCheckingLimit(false);
  };

  // OTOMATİK KREDİ YÜKLEME FONKSİYONU
  const handleAutoClaim = async () => {
    setLoading(true);
    try {
      const result = await addRewardCredit();
      if (result.success) {
        toast.success("Tebrikler! +1 Kredi eklendi 🎁");
        // Başarı mesajı görünsün diye 1.5 saniye bekleyip kapatıyoruz
        setTimeout(() => {
          setIsOpen(false);
          refreshStatus();
        }, 1500);
      } else {
        toast.error(result.message || "Kredi yüklenemedi.");
        setIsOpen(false);
      }
    } catch (err) {
      toast.error("Bağlantı hatası oluştu.");
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // SAYAÇ MANTIĞI
  useEffect(() => {
    if (isOpen && timeLeft > 0 && isTabActive && !canClaim) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    // SÜRE DOLDUĞUNDA OTOMATİK TETİKLE
    if (timeLeft === 0 && isOpen && !canClaim) {
      setCanClaim(true);
      handleAutoClaim(); // Manuel butona basmaya gerek kalmadan krediyi yükle
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, timeLeft, isTabActive, canClaim]);

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

  if (checkingLimit) return null;

  return (
    <>
      <button 
        onClick={handleOpen}
        disabled={!adStatus.canWatch}
        className={`group relative w-full overflow-hidden rounded-2xl p-5 text-left shadow-2xl border transition-all duration-300
            ${adStatus.canWatch 
                ? 'bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-900 border-white/20 hover:border-amber-400/50 cursor-pointer hover:scale-[1.02] active:scale-95' 
                : 'bg-gray-900/50 border-white/5 grayscale cursor-not-allowed opacity-70'}
        `}
      >
         <div className="absolute -top-2 -right-2 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Gift className="w-20 h-20 text-amber-400" />
         </div>
         <div className="relative z-10 flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:rotate-12 ${adStatus.canWatch ? 'bg-amber-400/20 text-amber-400' : 'bg-gray-800 text-gray-500'}`}>
                {adStatus.canWatch ? <Play className="w-7 h-7 fill-current" /> : <Lock className="w-7 h-7" />}
            </div>
            <div>
                <h3 className="font-serif font-bold text-white text-xl mb-1">
                    {adStatus.canWatch ? "Ücretsiz Kredi Kazan" : "Günlük Limit Doldu"}
                </h3>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-indigo-100 font-light">
                      {adStatus.canWatch ? "Kısa bir reklam izle, +1 hak kap." : "Yarın tekrar gelmeyi unutma."}
                  </p>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-widest uppercase ${adStatus.canWatch ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
                      {adStatus.remaining} HAKKIN VAR
                  </span>
                </div>
            </div>
         </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />

            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0a0a0a]/50">
                 <span className="text-sm font-bold text-white flex items-center gap-2 tracking-wide uppercase">
                    <Gift className="w-4 h-4 text-amber-400" /> Ödüllü Reklam
                 </span>
                 {!loading && (
                   <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                      <X className="w-5 h-5 text-gray-400" />
                   </button>
                 )}
              </div>

              <div className="p-8 flex-1 flex flex-col items-center min-h-[350px] justify-center">
                 <div className="w-full aspect-square max-w-[300px] bg-white/5 flex items-center justify-center rounded-3xl relative overflow-hidden shadow-2xl border border-white/5">
                    <AdcashBanner zoneId="10999954" /> 
                    
                    {!isTabActive && !canClaim && (
                        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center p-6 z-50 backdrop-blur-md">
                            <EyeOff className="w-12 h-12 text-amber-400 mb-4 animate-bounce" />
                            <p className="text-white font-bold text-lg mb-2">Süre Durduruldu!</p>
                            <p className="text-gray-400 text-sm">Ödül kazanmak için lütfen bu ekranda kalmaya devam edin.</p>
                        </div>
                    )}
                 </div>

                 {!canClaim && (
                    <div className="mt-10 w-full max-w-[300px]">
                        <div className="flex justify-between mb-3 px-1">
                            <span className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">{isTabActive ? "Kredi Hazırlanıyor" : "BEKLENİYOR"}</span>
                            <span className={`text-sm font-mono font-bold ${!isTabActive ? "text-red-500" : "text-white"}`}>{timeLeft}s</span>
                        </div>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden relative border border-white/5">
                            <motion.div 
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 15, ease: "linear" }}
                                key={isTabActive ? "active" : "paused"}
                                className={`h-full ${isTabActive ? 'bg-amber-400' : 'bg-red-500'}`}
                                style={{ animationPlayState: isTabActive ? 'running' : 'paused' }}
                            />
                        </div>
                    </div>
                 )}

                 {loading && (
                    <div className="mt-8 flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                        <p className="text-amber-400 text-xs font-bold uppercase tracking-widest">Kredi Hesabınıza Tanımlanıyor...</p>
                    </div>
                 )}
              </div>

              <div className="p-6 bg-[#0a0a0a]/30 border-t border-white/5">
                 <div className="text-center text-[10px] text-gray-500 font-medium uppercase tracking-widest opacity-50">
                    Süre bittiğinde modal otomatik kapanacaktır.
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}