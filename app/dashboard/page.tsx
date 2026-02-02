"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Moon, Sparkles, Crown } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { analyzeDream } from "@/app/actions/analyze-dream";
import { getMoonPhase } from "@/utils/moon"; 
import { toast } from "sonner"; 

import Sidebar from "./Sidebar"; 
import DreamInputSection from "./DreamInputSection";
import AnalysisResults from "./AnalysisResults";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const resultRef = useRef<HTMLDivElement>(null); 

  // State
  const [profile, setProfile] = useState<any>(null);
  const [dreamText, setDreamText] = useState("");
  const [greeting, setGreeting] = useState("Merhaba"); 
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'COMPLETED'>('IDLE');
  const [analysisResult, setAnalysisResult] = useState<any>(null); 
  const [currentDreamId, setCurrentDreamId] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentMoon, setCurrentMoon] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      setCurrentMoon(getMoonPhase());
      const h = new Date().getHours();
      setGreeting(h < 12 ? "Günaydın" : h < 17 ? "Tünaydın" : "İyi Akşamlar");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (prof) setProfile(prof);

      const savedId = localStorage.getItem('saved_dream_id');
      if (savedId) {
        const { data: d } = await supabase.from('dreams').select('*').eq('id', savedId).single();
        if (d) {
          setDreamText(d.dream_text);
          setAnalysisResult(d.ai_response);
          setCurrentDreamId(d.id);
          setStatus('COMPLETED');
          setGeneratedImage(d.image_url);
        }
      }
    };
    init();
  }, [supabase]);

  const handleAnalyze = async () => {
    if (!dreamText.trim()) return;
    setStatus('LOADING');
    const result = await analyzeDream(dreamText);
    if (result.success) {
      setAnalysisResult(result.data.ai_response);
      setCurrentDreamId(result.data.id);
      setStatus('COMPLETED');
      localStorage.setItem('saved_dream_id', result.data.id);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      toast.error(result.error);
      setStatus('IDLE');
    }
  };

  const handleReset = () => {
    setDreamText(""); setAnalysisResult(null); setStatus('IDLE');
    localStorage.removeItem('saved_dream_id');
  };

  const userTier = profile?.subscription_tier?.toLowerCase() || 'free';

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans relative flex flex-col md:flex-row">
      
      {/* SİDEBAR (Masaüstü için solda sabit, mobil için layout.tsx içinde MobileNav var varsayıyoruz) */}
      <Sidebar activeTab="dream" />

      {/* İÇERİK ALANI */}
      {/* MOBİL: pb-24 (Alt menü payı), pl-0 */}
      {/* DESKTOP: pb-0, pl-20 (Sidebar payı) */}
      <main className="flex-1 relative z-10 w-full min-h-screen md:pl-20 pb-24 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 md:px-12 py-6 md:py-8 flex flex-col min-h-screen">
          
          {/* HEADER */}
          <header className="flex justify-between items-start md:items-center mb-6 md:mb-10">
            <div>
              {/* MOBİL: Text-2xl, DESKTOP: Text-4xl */}
              <h1 className="font-serif text-2xl md:text-4xl text-white tracking-tight leading-tight">
                {greeting}, <br className="md:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] to-[#f59e0b]">
                    {profile?.full_name?.split(' ')[0] || "Yolcu"}
                </span>
              </h1>
              <p className="text-gray-400 text-xs md:text-sm mt-1 md:mt-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-[#fbbf24]" /> Bilinçaltın bugün ne fısıldadı?
              </p>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
               {/* Tier Badge */}
               <button onClick={() => router.push('/dashboard/pricing')} className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold text-[10px] md:text-xs uppercase whitespace-nowrap">
                 <Crown className="w-3 h-3 md:w-4 md:h-4 text-[#fbbf24]" /> {userTier}
               </button>
               
               {/* AY BUTONU - MOBİL UYUMLU */}
               {/* Mobilde: Sadece İkon | Masaüstünde: Detaylı */}
               <button 
                 onClick={() => router.push('/dashboard/ay-takvimi')}
                 className="flex items-center gap-0 md:gap-4 bg-white/5 border border-white/10 p-2 md:px-5 md:py-2 rounded-full backdrop-blur-md hover:bg-white/10 hover:border-[#fbbf24]/50 transition-all group"
               >
                 <div className="text-lg md:text-2xl group-hover:scale-110 transition-transform">
                    {currentMoon?.icon || "🌕"}
                 </div>
                 {/* Sadece masaüstünde görünen metin */}
                 <div className="hidden md:flex flex-col items-start text-left">
                     <span className="text-xs font-bold text-[#fbbf24] uppercase group-hover:text-[#fcd34d] transition-colors">{currentMoon?.phase || "Ay Fazı"}</span>
                     <span className="text-[10px] text-gray-400">Enerji: %{currentMoon?.percentage || "..."}</span>
                 </div>
               </button>
            </div>
          </header>

          {/* RÜYA GİRİŞ */}
          <DreamInputSection 
            dreamText={dreamText} setDreamText={setDreamText} 
            status={status} onAnalyze={handleAnalyze} onReset={handleReset}
            isRecording={isRecording} setIsRecording={setIsRecording}
          />

          {/* SONUÇLAR */}
          <div ref={resultRef}>
            <AnimatePresence>
              {status === 'COMPLETED' && analysisResult && (
                <AnalysisResults 
                  result={analysisResult} 
                  userTier={userTier} 
                  currentDreamId={currentDreamId} 
                  generatedImage={generatedImage}
                  onDownloadImage={() => {}} 
                />
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>
    </div>
  );
}