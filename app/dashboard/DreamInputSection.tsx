"use client";

import { Mic, PauseCircle, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

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
  "Bilinçaltı taranıyor...", "Semboller analiz ediliyor...", 
  "Yıldız haritası hizalanıyor...", "Kader işaretleri okunuyor..."
];

export default function DreamInputSection({ 
  dreamText, setDreamText, status, onAnalyze, isRecording, setIsRecording, onReset 
}: Props) {
  return (
    <div className="flex-1 flex flex-col w-full relative transition-all duration-700 mb-8 md:mb-12">
      
      {/* Bilgilendirme - Mobilde font küçültüldü */}
      <div className="mb-3 md:mb-4 flex items-center gap-2 px-1">
        <div className="w-1 h-6 md:h-8 bg-gradient-to-b from-[#8b5cf6] to-transparent rounded-full"></div>
        <p className="text-xs md:text-sm text-gray-400 leading-snug max-w-2xl">
          <span className="text-white font-bold">İpucu:</span> Rüyanı ne kadar detaylı anlatırsan, analiz o kadar keskin olur.
        </p>
      </div>

      <div className="w-full relative group rounded-[1.5rem] md:rounded-[2rem] p-[1px] bg-gradient-to-br from-white/20 via-white/5 to-transparent shadow-2xl">
        <div className="relative bg-[#0a0a0a] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden min-h-[250px] md:min-h-[300px] flex flex-col">
          
          <textarea 
            value={dreamText}
            onChange={(e) => setDreamText(e.target.value)}
            disabled={status !== 'IDLE'} 
            placeholder="Dün gece gördüklerini buraya dök..."
            // MOBİL İYİLEŞTİRME: p-5 (mobilde daha geniş alan), text-base (okunabilirlik)
            className={`w-full flex-1 bg-transparent text-base md:text-xl text-white placeholder-gray-600 font-medium font-sans border-none outline-none resize-none leading-relaxed tracking-wide p-5 pb-20 md:p-8 md:pb-20 scrollbar-thin scrollbar-thumb-[#8b5cf6]/20 scrollbar-track-transparent ${status === 'COMPLETED' ? 'blur-sm opacity-50' : 'opacity-100'}`}
          ></textarea>
          
          {/* Kontroller */}
          {status === 'IDLE' && (
            // MOBİL İYİLEŞTİRME: bottom-3 (klavyeye daha az yapışık), padding ayarları
            <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4 flex justify-between items-center bg-black/60 md:bg-black/40 backdrop-blur-md p-1.5 md:p-2 rounded-xl md:rounded-2xl border border-white/10 md:border-white/5">
              
              {/* Ses Kayıt Butonu */}
              <button 
                onClick={() => setIsRecording(!isRecording)} 
                className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl text-xs font-bold transition-all ${isRecording ? "bg-red-500/20 text-red-500 animate-pulse" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
              >
                {isRecording ? <PauseCircle className="w-5 h-5 md:w-5 md:h-5" /> : <Mic className="w-5 h-5 md:w-5 md:h-5" />}
                <span className="hidden md:inline">{isRecording ? "Dinleniyor..." : "Sesli Anlat"}</span>
              </button>

              <span className="text-[10px] text-gray-600 font-mono hidden md:block">{dreamText.length} karakter</span>

              {/* Analiz Butonu */}
              <button 
                onClick={onAnalyze} 
                disabled={!dreamText.trim()}
                className="px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-[10px] md:text-xs uppercase tracking-wider shadow-lg hover:shadow-violet-500/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Yorumla <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          )}

          {/* Yükleniyor */}
          {status === 'LOADING' && (
            <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 md:gap-4 px-4 text-center">
                <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-[#fbbf24] animate-spin" />
                <p className="text-[#fbbf24] text-xs md:text-sm font-bold animate-pulse uppercase tracking-widest">Kahinler Odaklanıyor...</p>
              </div>
            </div>
          )}

          {/* Tamamlandı (Reset Butonu) */}
          {status === 'COMPLETED' && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
              <motion.button 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={onReset}
                className="px-6 py-3 md:px-8 md:py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold backdrop-blur-md shadow-2xl hover:bg-white/20 hover:scale-105 transition-all flex items-center gap-2 md:gap-3 text-sm md:text-base"
              >
                <RefreshCw className="w-4 h-4 md:w-5 md:h-5" /> Yeni Rüya
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}