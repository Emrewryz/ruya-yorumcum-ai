"use client";

import { useEffect, useState, useRef } from "react";
import { Mic, PauseCircle, Sparkles, Loader2, RefreshCw, AlertCircle, Unlock, PenLine } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  dreamText: string;
  setDreamText: (text: string) => void;
  status: 'IDLE' | 'LOADING' | 'COMPLETED';
  onAnalyze: () => void;
  isRecording: boolean;
  setIsRecording: (val: boolean) => void;
  onReset: () => void;
}

const loadingMessages = [
  "Bilinçaltı katmanlarına iniliyor...", 
  "Sembolik bağlar çözümleniyor...", 
  "Arketipler haritalandırılıyor...", 
  "Mesajınız derleniyor..."
];

export default function DreamInputSection({ 
  dreamText, setDreamText, status, onAnalyze, isRecording, setIsRecording, onReset 
}: Props) {

  const [hasPendingDream, setHasPendingDream] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  
  // Metin kutusunun otomatik uzaması için referans
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sayfa yüklendiğinde hafızadaki rüyayı kontrol et
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDream = localStorage.getItem("pending_dream");
      if (savedDream && status === 'IDLE') {
        setDreamText(savedDream);
        setHasPendingDream(true);
      }
    }
  }, [status, setDreamText]); 

  // Loading animasyonu metin geçişleri
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'LOADING') {
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2500); 
    }
    return () => clearInterval(interval);
  }, [status]);

  // Metin kutusunun içeriğe göre otomatik boyutlanması
  useEffect(() => {
    if (textareaRef.current) {
      // Önce yüksekliği auto yapıp sonra içindeki metnin yüksekliğine (scrollHeight) eşitliyoruz
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [dreamText]);

  const handleStartAnalysis = () => {
    setHasPendingDream(false);
    localStorage.removeItem("pending_dream"); 
    onAnalyze(); 
  };

  return (
    <div className="flex-1 flex flex-col w-full relative transition-all duration-700 mb-10">
      
      {/* ================= YARIM KALAN RÜYA UYARISI ================= */}
      <AnimatePresence>
        {hasPendingDream && status === 'IDLE' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }} 
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
             <div className="p-5 rounded-2xl bg-[#131722] border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(251,191,36,0.05)]">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-amber-500/10 rounded-full shrink-0">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                   </div>
                   <div>
                      <h4 className="text-slate-200 font-medium text-sm">Bekleyen Bir Analiziniz Var</h4>
                      <p className="text-slate-500 text-xs mt-1">Önceki oturumunuzdan kalan rüyanızı çözümlemek için kilidi açın.</p>
                   </div>
                </div>
                <button 
                   onClick={handleStartAnalysis}
                   className="w-full md:w-auto px-6 py-2.5 bg-gradient-to-t from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-[#0B0F19] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shrink-0 shadow-lg border border-amber-300/50"
                >
                   <Unlock className="w-4 h-4" /> Analizi Başlat (1 Kredi)
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= DİNAMİK EDİTÖR (Otomatik Büyüyen) ================= */}
      <div 
        className={`w-full relative bg-[#0a0c10]/80 backdrop-blur-2xl rounded-3xl border transition-all duration-500 flex flex-col overflow-hidden ${
          isFocused ? 'border-amber-500/40 shadow-[0_0_40px_rgba(251,191,36,0.1)]' : 'border-white/10 shadow-2xl'
        }`}
      >
        
        {/* Üst Bilgi Çubuğu */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#131722]/30">
           <div className="flex items-center gap-2 text-amber-500/80">
              <PenLine className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Rüya Günlüğü</span>
           </div>
           <div className="text-[10px] font-mono text-slate-500 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
              {dreamText.length} KARAKTER
           </div>
        </div>

        {/* Metin Alanı (Kısa Başlar, Yazdıkça Aşağı Uzar) */}
        {/* min-h-[140px] ile derli toplu başladık, overflow-hidden scroll bar çıkmasını engeller, kutu uzar */}
        <textarea 
          ref={textareaRef}
          value={dreamText}
          onChange={(e) => setDreamText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={status !== 'IDLE' || hasPendingDream} 
          placeholder="Rüyanız nerede başladı? Renkler, sesler veya hissettiğiniz o ilk duygu neydi..."
          className={`w-full bg-transparent text-lg md:text-xl text-slate-200 placeholder-slate-700 font-serif border-none outline-none resize-none leading-[1.8] p-6 md:p-8 min-h-[160px] overflow-hidden transition-all ${
            status === 'COMPLETED' ? 'blur-[2px] opacity-40' : 'opacity-100'
          } ${hasPendingDream ? 'text-slate-500 blur-[1px]' : ''}`}
        ></textarea>
        
        {/* ================= ALT KONTROL PANELİ ================= */}
        {status === 'IDLE' && !hasPendingDream && (
          <div className="px-6 py-4 bg-[#131722]/50 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Ses Kayıt */}
            <button 
              onClick={() => setIsRecording(!isRecording)} 
              className={`flex items-center justify-center w-full md:w-auto gap-2.5 px-5 py-3 rounded-xl text-xs font-bold transition-all ${
                isRecording 
                  ? "bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse" 
                  : "bg-[#0a0c10] text-slate-400 hover:text-slate-200 border border-white/5 hover:border-white/10 shadow-inner"
              }`}
            >
              {isRecording ? <PauseCircle className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isRecording ? "Sizi Dinliyorum..." : "Sesli Aktar"}</span>
            </button>

            {/* Çözümle Butonu (Derinlikli ve Parlak Amber) */}
            <button 
              onClick={onAnalyze} 
              disabled={!dreamText.trim()}
              className="w-full md:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 text-[#0a0c10] font-extrabold text-sm transition-all hover:from-amber-200 hover:to-amber-400 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none shadow-[0_4px_20px_rgba(251,191,36,0.25)] hover:shadow-[0_8px_30px_rgba(251,191,36,0.4)] border border-amber-200/50"
            >
              <span>Yorumla</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================= YÜKLENİYOR (LOADING) ================= */}
        {status === 'LOADING' && (
          <div className="absolute inset-0 z-10 bg-[#0a0c10]/90 backdrop-blur-md flex items-center justify-center transition-all duration-500">
            <div className="flex flex-col items-center gap-8 px-4 text-center">
              
              <div className="relative flex items-center justify-center w-20 h-20">
                 <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                 <div className="absolute inset-2 bg-amber-500/30 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                 <div className="relative bg-[#131722] p-4 rounded-full border border-amber-500/40 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                    <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                 </div>
              </div>
              
              <div className="h-6 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingTextIndex}
                    initial={{ opacity: 0, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(4px)' }}
                    transition={{ duration: 0.5 }}
                    className="text-amber-400/80 text-sm font-medium tracking-wide"
                  >
                    {loadingMessages[loadingTextIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAMAMLANDI ================= */}
        {status === 'COMPLETED' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0c10]/40 backdrop-blur-sm">
            <motion.button 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={onReset}
              className="px-8 py-3.5 rounded-xl bg-[#131722]/90 border border-white/10 text-slate-200 font-medium hover:text-white hover:border-amber-500/30 hover:bg-[#131722] shadow-2xl transition-all flex items-center gap-3 text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Yeni Bir Rüya Temizle
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}