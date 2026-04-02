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
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDream = localStorage.getItem("pending_dream");
      if (savedDream && status === 'IDLE') {
        setDreamText(savedDream);
        setHasPendingDream(true);
      }
    }
  }, [status, setDreamText]); 

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'LOADING') {
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2500); 
    }
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (textareaRef.current) {
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
    <div className="flex-1 flex flex-col w-full relative transition-colors duration-500 mb-10 antialiased">
      
      {/* ================= YARIM KALAN RÜYA UYARISI ================= */}
      <AnimatePresence>
        {hasPendingDream && status === 'IDLE' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }} 
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
             <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm dark:shadow-md transition-colors">
                <div className="flex items-center gap-4 text-center md:text-left">
                   <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-full shrink-0 mx-auto md:mx-0 transition-colors">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                   </div>
                   <div>
                      <h4 className="text-amber-900 dark:text-amber-400 font-bold text-sm transition-colors">Bekleyen Bir Analiziniz Var</h4>
                      <p className="text-amber-700/80 dark:text-amber-500/80 text-xs mt-1 transition-colors">Önceki oturumunuzdan kalan rüyanızı çözümlemek için kilidi açın.</p>
                   </div>
                </div>
                <button 
                   onClick={handleStartAnalysis}
                   className="w-full md:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-colors shrink-0 shadow-sm"
                >
                   <Unlock className="w-4 h-4" /> Analizi Başlat
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= DİNAMİK EDİTÖR (Çift Temaya Kusursuz Uyumlu) ================= */}
      <div 
        className={`w-full relative bg-white dark:bg-[#131722] rounded-3xl border transition-all duration-300 flex flex-col overflow-hidden ${
          isFocused 
            ? 'border-emerald-400 dark:border-emerald-500/50 shadow-lg dark:shadow-[0_0_30px_rgba(16,185,129,0.15)] ring-4 ring-emerald-500/10 dark:ring-emerald-500/5' 
            : 'border-stone-200 dark:border-white/10 shadow-sm dark:shadow-md'
        }`}
      >
        
        {/* Üst Bilgi Çubuğu */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-white/5 bg-stone-50 dark:bg-[#0a0c10]/50 transition-colors">
           <div className="flex items-center gap-2 text-stone-500 dark:text-slate-400">
              <PenLine className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Rüya Günlüğü</span>
           </div>
           <div className="text-[10px] font-mono font-bold text-stone-400 dark:text-slate-500 bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 px-3 py-1.5 rounded-md shadow-sm transition-colors">
              {dreamText.length} KARAKTER
           </div>
        </div>

        {/* Metin Alanı (Premium Yazı Tipi) */}
        <textarea 
          ref={textareaRef}
          value={dreamText}
          onChange={(e) => setDreamText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={status !== 'IDLE' || hasPendingDream} 
          placeholder="Rüyanız nerede başladı? Renkler, sesler veya hissettiğiniz o ilk duygu neydi..."
          className={`w-full bg-transparent text-lg md:text-xl text-stone-800 dark:text-slate-200 placeholder-stone-400 dark:placeholder-slate-600 font-serif border-none outline-none resize-none leading-[1.8] p-6 md:p-8 min-h-[160px] overflow-hidden transition-all ${
            status === 'COMPLETED' ? 'blur-[2px] opacity-40' : 'opacity-100'
          } ${hasPendingDream ? 'text-stone-400 dark:text-slate-500 blur-[1px]' : ''}`}
        ></textarea>
        
        {/* ================= ALT KONTROL PANELİ ================= */}
        {status === 'IDLE' && !hasPendingDream && (
          <div className="px-6 py-5 bg-stone-50 dark:bg-[#0a0c10]/50 border-t border-stone-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
            
            {/* Ses Kayıt Butonu */}
            <button 
              onClick={() => setIsRecording(!isRecording)} 
              className={`flex items-center justify-center w-full md:w-auto gap-2.5 px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm ${
                isRecording 
                  ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 animate-pulse" 
                  : "bg-white dark:bg-[#131722] text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200 border border-stone-200 dark:border-white/10 hover:border-stone-300 dark:hover:border-white/20"
              }`}
            >
              {isRecording ? <PauseCircle className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isRecording ? "Sizi Dinliyorum..." : "Sesli Aktar"}</span>
            </button>

            {/* Çözümle Butonu (Güçlü ve Otoriter Zümrüt Yeşili) */}
            <button 
              onClick={onAnalyze} 
              disabled={!dreamText.trim()}
              className="w-full md:w-auto flex items-center justify-center gap-2.5 px-10 py-3.5 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-bold text-sm uppercase tracking-widest transition-all hover:bg-emerald-700 dark:hover:bg-emerald-400 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 shadow-md hover:shadow-lg"
            >
              <span>Yorumla</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================= YÜKLENİYOR (LOADING - Çift Tema) ================= */}
        {status === 'LOADING' && (
          <div className="absolute inset-0 z-10 bg-white/90 dark:bg-[#0a0c10]/90 backdrop-blur-sm flex items-center justify-center transition-all duration-500 rounded-3xl">
            <div className="flex flex-col items-center gap-6 px-4 text-center">
              
              <div className="relative flex items-center justify-center w-20 h-20">
                 <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                 <div className="relative bg-white dark:bg-[#131722] p-4 rounded-full border border-emerald-100 dark:border-emerald-500/30 shadow-md transition-colors">
                    <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
                 </div>
              </div>
              
              <div className="h-6 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingTextIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.4 }}
                    className="text-emerald-800 dark:text-emerald-300 text-sm font-bold tracking-wide uppercase transition-colors"
                  >
                    {loadingMessages[loadingTextIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAMAMLANDI OVELAY ================= */}
        {status === 'COMPLETED' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-stone-100/50 dark:bg-[#0a0c10]/60 backdrop-blur-sm rounded-3xl transition-colors">
            <motion.button 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={onReset}
              className="px-8 py-4 rounded-full bg-white dark:bg-[#131722] border border-stone-200 dark:border-white/10 text-stone-700 dark:text-slate-300 font-bold uppercase tracking-widest hover:text-stone-900 dark:hover:text-white hover:shadow-md dark:hover:bg-white/5 transition-all flex items-center gap-3 text-xs shadow-sm"
            >
              <RefreshCw className="w-4 h-4" /> Yeni Bir Rüya Temizle
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}